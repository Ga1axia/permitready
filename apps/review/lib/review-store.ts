import { create } from 'zustand'
import type { Unit } from './node-info'
import type { PdfLink } from './pdf-links'

/** Default: others are 70% see-through while an element is selected. */
export const DEFAULT_FOCUS_SEE_THROUGH = 70

/** PDF pane width as a fraction of the stage (3D takes the rest). */
export const DEFAULT_PDF_SPLIT = 0.42

type ReviewState = {
  /** Bumped to ask the camera inside the Canvas to frame a node (or the whole model). */
  focusRequest: { nodeId: string | null; seq: number }
  focusNode: (nodeId: string | null) => void
  /** null = all floors stacked; otherwise floors above this level are hidden. */
  isolatedLevelId: string | null
  setIsolatedLevelId: (id: string | null) => void
  unit: Unit
  setUnit: (unit: Unit) => void
  /**
   * How see-through the rest of the building is when something is selected
   * (0 = no dimming, 100 = fully invisible). Default 70.
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
}

export const useReview = create<ReviewState>((set, get) => ({
  focusRequest: { nodeId: null, seq: 0 },
  focusNode: (nodeId) => set((s) => ({ focusRequest: { nodeId, seq: s.focusRequest.seq + 1 } })),
  isolatedLevelId: null,
  setIsolatedLevelId: (isolatedLevelId) => set({ isolatedLevelId }),
  unit: 'imperial',
  setUnit: (unit) => set({ unit }),
  focusSeeThrough: DEFAULT_FOCUS_SEE_THROUGH,
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
}))
