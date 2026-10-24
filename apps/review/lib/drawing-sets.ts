import { create } from 'zustand'
import { type PdfLink, parsePdfLinks } from './pdf-links'
import { useReview } from './review-store'

/**
 * The generated drawing set for a sample building, as written by
 * scripts/make_drawings.py to public/reference/<building>/drawings/index.json.
 */
export type DrawingSheet = {
  number: string
  title: string
  kind: 'cover' | 'plan' | 'schedule'
  /** The IFC storey a plan sheet shows; null for other sheets. */
  storey: string | null
  /** 1-based page in the combined drawing-set PDF. */
  page: number
  pdf: string
  svg: string
  links: string | null
  hotspots: number
}

export type DrawingSetIndex = {
  version: 1
  building: string
  title: string
  paper: string
  scale: string
  set: { pdf: string; links: string; pages: number }
  sheets: DrawingSheet[]
}

export function drawingsBase(buildingId: string): string {
  return `/reference/${buildingId}/drawings/`
}

const indexes = new Map<string, Promise<DrawingSetIndex | null>>()

/** The building's drawing-set index, or null when none has been generated. */
export function fetchDrawingSet(buildingId: string): Promise<DrawingSetIndex | null> {
  let pending = indexes.get(buildingId)
  if (!pending) {
    pending = fetch(`${drawingsBase(buildingId)}index.json`)
      .then(async (res) => (res.ok ? ((await res.json()) as DrawingSetIndex) : null))
      .catch(() => null)
      .then((index) => {
        // Look again next time if the set hasn't been generated yet.
        if (!index) indexes.delete(buildingId)
        return index
      })
    indexes.set(buildingId, pending)
  }
  return pending
}

type DrawingSetState = {
  /** The set shown in the PDF pane, if the pane holds a generated set. */
  open: DrawingSetIndex | null
  setOpen: (index: DrawingSetIndex | null) => void
}

export const useDrawingSet = create<DrawingSetState>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
}))

/** Load the set's combined PDF and its hotspots into the PDF pane. */
export async function openDrawingSet(index: DrawingSetIndex, page?: number): Promise<void> {
  const base = drawingsBase(index.building)
  let links: PdfLink[] = []
  try {
    const res = await fetch(base + index.set.links)
    if (res.ok) links = parsePdfLinks(await res.json())
  } catch {
    // The PDF still opens without hotspots.
  }
  const firstPlan = index.sheets.find((s) => s.kind === 'plan')?.page ?? 1
  const review = useReview.getState()
  review.setPdf(base + index.set.pdf, `${index.title} drawing set`)
  review.setPdfLinks(links)
  review.setPdfPage(page ?? firstPlan)
  useDrawingSet.getState().setOpen(index)
}

export function sheetOnPage(index: DrawingSetIndex | null, page: number): DrawingSheet | undefined {
  return index?.sheets.find((s) => s.page === page)
}

/** Plan sheet for an IFC storey name (e.g. "Level 1"), if the set has one. */
export function planSheetForStorey(
  index: DrawingSetIndex | null,
  storey: string | null | undefined,
): DrawingSheet | undefined {
  if (!index || !storey) return undefined
  return index.sheets.find((s) => s.kind === 'plan' && s.storey === storey)
}

/** 1-based page numbers of floor-plan sheets in the open set. */
export function planPagesOf(index: DrawingSetIndex | null): Set<number> {
  return new Set((index?.sheets ?? []).filter((s) => s.kind === 'plan').map((s) => s.page))
}
