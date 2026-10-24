'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { planPagesOf, useDrawingSet } from '@/lib/drawing-sets'
import {
  displayName,
  ifcMeta,
  kindLabel,
  kindRank,
  levelName,
  levelNumber,
  levelOf,
  NON_ELEMENT_KINDS,
  sortedLevels,
} from '@/lib/node-info'
import { linkForModelSelection } from '@/lib/pdf-links'
import { useReview } from '@/lib/review-store'

type Group = { kind: string; nodes: AnyNode[] }
type Floor = { level: AnyNode; groups: Group[]; count: number }

// A kind with hundreds of members (the clinic has 1,000+ walls) renders in
// pages so expanding it stays instant.
const PAGE = 200

export function useSelectedId(): string | null {
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const zoneId = useViewer((s) => s.selection.zoneId)
  return (selectedIds[0] as string | undefined) ?? (zoneId as string | null) ?? null
}

export function selectNode(nodes: Record<string, AnyNode>, id: string) {
  const node = nodes[id]
  if (!node) return
  const level = levelOf(nodes, id)
  const isRoom = node.type === 'zone'
  useViewer.getState().setSelection({
    levelId: (level?.id ?? null) as never,
    zoneId: (isRoom ? id : null) as never,
    selectedIds: (isRoom ? [] : [id]) as never,
  })
  const review = useReview.getState()
  review.focusNode(id)
  // Keep the PDF pane in sync: prefer the floor-plan hotspot over a schedule row.
  const gid = ifcMeta(node).globalId
  if (gid && review.pdfOpen) {
    const link = linkForModelSelection(
      review.pdfLinks,
      gid,
      review.pdfPage,
      planPagesOf(useDrawingSet.getState().open),
    )
    if (link) {
      review.setPdfPage(link.page)
      review.bumpPdfFocus()
    }
  }
}

function buildFloors(nodes: Record<string, AnyNode>, query: string): Floor[] {
  const q = query.trim().toLowerCase()
  const byLevel = new Map<string, Map<string, AnyNode[]>>()

  for (const node of Object.values(nodes)) {
    if (NON_ELEMENT_KINDS.has(node.type)) continue
    if (q) {
      const m = ifcMeta(node)
      const haystack = `${displayName(node)} ${node.type} ${m.ifcType ?? ''} ${m.typeName ?? ''} ${m.globalId ?? ''}`
      if (!haystack.toLowerCase().includes(q)) continue
    }
    const level = levelOf(nodes, node.id)
    if (!level) continue
    let kinds = byLevel.get(level.id)
    if (!kinds) {
      kinds = new Map()
      byLevel.set(level.id, kinds)
    }
    const list = kinds.get(node.type)
    if (list) list.push(node)
    else kinds.set(node.type, [node])
  }

  return sortedLevels(nodes)
    .map((level) => {
      const kinds = byLevel.get(level.id) ?? new Map<string, AnyNode[]>()
      const groups = [...kinds.entries()]
        .map(([kind, list]) => ({
          kind,
          nodes: list.sort((a, b) =>
            displayName(a).localeCompare(displayName(b), undefined, { numeric: true }),
          ),
        }))
        .sort((a, b) => kindRank(a.kind) - kindRank(b.kind))
      return { level, groups, count: groups.reduce((n, g) => n + g.nodes.length, 0) }
    })
    .filter((f) => f.count > 0)
}

export function ModelTree({ modelKey }: { modelKey: string }) {
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const selectedId = useSelectedId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [shown, setShown] = useState<Record<string, number>>({})
  const listRef = useRef<HTMLDivElement>(null)

  const floors = useMemo(() => buildFloors(nodes, query), [nodes, query])
  const searching = query.trim().length > 0

  // A new model opens with its ground floor expanded: the lowest level
  // numbered 1 or more (level 0 is usually the foundation). Keyed on the
  // model and its ground level, because the tree can mount a moment before
  // the viewer pushes the new scene into the store.
  const groundId = useMemo(
    () => [...sortedLevels(nodes)].reverse().find((l) => levelNumber(l) >= 1)?.id ?? null,
    [nodes],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset only when a different model loads, not on every scene update.
  useEffect(() => {
    setOpen(new Set(groundId ? [groundId] : []))
    setShown({})
    setQuery('')
  }, [modelKey, groundId])

  // A click in the 3D view opens the element's floor and group and scrolls to it.
  useEffect(() => {
    if (!selectedId || !nodes[selectedId]) return
    const level = levelOf(nodes, selectedId)
    if (!level) return
    const groupKey = `${level.id}:${nodes[selectedId]!.type}`
    setOpen((prev) =>
      prev.has(level.id) && prev.has(groupKey) ? prev : new Set([...prev, level.id, groupKey]),
    )
    const group = floors
      .find((f) => f.level.id === level.id)
      ?.groups.find((g) => g.kind === nodes[selectedId]!.type)
    const index = group?.nodes.findIndex((n) => n.id === selectedId) ?? -1
    if (index >= PAGE)
      setShown((s) => ({ ...s, [groupKey]: Math.max(s[groupKey] ?? PAGE, index + 1) }))
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector(`[data-node-id="${selectedId}"]`)
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [selectedId, nodes, floors])

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <label className="relative mx-3 mt-3 mb-2 block">
        <span className="sr-only">Search elements</span>
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          className="h-8 w-full rounded-md border border-rule bg-paper pr-2 pl-8 text-xs placeholder:text-ink-faint focus:border-accent focus:bg-panel focus:outline-none"
          id="tree-search"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search doors, rooms, IFC IDs…"
          type="search"
          value={query}
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3" ref={listRef}>
        {floors.length === 0 && (
          <p className="px-3 py-6 text-center text-ink-faint text-xs">
            No elements match “{query}”.
          </p>
        )}
        {floors.map(({ level, groups, count }) => {
          const levelOpen = searching || open.has(level.id)
          return (
            <section className="mb-0.5" key={level.id}>
              <button
                aria-expanded={levelOpen}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left font-semibold text-ink text-xs hover:bg-paper"
                onClick={() => toggle(level.id)}
                type="button"
              >
                <ChevronRight
                  className={`size-3.5 shrink-0 text-ink-faint transition-transform ${levelOpen ? 'rotate-90' : ''}`}
                />
                <span className="min-w-0 flex-1 truncate">{levelName(level)}</span>
                <span className="font-mono font-normal text-[11px] text-ink-faint tabular-nums">
                  {count}
                </span>
              </button>

              {levelOpen &&
                groups.map(({ kind, nodes: members }) => {
                  const key = `${level.id}:${kind}`
                  const groupOpen = searching || open.has(key)
                  const limit = shown[key] ?? PAGE
                  return (
                    <div className="ml-3.5 border-rule border-l pl-1" key={key}>
                      <button
                        aria-expanded={groupOpen}
                        className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-ink-soft text-xs hover:bg-paper hover:text-ink"
                        onClick={() => toggle(key)}
                        type="button"
                      >
                        <ChevronRight
                          className={`size-3 shrink-0 text-ink-faint transition-transform ${groupOpen ? 'rotate-90' : ''}`}
                        />
                        <span className="min-w-0 flex-1 truncate">{kindLabel(kind)}</span>
                        <span className="font-mono text-[11px] text-ink-faint tabular-nums">
                          {members.length}
                        </span>
                      </button>
                      {groupOpen && (
                        <ul className="ml-3 border-rule border-l pl-1">
                          {members.slice(0, limit).map((node) => {
                            const active = node.id === selectedId
                            return (
                              <li key={node.id}>
                                <button
                                  aria-current={active ? 'true' : undefined}
                                  className={[
                                    'block w-full truncate rounded px-1.5 py-[3px] text-left text-[12px] transition-colors',
                                    active
                                      ? 'bg-accent text-white'
                                      : 'text-ink-soft hover:bg-accent-soft hover:text-ink',
                                  ].join(' ')}
                                  data-node-id={node.id}
                                  onClick={() => selectNode(nodes, node.id)}
                                  title={displayName(node)}
                                  type="button"
                                >
                                  {displayName(node)}
                                </button>
                              </li>
                            )
                          })}
                          {members.length > limit && (
                            <li>
                              <button
                                className="px-1.5 py-1 text-[11px] text-accent hover:underline"
                                onClick={() => setShown((s) => ({ ...s, [key]: limit + PAGE }))}
                                type="button"
                              >
                                Show {Math.min(PAGE, members.length - limit)} more of{' '}
                                {members.length - limit}
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  )
                })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
