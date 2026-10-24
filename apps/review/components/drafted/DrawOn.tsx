'use client'

import { type ReactNode, useEffect, useRef } from 'react'

/**
 * Inks an SVG's strokes on via stroke-dashoffset, like a plotter drawing a
 * line. Wrap inline SVG whose strokable children (`path`/`line`/`polyline`/
 * `circle`/`rect`) should draw on. Measures each child's length on mount and
 * sets `--draft-len` so drafted.css animates the dash. Part of the PermitReady
 * "pizazz" language — see .agents/skills/permitready-pizazz/SKILL.md.
 *
 * Draw-on is decorative: the wrapper is aria-hidden by default, and under
 * prefers-reduced-motion the strokes render fully drawn (handled by drafted.css).
 */
export function DrawOn({
  children,
  className = '',
  /** Set false if the SVG is meaningful and labelled elsewhere. */
  decorative = true,
}: {
  children: ReactNode
  className?: string
  decorative?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const shapes = root.querySelectorAll<SVGGeometryElement>('path, line, polyline, circle, rect')
    for (const shape of shapes) {
      // getTotalLength exists on SVGGeometryElement; guard for jsdom/test envs.
      const len = typeof shape.getTotalLength === 'function' ? shape.getTotalLength() : 0
      if (len > 0) shape.style.setProperty('--draft-len', String(Math.ceil(len)))
    }
  }, [])

  return (
    <span
      aria-hidden={decorative || undefined}
      className={`drafted-draw ${className}`.trim()}
      ref={ref}
    >
      {children}
    </span>
  )
}
