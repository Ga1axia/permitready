'use client'

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useReview } from '@/lib/review-store'

/**
 * Horizontal split: PDF on the left, 3D on the right, with a drag handle.
 * Ratio is stored in the review store so it survives panel toggles.
 */
export function SplitStage({
  left,
  right,
  enabled,
}: {
  left: ReactNode
  right: ReactNode
  /** When false, only `right` fills the stage. */
  enabled: boolean
}) {
  const split = useReview((s) => s.pdfSplit)
  const setSplit = useReview((s) => s.setPdfSplit)
  const shell = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      const el = shell.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width < 1) return
      setSplit((e.clientX - rect.left) / rect.width)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, setSplit])

  if (!enabled) {
    return <div className="relative min-h-0 min-w-0 flex-1 bg-stage">{right}</div>
  }

  const leftPct = `${(split * 100).toFixed(2)}%`

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 bg-stage" ref={shell}>
      <section
        aria-label="Drawings"
        className="relative flex min-h-0 min-w-0 flex-col overflow-hidden border-rule border-r"
        style={{ width: leftPct }}
      >
        <div className="pointer-events-none absolute bottom-2 left-2 z-[2] rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] text-panel uppercase tracking-[0.14em] backdrop-blur-sm">
          Drawings
        </div>
        {left}
      </section>
      <div
        aria-orientation="vertical"
        aria-valuemax={80}
        aria-valuemin={20}
        aria-valuenow={Math.round(split * 100)}
        className={[
          'group relative z-10 w-1.5 shrink-0 cursor-col-resize bg-rule-strong/70 transition-colors',
          'hover:bg-accent/50',
          dragging ? 'bg-accent' : '',
        ].join(' ')}
        onPointerDown={onPointerDown}
        role="separator"
        title="Drag to resize drawings and 3D"
      >
        <span className="pointer-events-none absolute top-1/2 left-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/25 group-hover:bg-accent" />
      </div>
      <section aria-label="Model" className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="pointer-events-none absolute right-2 bottom-2 z-[2] rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[10px] text-panel uppercase tracking-[0.14em] backdrop-blur-sm">
          Model
        </div>
        {right}
      </section>
      {dragging && <div className="fixed inset-0 z-20 cursor-col-resize" />}
    </div>
  )
}
