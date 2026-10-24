'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { useEffect, useRef } from 'react'
import { planPagesOf, useDrawingSet } from '@/lib/drawing-sets'
import { ifcMeta } from '@/lib/node-info'
import { linkForModelSelection } from '@/lib/pdf-links'
import { useReview } from '@/lib/review-store'
import { useSelectedId } from './ModelTree'

/**
 * When the 3D selection changes (tree click or canvas pick), jump the PDF to
 * the linked floor plan (preferring plans over schedules) and pulse the hotspot.
 */
export function SelectionPdfBridge() {
  const selectedId = useSelectedId()
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const pdfOpen = useReview((s) => s.pdfOpen)
  const links = useReview((s) => s.pdfLinks)
  const drawingSet = useDrawingSet((s) => s.open)
  const last = useRef<string | null>(null)

  useEffect(() => {
    if (!pdfOpen || !selectedId) {
      last.current = selectedId
      return
    }
    if (selectedId === last.current) return
    last.current = selectedId
    const gid = ifcMeta(nodes[selectedId]).globalId
    const review = useReview.getState()
    const link = linkForModelSelection(links, gid, review.pdfPage, planPagesOf(drawingSet))
    if (!link) return
    review.setPdfPage(link.page)
    review.bumpPdfFocus()
  }, [selectedId, pdfOpen, links, nodes, drawingSet])

  return null
}
