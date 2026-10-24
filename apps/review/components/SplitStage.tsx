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
    return <div className="relative min-h-0 min-w-0 flex-1">{right}</div>
  }

  const leftPct = `${(split * 100).toFixed(2)}%`

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1" ref={shell}>
      <div className="relative min-h-0 min-w-0 overflow-hidden" style={{ width: leftPct }}>
        {left}
      </div>
      <div
        aria-orientation="vertical"
        aria-valuemax={80}
        aria-valuemin={20}
        aria-valuenow={Math.round(split * 100)}
        className={[
          'group relative z-10 w-1.5 shrink-0 cursor-col-resize bg-rule transition-colors',
          'hover:bg-accent/40',
          dragging ? 'bg-accent/50' : '',
        ].join(' ')}
        onPointerDown={onPointerDown}
        role="separator"
        title="Drag to resize PDF and 3D"
      >
        <span className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rule-strong group-hover:bg-accent" />
      </div>
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">{right}</div>
      {dragging && <div className="fixed inset-0 z-20 cursor-col-resize" />}
    </div>
  )
}
