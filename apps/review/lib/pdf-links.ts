/** A rectangle on a PDF page, in normalized page units (0–1, origin top-left). */
export type PdfRect = { x: number; y: number; w: number; h: number }

/** One IFC element ↔ drawing region link. */
export type PdfLink = {
  id: string
  /** IFC GlobalId — stable across reconversion. */
  globalId: string
  /** 1-based page index. */
  page: number
  rect: PdfRect
  /** Optional label shown on the hotspot. */
  label?: string
}

export type PdfLinksFile = {
  version: 1
  links: PdfLink[]
}

export function parsePdfLinks(data: unknown): PdfLink[] {
  if (!data || typeof data !== 'object') return []
  const links = (data as { links?: unknown }).links
  if (!Array.isArray(links)) return []
  const out: PdfLink[] = []
  for (const raw of links) {
    if (!raw || typeof raw !== 'object') continue
    const r = raw as Record<string, unknown>
    const rect = r.rect as Record<string, unknown> | undefined
    const globalId = typeof r.globalId === 'string' ? r.globalId : null
    const page = typeof r.page === 'number' ? r.page : null
    if (!globalId || page == null || !rect) continue
    const x = Number(rect.x)
    const y = Number(rect.y)
    const w = Number(rect.w)
    const h = Number(rect.h)
    if (![x, y, w, h].every(Number.isFinite)) continue
    out.push({
      id: typeof r.id === 'string' ? r.id : `link_${out.length + 1}`,
      globalId,
      page,
      rect: { x, y, w, h },
      label: typeof r.label === 'string' ? r.label : undefined,
    })
  }
  return out
}

export function exportPdfLinks(links: PdfLink[]): string {
  const body: PdfLinksFile = { version: 1, links }
  return `${JSON.stringify(body, null, 2)}\n`
}

export function linkForGlobalId(
  links: PdfLink[],
  globalId: string | undefined,
): PdfLink | undefined {
  if (!globalId) return undefined
  return links.find((l) => l.globalId === globalId)
}

/**
 * The element's link on `page` if it has one there, else its first link. An
 * element can appear on several sheets (its plan and a schedule row); staying
 * on the page being read keeps a click on a schedule row from jumping away.
 */
export function linkForGlobalIdOnPage(
  links: PdfLink[],
  globalId: string | undefined,
  page: number,
): PdfLink | undefined {
  if (!globalId) return undefined
  return (
    links.find((l) => l.globalId === globalId && l.page === page) ??
    linkForGlobalId(links, globalId)
  )
}

/**
 * Pick the best hotspot for a 3D selection: stay on the current page if the
 * element is already linked there, otherwise prefer a floor-plan page over a
 * schedule row so the drawing highlights the room/door on the plan.
 */
export function linkForModelSelection(
  links: PdfLink[],
  globalId: string | undefined,
  currentPage: number,
  planPages: ReadonlySet<number>,
): PdfLink | undefined {
  if (!globalId) return undefined
  const matches = links.filter((l) => l.globalId === globalId)
  if (matches.length === 0) return undefined
  const onCurrent = matches.find((l) => l.page === currentPage)
  if (onCurrent) return onCurrent
  const onPlan = matches.find((l) => planPages.has(l.page))
  return onPlan ?? matches[0]
}

export function newLinkId(): string {
  return `link_${Math.random().toString(36).slice(2, 10)}`
}
