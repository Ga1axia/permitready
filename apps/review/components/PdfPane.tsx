'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Link2,
  Link2Off,
  Loader2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildGlobalIdIndex } from '@/lib/global-id-index'
import { ifcMeta } from '@/lib/node-info'
import {
  exportPdfLinks,
  linkForGlobalIdOnPage,
  newLinkId,
  type PdfRect,
  parsePdfLinks,
} from '@/lib/pdf-links'
import { useReview } from '@/lib/review-store'
import { selectNode, useSelectedId } from './ModelTree'

type PdfDoc = {
  numPages: number
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number }
    render: (o: {
      canvasContext: CanvasRenderingContext2D
      viewport: { width: number; height: number }
    }) => { promise: Promise<void>; cancel: () => void }
  }>
}

/**
 * Drawing PDF pane: open a sheet, navigate pages, and keep hotspots in sync
 * with the 3D selection via IFC GlobalId links.
 */
export function PdfPane() {
  const pdfUrl = useReview((s) => s.pdfUrl)
  const pdfName = useReview((s) => s.pdfName)
  const setPdf = useReview((s) => s.setPdf)
  const page = useReview((s) => s.pdfPage)
  const setPage = useReview((s) => s.setPdfPage)
  const links = useReview((s) => s.pdfLinks)
  const setPdfLinks = useReview((s) => s.setPdfLinks)
  const addPdfLink = useReview((s) => s.addPdfLink)
  const linking = useReview((s) => s.pdfLinking)
  const setLinking = useReview((s) => s.setPdfLinking)
  const focusSeq = useReview((s) => s.pdfFocusSeq)

  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const selectedId = useSelectedId()
  const selectedGid = selectedId ? ifcMeta(nodes[selectedId]).globalId : undefined
  const gidIndex = useMemo(() => buildGlobalIdIndex(nodes), [nodes])

  const [doc, setDoc] = useState<PdfDoc | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cssSize, setCssSize] = useState({ w: 0, h: 0 })
  const [draft, setDraft] = useState<PdfRect | null>(null)
  // Multiple of fit-to-width. Large sheets (the clinic is A0) need zoom
  // before door-sized hotspots are big enough to click.
  const [zoom, setZoom] = useState(1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const linksRef = useRef<HTMLInputElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)

  // Load PDF document when the object URL changes.
  useEffect(() => {
    if (!pdfUrl) {
      setDoc(null)
      setPageCount(0)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
        const loaded = await pdfjs.getDocument(pdfUrl).promise
        if (cancelled) {
          loaded.destroy()
          return
        }
        setDoc(loaded as unknown as PdfDoc)
        setPageCount(loaded.numPages)
        // setPdf already reset the page to 1; a caller that asked for a
        // specific sheet (a drawing set) set it afterwards, so keep it.
        setPage(Math.min(Math.max(1, useReview.getState().pdfPage), loaded.numPages))
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not open PDF')
          setDoc(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pdfUrl, setPage])

  // Render the current page to the canvas, fitting the pane width.
  useEffect(() => {
    if (!doc || !canvasRef.current || !stageRef.current) return
    let cancelled = false
    let task: { promise: Promise<void>; cancel?: () => void } | null = null
    ;(async () => {
      const pdfPage = await doc.getPage(page)
      if (cancelled) return
      const stageW = stageRef.current!.clientWidth
      const base = pdfPage.getViewport({ scale: 1 })
      const scale = Math.max(0.5, (stageW - 16) / base.width) * zoom
      const viewport = pdfPage.getViewport({ scale })
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      // Size the hotspot layer with the canvas, not after the (slow) render,
      // so hotspots never sit at the previous zoom over the new canvas.
      setCssSize({ w: viewport.width, h: viewport.height })
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      task = pdfPage.render({ canvasContext: ctx, viewport })
      await task.promise
    })().catch(() => undefined)
    return () => {
      cancelled = true
      // pdf.js refuses a second render on a canvas while one is running.
      task?.cancel?.()
    }
  }, [doc, page, zoom])

  // Page jumps for 3D selection live in SelectionPdfBridge / selectNode so they
  // can prefer floor-plan sheets over schedule rows.

  const pageLinks = useMemo(() => links.filter((l) => l.page === page), [links, page])
  const activeLink = linkForGlobalIdOnPage(links, selectedGid, page)

  // Bring the highlighted hotspot into view when zoomed in.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when the highlight moves or the page re-renders.
  useEffect(() => {
    if (!activeLink || activeLink.page !== page) return
    requestAnimationFrame(() => {
      stageRef.current
        ?.querySelector('[data-active-link]')
        ?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })
    })
  }, [activeLink?.id, page, focusSeq, cssSize.w])

  const openPdfFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPdf(url, file.name)
    setPdfLinks([])
    setLinking(false)
  }

  const onHotspot = useCallback(
    (globalId: string) => {
      const nodeId = gidIndex.get(globalId)
      if (nodeId) selectNode(nodes, nodeId)
    },
    [gidIndex, nodes],
  )

  const toNorm = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const stage = stageRef.current?.querySelector('[data-pdf-page]') as HTMLElement | null
    if (!stage || cssSize.w < 1) return null
    const rect = stage.getBoundingClientRect()
    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!linking || !selectedGid) return
    const p = toNorm(e.clientX, e.clientY)
    if (!p) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragOrigin.current = p
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragOrigin.current) return
    const p = toNorm(e.clientX, e.clientY)
    if (!p) return
    const o = dragOrigin.current
    setDraft({
      x: Math.min(o.x, p.x),
      y: Math.min(o.y, p.y),
      w: Math.abs(p.x - o.x),
      h: Math.abs(p.y - o.y),
    })
  }

  const onPointerUp = () => {
    if (!dragOrigin.current || !draft || !selectedGid) {
      dragOrigin.current = null
      setDraft(null)
      return
    }
    dragOrigin.current = null
    if (draft.w > 0.01 && draft.h > 0.01) {
      addPdfLink({
        id: newLinkId(),
        globalId: selectedGid,
        page,
        rect: draft,
        label: selectedId ? (nodes[selectedId] as { name?: string })?.name : undefined,
      })
      setLinking(false)
    }
    setDraft(null)
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-panel px-4 text-center">
        <FileText className="size-8 text-accent" />
        <p className="font-semibold text-ink text-sm">Drawings beside the model</p>
        <p className="max-w-xs text-ink-soft text-xs leading-relaxed">
          Open a plan PDF next to the 3D view. Select an element, then link a region so both panes
          stay highlighted together.
        </p>
        <button
          className="mt-1 flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 font-medium text-white text-xs shadow-[0_1px_2px_rgba(31,95,255,0.35)] hover:bg-accent/90"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          <Upload className="size-3.5" />
          Open drawings
        </button>
        <input
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) openPdfFile(file)
            e.target.value = ''
          }}
          ref={fileRef}
          type="file"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-panel">
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-rule border-b px-2 py-1.5">
        <span
          className="min-w-0 flex-1 truncate font-medium text-[11px] text-ink-soft"
          title={pdfName ?? ''}
        >
          {pdfName}
        </span>
        <button
          aria-label="Previous page"
          className="rounded p-1 text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-30"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          type="button"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="font-mono text-[11px] text-ink-faint tabular-nums">
          {page} / {pageCount || '—'}
        </span>
        <button
          aria-label="Next page"
          className="rounded p-1 text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-30"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
          type="button"
        >
          <ChevronRight className="size-4" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-rule" />
        <button
          aria-label="Zoom out"
          className="rounded p-1 text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-30"
          disabled={zoom <= 1}
          onClick={() => setZoom((z) => Math.max(1, z / 1.5))}
          type="button"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          className="min-w-10 rounded px-1 font-mono text-[11px] text-ink-faint tabular-nums hover:bg-paper hover:text-ink"
          onClick={() => setZoom(1)}
          title="Fit the sheet to the pane width"
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          aria-label="Zoom in"
          className="rounded p-1 text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-30"
          disabled={zoom >= 8}
          onClick={() => setZoom((z) => Math.min(8, z * 1.5))}
          type="button"
        >
          <ZoomIn className="size-4" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-rule" />
        <button
          aria-pressed={linking}
          className={[
            'flex h-7 items-center gap-1 rounded-md px-2 font-medium text-xs',
            linking ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-paper hover:text-ink',
          ].join(' ')}
          disabled={!selectedGid}
          onClick={() => setLinking(!linking)}
          title={
            selectedGid
              ? linking
                ? 'Drag on the page to place the link, or click again to cancel'
                : 'Draw a box on the PDF for the selected 3D element'
              : 'Select a 3D element first'
          }
          type="button"
        >
          {linking ? <Link2Off className="size-3.5" /> : <Link2 className="size-3.5" />}
          {linking ? 'Drawing…' : 'Link'}
        </button>
        <button
          className="rounded-md px-2 py-1 text-[11px] text-ink-soft hover:bg-paper hover:text-ink"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          Replace
        </button>
        <button
          className="rounded-md px-2 py-1 text-[11px] text-ink-soft hover:bg-paper hover:text-ink"
          onClick={() => linksRef.current?.click()}
          title="Load a links JSON (GlobalId → page rect)"
          type="button"
        >
          Load links
        </button>
        <button
          className="rounded-md px-2 py-1 text-[11px] text-ink-soft hover:bg-paper hover:text-ink disabled:opacity-40"
          disabled={links.length === 0}
          onClick={() => {
            const blob = new Blob([exportPdfLinks(links)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${(pdfName ?? 'drawing').replace(/\.pdf$/i, '')}-links.json`
            a.click()
            URL.revokeObjectURL(a.href)
          }}
          type="button"
        >
          Save links
        </button>
        <input
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) openPdfFile(file)
            e.target.value = ''
          }}
          ref={fileRef}
          type="file"
        />
        <input
          accept="application/json,.json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            try {
              const text = await file.text()
              setPdfLinks(parsePdfLinks(JSON.parse(text)))
            } catch {
              /* ignore bad JSON */
            }
          }}
          ref={linksRef}
          type="file"
        />
      </div>

      {linking && (
        <p className="shrink-0 bg-accent-soft px-3 py-1.5 text-[11px] text-accent leading-relaxed">
          Drag a box on the drawing to link it to the selected element
          {selectedGid ? ` (${selectedGid.slice(0, 8)}…)` : ''}.
        </p>
      )}

      <div className="relative min-h-0 flex-1 overflow-auto bg-paper p-2" ref={stageRef}>
        {loading && (
          <div className="flex h-full items-center justify-center gap-2 text-ink-faint text-xs">
            <Loader2 className="size-4 animate-spin" />
            Loading PDF…
          </div>
        )}
        {error && <p className="p-4 text-center text-fail text-xs">{error}</p>}
        {!loading && !error && (
          <div
            className="relative mx-auto touch-none"
            data-pdf-page
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{ width: cssSize.w || undefined, height: cssSize.h || undefined }}
          >
            <canvas className="block rounded shadow-sm" ref={canvasRef} />
            {pageLinks.map((link) => {
              const active = link.globalId === selectedGid
              return (
                <button
                  className={[
                    'absolute rounded-sm border-2 transition-colors',
                    active
                      ? 'border-accent bg-accent/25 shadow-[0_0_0_1px_rgba(37,99,235,0.4)]'
                      : 'border-accent/50 bg-accent/10 hover:bg-accent/20',
                  ].join(' ')}
                  key={link.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!linking) onHotspot(link.globalId)
                  }}
                  style={{
                    left: `${link.rect.x * 100}%`,
                    top: `${link.rect.y * 100}%`,
                    width: `${link.rect.w * 100}%`,
                    height: `${link.rect.h * 100}%`,
                  }}
                  title={link.label ?? link.globalId}
                  type="button"
                />
              )
            })}
            {draft && (
              <div
                className="pointer-events-none absolute border-2 border-dashed border-accent bg-accent/20"
                style={{
                  left: `${draft.x * 100}%`,
                  top: `${draft.y * 100}%`,
                  width: `${draft.w * 100}%`,
                  height: `${draft.h * 100}%`,
                }}
              />
            )}
            {activeLink && activeLink.page === page && (
              <div
                aria-hidden
                className="pointer-events-none absolute animate-pulse rounded-sm border-2 border-accent"
                data-active-link
                key={focusSeq}
                style={{
                  left: `${activeLink.rect.x * 100}%`,
                  top: `${activeLink.rect.y * 100}%`,
                  width: `${activeLink.rect.w * 100}%`,
                  height: `${activeLink.rect.h * 100}%`,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
