'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { FileStack } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  type DrawingSetIndex,
  drawingsBase,
  fetchDrawingSet,
  openDrawingSet,
  planSheetForStorey,
  sheetOnPage,
  useDrawingSet,
} from '@/lib/drawing-sets'
import { levelName } from '@/lib/node-info'
import { useReview } from '@/lib/review-store'

/**
 * Sits above the PDF pane: opens the current building's generated drawing
 * set, picks a sheet, and keeps floors ↔ plan sheets in step.
 */
export function DrawingSetBar({ buildingId }: { buildingId: string | null }) {
  const [available, setAvailable] = useState<DrawingSetIndex | null>(null)
  const open = useDrawingSet((s) => s.open)
  const pdfUrl = useReview((s) => s.pdfUrl)
  const pdfOpen = useReview((s) => s.pdfOpen)
  const page = useReview((s) => s.pdfPage)
  const isolatedLevelId = useReview((s) => s.isolatedLevelId)
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>

  // Find this building's set. If a set is already showing, switch it to this
  // building's (or close it when this building has none).
  useEffect(() => {
    let cancelled = false
    if (!buildingId) {
      setAvailable(null)
      return
    }
    fetchDrawingSet(buildingId).then((index) => {
      if (cancelled) return
      setAvailable(index)
      const showing = useDrawingSet.getState().open
      if (showing && showing.building !== buildingId) {
        if (index) void openDrawingSet(index)
        else {
          useDrawingSet.getState().setOpen(null)
          useReview.getState().setPdf(null, null)
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [buildingId])

  // An empty pane on a sample building shows its drawing set straight away.
  useEffect(() => {
    if (pdfOpen && !pdfUrl && available) void openDrawingSet(available)
  }, [pdfOpen, pdfUrl, available])

  // A PDF the user opened by hand replaces the set.
  useEffect(() => {
    const showing = useDrawingSet.getState().open
    if (showing && pdfUrl !== drawingsBase(showing.building) + showing.set.pdf) {
      useDrawingSet.getState().setOpen(null)
    }
  }, [pdfUrl])

  // Turning to a plan sheet shows that floor in 3D.
  const sheet = sheetOnPage(open, page)
  useEffect(() => {
    if (sheet?.kind !== 'plan' || !sheet.storey) return
    const level = Object.values(nodes).find(
      (n) => n.type === 'level' && levelName(n) === sheet.storey,
    )
    if (level && useReview.getState().isolatedLevelId !== level.id) {
      useReview.getState().setIsolatedLevelId(level.id)
    }
  }, [sheet, nodes])

  // Picking a floor in 3D jumps to that floor's plan PDF.
  useEffect(() => {
    if (!open || !pdfOpen || !isolatedLevelId) return
    const level = nodes[isolatedLevelId]
    if (level?.type !== 'level') return
    const plan = planSheetForStorey(open, levelName(level))
    if (plan && useReview.getState().pdfPage !== plan.page) {
      useReview.getState().setPdfPage(plan.page)
    }
  }, [isolatedLevelId, open, pdfOpen, nodes])

  if (!available) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-rule border-b bg-paper px-3 py-1.5 text-[11px] text-ink-faint">
        <FileStack className="size-3.5 shrink-0" />
        <span className="truncate">
          {buildingId
            ? `No drawing set for this model yet. Run bun run drawings ${buildingId} in apps/review.`
            : 'Drawing sets are available for the sample buildings.'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-rule border-b bg-paper px-2 py-1.5">
      <FileStack className="size-3.5 shrink-0 text-ink-soft" />
      {open ? (
        <label className="flex min-w-0 flex-1 items-center gap-2">
          <span className="sr-only">Sheet</span>
          <select
            className="h-7 min-w-0 flex-1 rounded-md border border-rule bg-panel px-1.5 text-xs focus:border-accent focus:outline-none"
            id="drawing-sheet"
            onChange={(e) => useReview.getState().setPdfPage(Number(e.target.value))}
            value={sheet?.page ?? page}
          >
            {open.sheets.map((s) => (
              <option key={s.number} value={s.page}>
                {s.number} · {s.title}
                {s.hotspots ? ` · ${s.hotspots} linked` : ''}
              </option>
            ))}
          </select>
          <span className="hidden shrink-0 font-mono text-[10px] text-ink-faint sm:inline">
            {open.scale} · {open.paper}
          </span>
        </label>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-ink-soft text-xs">
            {available.title}: {available.sheets.length} sheets, linked to the model
          </span>
          <button
            className="h-7 shrink-0 rounded-md bg-accent px-2.5 font-medium text-white text-xs hover:bg-accent/90"
            onClick={() => openDrawingSet(available)}
            type="button"
          >
            Open drawing set
          </button>
        </>
      )}
    </div>
  )
}
