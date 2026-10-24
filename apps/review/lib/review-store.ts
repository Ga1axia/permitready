import { create } from 'zustand'
import type { Unit } from './node-info'
import type { PdfLink } from './pdf-links'

/** A violation finding's position on a PDF page. */
export type ViolationMarker = {
  /** Finding id, e.g. "duplex-001". */
  findingId: string
  /** IFC GlobalId of the primary element. */
  globalId: string
  /** 1-based PDF page. */
  page: number
  /** Normalized x position (0–1, from left). */
  x: number
  /** Normalized y position (0–1, from top). */
  y: number
  /** Whether this is the single active/focused finding. */
  active: boolean
}

/** Default: others are 70% see-through while an element is selected. */
export const DEFAULT_FOCUS_SEE_THROUGH = 70

/** PDF pane width as a fraction of the stage (3D takes the rest). */
export const DEFAULT_PDF_SPLIT = 0.42

type ReviewState = {
  /** Bumped to ask the camera inside the Canvas to frame a node (or the whole model). */
  focusRequest: { nodeId: string | null; seq: number }
  focusNode: (nodeId: string | null) => void
  /** Dolly the orbit camera. factor < 1 zooms in, > 1 zooms out. */
  zoomRequest: { factor: number; seq: number }
  zoomBy: (factor: number) => void
  /** null = all floors stacked; otherwise floors above this level are hidden. */
  isolatedLevelId: string | null
  setIsolatedLevelId: (id: string | null) => void
  unit: Unit
  setUnit: (unit: Unit) => void
  /**
   * How see-through the grayed-out context is when something is selected
   * (0 = gray but opaque, 100 = fully invisible). Default 70.
   */
  focusSeeThrough: number
  setFocusSeeThrough: (percent: number) => void

  /** Side-by-side PDF drawing pane. */
  pdfOpen: boolean
  setPdfOpen: (open: boolean) => void
  /** Object URL for the loaded PDF (revoked on replace/clear). */
  pdfUrl: string | null
  pdfName: string | null
  setPdf: (url: string | null, name: string | null) => void
  /** PDF pane share of the stage width, 0.2–0.8. */
  pdfSplit: number
  setPdfSplit: (ratio: number) => void
  /** Element ↔ page-rect links for bidirectional highlight. */
  pdfLinks: PdfLink[]
  setPdfLinks: (links: PdfLink[]) => void
  addPdfLink: (link: PdfLink) => void
  removePdfLink: (id: string) => void
  /** When true, drag on the PDF draws a link for the current 3D selection. */
  pdfLinking: boolean
  setPdfLinking: (on: boolean) => void
  /** Page to show (1-based); bumped when a 3D selection has a link. */
  pdfPage: number
  setPdfPage: (page: number) => void
  /** Highlight pulse token — PDF pane scrolls/flashes when 3D selects a linked element. */
  pdfFocusSeq: number
  bumpPdfFocus: () => void

  /**
   * Scene node ids whose meshes should receive a red violation emissive overlay.
   * Set by CodeCheckPanel when a rule or finding is activated; cleared when the
   * panel is dismissed or the active rule changes.
   */
  violationIds: ReadonlyArray<string>
  setViolationIds: (ids: ReadonlyArray<string>) => void

  /**
   * Violation point markers for the PDF pane — one per failing finding that
   * has sheet coordinates. Rendered as red crosshairs on the relevant page.
   */
  violationMarkers: ReadonlyArray<ViolationMarker>
  setViolationMarkers: (markers: ReadonlyArray<ViolationMarker>) => void
}

export const useReview = create<ReviewState>((set, get) => ({
  focusRequest: { nodeId: null, seq: 0 },
  focusNode: (nodeId) => set((s) => ({ focusRequest: { nodeId, seq: s.focusRequest.seq + 1 } })),
  zoomRequest: { factor: 1, seq: 0 },
  zoomBy: (factor) => set((s) => ({ zoomRequest: { factor, seq: s.zoomRequest.seq + 1 } })),
  isolatedLevelId: null,
  setIsolatedLevelId: (isolatedLevelId) => set({ isolatedLevelId }),
  unit: 'imperial',
  setUnit: (unit) => set({ unit }),
  // Focus starts off; toggling it on restores DEFAULT_FOCUS_SEE_THROUGH.
  focusSeeThrough: 0,
  setFocusSeeThrough: (percent) =>
    set({ focusSeeThrough: Math.min(95, Math.max(0, Math.round(percent))) }),

  pdfOpen: false,
  setPdfOpen: (pdfOpen) => set({ pdfOpen }),
  pdfUrl: null,
  pdfName: null,
  setPdf: (url, name) => {
    const prev = get().pdfUrl
    if (prev && prev !== url) URL.revokeObjectURL(prev)
    set({ pdfUrl: url, pdfName: name, pdfOpen: url != null, pdfPage: 1 })
  },
  pdfSplit: DEFAULT_PDF_SPLIT,
  setPdfSplit: (ratio) => set({ pdfSplit: Math.min(0.8, Math.max(0.2, ratio)) }),
  pdfLinks: [],
  setPdfLinks: (pdfLinks) => set({ pdfLinks }),
  addPdfLink: (link) =>
    set((s) => ({
      pdfLinks: [...s.pdfLinks.filter((l) => l.globalId !== link.globalId), link],
    })),
  removePdfLink: (id) => set((s) => ({ pdfLinks: s.pdfLinks.filter((l) => l.id !== id) })),
  pdfLinking: false,
  setPdfLinking: (pdfLinking) => set({ pdfLinking }),
  pdfPage: 1,
  setPdfPage: (pdfPage) => set({ pdfPage: Math.max(1, pdfPage) }),
  pdfFocusSeq: 0,
  bumpPdfFocus: () => set((s) => ({ pdfFocusSeq: s.pdfFocusSeq + 1 })),

  violationIds: [],
  setViolationIds: (violationIds) => set({ violationIds }),

  violationMarkers: [],
  setViolationMarkers: (violationMarkers) => set({ violationMarkers }),
}))
