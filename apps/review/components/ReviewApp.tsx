'use client'

import type { PascalSceneGraph } from '@pascal-app/ifc-converter'
import { FileText, FolderOpen, PanelLeft, PanelRight, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { type DragEvent, useCallback, useEffect, useRef, useState } from 'react'
import { fetchDrawingSet, openDrawingSet } from '@/lib/drawing-sets'
import { loadModelFromFile, loadModelFromUrl, ModelMissingError } from '@/lib/load-model'
import { useReview } from '@/lib/review-store'
import { defaultSampleId, findSample, type Sample, samples } from '@/lib/samples'
import { CodeCheckPanel } from './CodeCheckPanel'
import { DrawingSetBar } from './DrawingSetBar'
import { Inspector } from './Inspector'
import { ModelTree } from './ModelTree'
import { PdfPane } from './PdfPane'
import { SelectionPdfBridge } from './SelectionPdfBridge'
import { SplitStage } from './SplitStage'
import { FloorPicker, ViewToolbar } from './ViewControls'

// The viewer needs WebGPU and the browser-side scene store, so it never
// renders on the server.
const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false })

type Status =
  | { kind: 'loading'; message: string; percent: number }
  | { kind: 'ready' }
  | { kind: 'missing'; sample: Sample }
  | { kind: 'error'; message: string }

type Source = { kind: 'sample'; sample: Sample } | { kind: 'file'; name: string }

function sourceKey(source: Source | null): string {
  if (!source) return 'none'
  return source.kind === 'sample' ? source.sample.id : `file:${source.name}`
}

function isIfcFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.ifc')
}

export default function ReviewApp() {
  const [source, setSource] = useState<Source | null>(null)
  const [graph, setGraph] = useState<PascalSceneGraph | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'loading', message: 'Starting', percent: 0 })
  const [notice, setNotice] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showTree, setShowTree] = useState(false)
  const [showInspector, setShowInspector] = useState(true)
  const [inspectorTab, setInspectorTab] = useState<'inspector' | 'checks'>('inspector')
  const fileInput = useRef<HTMLInputElement>(null)
  const pdfInput = useRef<HTMLInputElement>(null)
  const loadSeq = useRef(0)
  const pdfOpen = useReview((s) => s.pdfOpen)
  const pdfUrl = useReview((s) => s.pdfUrl)
  const setPdfOpen = useReview((s) => s.setPdfOpen)
  const setPdf = useReview((s) => s.setPdf)

  const progress = useCallback((seq: number) => {
    return (message: string, percent: number) => {
      if (seq === loadSeq.current) setStatus({ kind: 'loading', message, percent })
    }
  }, [])

  const openSample = useCallback(
    async (sample: Sample) => {
      const seq = ++loadSeq.current
      setNotice(null)
      setSource({ kind: 'sample', sample })
      setStatus({ kind: 'loading', message: 'Loading model', percent: 0 })
      const params = new URLSearchParams(window.location.search)
      params.set('model', sample.id)
      window.history.replaceState(null, '', `${window.location.pathname}?${params}`)
      // Drawings load in parallel with the IFC so side-by-side is ready on open.
      const drawingsPromise = fetchDrawingSet(sample.id)
      try {
        const result = await loadModelFromUrl(sample.file, progress(seq))
        if (seq !== loadSeq.current) return
        setGraph(result)
        setStatus({ kind: 'ready' })
        const drawings = await drawingsPromise
        if (seq !== loadSeq.current) return
        if (drawings) {
          void openDrawingSet(drawings)
        } else if (useReview.getState().pdfUrl?.includes('/reference/')) {
          const { useDrawingSet } = await import('@/lib/drawing-sets')
          useDrawingSet.getState().setOpen(null)
          useReview.getState().setPdf(null, null)
        }
      } catch (err) {
        if (seq !== loadSeq.current) return
        setStatus(
          err instanceof ModelMissingError
            ? { kind: 'missing', sample }
            : {
                kind: 'error',
                message: err instanceof Error ? err.message : 'The model could not be opened.',
              },
        )
      }
    },
    [progress],
  )

  const openSampleRef = useRef(openSample)
  openSampleRef.current = openSample

  const dismissError = useCallback(() => {
    setNotice(null)
    if (graph) {
      setStatus({ kind: 'ready' })
      return
    }
    const fallback = findSample(defaultSampleId)
    if (fallback) void openSampleRef.current(fallback)
  }, [graph])

  const openFile = useCallback(
    async (file: File) => {
      if (!isIfcFile(file)) {
        const message = `${file.name} is not an .ifc file. Export the model as IFC and try again.`
        // Don't trap the user behind a full-screen error if a model is already open.
        if (graph && status.kind === 'ready') {
          setNotice(message)
          return
        }
        setNotice(null)
        setStatus({ kind: 'error', message })
        return
      }
      const seq = ++loadSeq.current
      setNotice(null)
      setStatus({ kind: 'loading', message: 'Reading file', percent: 0 })
      try {
        const result = await loadModelFromFile(file, progress(seq))
        if (seq !== loadSeq.current) return
        setSource({ kind: 'file', name: file.name })
        setGraph(result)
        setStatus({ kind: 'ready' })
        const params = new URLSearchParams(window.location.search)
        params.delete('model')
        const qs = params.toString()
        window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
      } catch (err) {
        if (seq !== loadSeq.current) return
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : 'The model could not be opened.',
        })
      }
    },
    [graph, progress, status.kind],
  )

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notice])

  // biome-ignore lint/correctness/useExhaustiveDependencies: open the model named in the URL once, on first load.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('model')
    openSample(findSample(requested) ?? findSample(defaultSampleId)!)
  }, [])

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) openFile(file)
  }

  const activeSampleId = source?.kind === 'sample' ? source.sample.id : null
  const fileName = source?.kind === 'file' ? source.name : ''
  const ready = status.kind === 'ready' && graph
  const viewerPaused = status.kind !== 'ready'

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDrop={onDrop}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-rule border-b bg-panel/95 py-2.5 pr-[max(16px,env(safe-area-inset-right))] pl-[max(16px,env(safe-area-inset-left))] backdrop-blur-sm">
        <a className="group flex shrink-0 items-center gap-2.5" href="/" title="PermitReady">
          <img
            alt=""
            className="size-8 rounded-md object-cover shadow-[0_1px_2px_rgba(20,20,20,0.12)]"
            height={32}
            src="/brand/mark.png"
            width={32}
          />
          <div className="leading-none">
            <h1 className="font-semibold text-[15px] text-ink tracking-tight">
              Permit<span className="text-accent">Ready</span>
            </h1>
            <p className="mt-0.5 hidden font-mono text-[10px] text-ink-faint tracking-wide sm:block">
              drawings · model
            </p>
          </div>
        </a>

        <nav
          aria-label="Sample models"
          className="flex flex-wrap items-center gap-1 rounded-xl bg-paper-deep/80 p-1"
        >
          {samples.map((s) => {
            const active = s.id === activeSampleId
            return (
              <button
                aria-pressed={active}
                className={[
                  'flex flex-col items-start rounded-lg px-3 py-1.5 text-left transition-colors',
                  active ? 'bg-panel shadow-[0_1px_3px_rgba(20,20,20,0.1)]' : 'hover:bg-panel/70',
                ].join(' ')}
                key={s.id}
                onClick={() => openSample(s)}
                type="button"
              >
                <span className={`font-medium text-xs ${active ? 'text-ink' : 'text-ink-soft'}`}>
                  {s.label}
                </span>
                <span className="text-[10px] text-ink-faint">{s.category}</span>
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            className="flex h-8 items-center gap-1.5 rounded-lg border border-rule px-3 font-medium text-ink text-xs hover:border-rule-strong hover:bg-paper"
            onClick={() => fileInput.current?.click()}
            type="button"
          >
            <FolderOpen className="size-3.5" />
            Open IFC
          </button>
          <input
            accept=".ifc"
            className="hidden"
            id="ifc-file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) openFile(file)
              e.target.value = ''
            }}
            ref={fileInput}
            type="file"
          />
          <button
            aria-pressed={pdfOpen}
            className={[
              'flex h-8 items-center gap-1.5 rounded-lg border px-3 font-medium text-xs',
              pdfOpen
                ? 'border-accent bg-accent text-white shadow-[0_1px_2px_rgba(31,95,255,0.35)]'
                : 'border-rule text-ink hover:border-rule-strong hover:bg-paper',
            ].join(' ')}
            onClick={async () => {
              if (pdfUrl) {
                setPdfOpen(!pdfOpen)
                return
              }
              // A sample building opens its generated drawing set; anything
              // else asks for a PDF.
              const set = activeSampleId ? await fetchDrawingSet(activeSampleId) : null
              if (set) openDrawingSet(set)
              else pdfInput.current?.click()
            }}
            title={
              pdfUrl ? 'Show or hide drawings beside the model' : 'Open drawings beside the model'
            }
            type="button"
          >
            <FileText className="size-3.5" />
            {pdfOpen ? 'Side by side' : pdfUrl ? 'Show drawings' : 'Open drawings'}
          </button>
          <input
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setPdf(URL.createObjectURL(file), file.name)
                useReview.getState().setPdfLinks([])
              }
              e.target.value = ''
            }}
            ref={pdfInput}
            type="file"
          />
          <button
            aria-label={showTree ? 'Hide element list' : 'Show element list'}
            aria-pressed={showTree}
            className="hidden size-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink md:flex"
            onClick={() => setShowTree((v) => !v)}
            type="button"
          >
            <PanelLeft className="size-4" />
          </button>
          <button
            aria-label={showInspector ? 'Hide inspector' : 'Show inspector'}
            aria-pressed={showInspector}
            className="hidden size-8 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink md:flex"
            onClick={() => setShowInspector((v) => !v)}
            type="button"
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {showTree && ready && (
          <aside
            aria-label="Elements"
            className="hidden w-64 shrink-0 border-rule border-r bg-panel md:block"
          >
            <ModelTree modelKey={sourceKey(source)} />
          </aside>
        )}

        <SplitStage
          enabled={pdfOpen}
          left={
            <div className="flex h-full min-h-0 flex-col">
              <DrawingSetBar buildingId={activeSampleId} />
              <div className="min-h-0 flex-1">
                <PdfPane />
              </div>
            </div>
          }
          right={
            <main className="relative h-full min-h-0 min-w-0 bg-stage">
              {graph && <ModelViewer graph={graph} paused={viewerPaused} />}
              {ready && <SelectionPdfBridge />}

              {ready && (
                <>
                  <div className="pointer-events-none absolute top-3 right-3 left-3 z-[1] flex justify-center">
                    <div className="pointer-events-auto max-w-full">
                      <ViewToolbar />
                    </div>
                  </div>
                  <FloorPicker />
                </>
              )}

              {notice && status.kind === 'ready' && (
                <div
                  className="absolute right-3 bottom-3 left-3 z-10 mx-auto flex max-w-md items-start gap-2 rounded-xl border border-rule bg-panel px-3 py-2.5 shadow-sm sm:left-auto"
                  role="status"
                >
                  <p className="min-w-0 flex-1 text-ink-soft text-xs leading-relaxed">{notice}</p>
                  <button
                    aria-label="Dismiss"
                    className="shrink-0 rounded p-0.5 text-ink-faint hover:bg-paper hover:text-ink"
                    onClick={() => setNotice(null)}
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {status.kind === 'loading' && (
                <Overlay>
                  <p className="font-medium text-ink text-sm">{status.message}</p>
                  <div
                    aria-label="Loading"
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={Math.round(status.percent)}
                    className="mt-3 h-1 w-56 overflow-hidden rounded-full bg-rule"
                    role="progressbar"
                  >
                    <div
                      className="h-full bg-accent transition-[width]"
                      style={{ width: `${Math.max(4, status.percent)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-ink-faint text-xs">
                    Converting IFC in your browser — drawings open beside it when ready.
                  </p>
                </Overlay>
              )}

              {status.kind === 'missing' && (
                <Overlay>
                  <p className="font-medium text-ink text-sm">
                    {status.sample.label} isn’t available
                  </p>
                  <p className="mt-2 max-w-sm text-ink-soft text-xs leading-relaxed">
                    Sample models ship with the app. If this file is missing locally, run{' '}
                    <code className="rounded bg-paper px-1 font-mono">bun run samples</code> in{' '}
                    <code className="rounded bg-paper px-1 font-mono">apps/review</code>, or open
                    your own IFC.
                  </p>
                  <button
                    className="mt-4 flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 font-medium text-white text-xs hover:bg-accent/90"
                    onClick={() => fileInput.current?.click()}
                    type="button"
                  >
                    <FolderOpen className="size-3.5" />
                    Open IFC
                  </button>
                </Overlay>
              )}

              {status.kind === 'error' && (
                <Overlay>
                  <p className="font-medium text-fail text-sm">The model could not be opened</p>
                  <p className="mt-2 max-w-sm text-ink-soft text-xs leading-relaxed">
                    {status.message}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      className="rounded-md border border-rule px-3 py-1.5 font-medium text-ink text-xs hover:border-rule-strong hover:bg-paper"
                      onClick={dismissError}
                      type="button"
                    >
                      {graph ? 'Back to model' : 'Try a sample'}
                    </button>
                    <button
                      className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 font-medium text-white text-xs hover:bg-accent/90"
                      onClick={() => fileInput.current?.click()}
                      type="button"
                    >
                      <FolderOpen className="size-3.5" />
                      Open IFC
                    </button>
                  </div>
                </Overlay>
              )}

              {dragging && (
                <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-accent border-dashed bg-accent-soft/80">
                  <p className="font-medium text-accent text-sm">Drop an .ifc file to open it</p>
                </div>
              )}
            </main>
          }
        />

        {showInspector && ready && (
          <aside
            aria-label="Inspector"
            className="hidden w-72 shrink-0 border-rule border-l bg-panel lg:block"
          >
            {/* Tab bar */}
            <div className="flex shrink-0 border-rule border-b">
              <button
                aria-pressed={inspectorTab === 'inspector'}
                className={[
                  'flex-1 py-2 font-medium text-xs transition-colors',
                  inspectorTab === 'inspector'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-ink-soft hover:text-ink',
                ].join(' ')}
                onClick={() => setInspectorTab('inspector')}
                type="button"
              >
                Inspector
              </button>
              <button
                aria-pressed={inspectorTab === 'checks'}
                className={[
                  'flex-1 py-2 font-medium text-xs transition-colors',
                  inspectorTab === 'checks'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-ink-soft hover:text-ink',
                ].join(' ')}
                onClick={() => setInspectorTab('checks')}
                type="button"
              >
                Code Check
              </button>
            </div>

            <div className="h-[calc(100%-36px)] overflow-y-auto">
              {inspectorTab === 'inspector' ? (
                <Inspector
                  fileName={fileName}
                  sample={source?.kind === 'sample' ? source.sample : undefined}
                />
              ) : (
                <CodeCheckPanel buildingId={activeSampleId} />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-paper/80 px-4 backdrop-blur-[3px]">
      <div className="flex flex-col items-center rounded-2xl border border-rule bg-panel px-7 py-6 text-center shadow-[0_8px_32px_rgba(20,20,20,0.1)]">
        {children}
      </div>
    </div>
  )
}
