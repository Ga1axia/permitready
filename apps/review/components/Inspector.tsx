'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { Check, ChevronRight, Copy, Crosshair, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  displayName,
  ifcMeta,
  kindLabel,
  kindRank,
  levelName,
  levelOf,
  measurements,
  NON_ELEMENT_KINDS,
  propertyRows,
} from '@/lib/node-info'
import { useReview } from '@/lib/review-store'
import type { Sample } from '@/lib/samples'
import { useSelectedId } from './ModelTree'

function Label({ children }: { children: string }) {
  return (
    <h3 className="mb-2 font-medium text-[10px] text-ink-faint uppercase tracking-[0.08em]">
      {children}
    </h3>
  )
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="group flex min-w-0 items-center gap-1.5 text-left font-mono text-[11px] text-ink-soft hover:text-ink"
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          })
          .catch(() => undefined)
      }}
      title="Copy"
      type="button"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="size-3 shrink-0 text-pass" />
      ) : (
        <Copy className="size-3 shrink-0 opacity-0 group-hover:opacity-100" />
      )}
    </button>
  )
}

function ElementDetails({ node, nodes }: { node: AnyNode; nodes: Record<string, AnyNode> }) {
  const unit = useReview((s) => s.unit)
  const focusNode = useReview((s) => s.focusNode)
  const meta = ifcMeta(node)
  const floor = levelOf(nodes, node.id)
  const dims = measurements(node, unit)
  const props = propertyRows(node)
  const [openSets, setOpenSets] = useState<Set<string>>(new Set())
  const sets = useMemo(() => {
    const grouped = new Map<string, { name: string; value: string }[]>()
    for (const row of props) {
      const list = grouped.get(row.set)
      if (list) list.push(row)
      else grouped.set(row.set, [row])
    }
    return [...grouped.entries()]
  }, [props])

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1.5">
        <span className="w-fit rounded bg-accent-soft px-1.5 py-0.5 font-medium text-[10px] text-accent uppercase tracking-[0.06em]">
          {kindLabel(node.type).replace(/s$/, '')}
        </span>
        <h2 className="text-balance font-semibold text-[15px] text-ink leading-snug">
          {displayName(node)}
        </h2>
        {floor && <p className="text-ink-soft text-xs">{levelName(floor)}</p>}
        <button
          className="mt-1 flex w-fit items-center gap-1.5 rounded-md border border-rule px-2 py-1 text-ink-soft text-xs hover:border-rule-strong hover:text-ink"
          onClick={() => focusNode(node.id)}
          type="button"
        >
          <Crosshair className="size-3.5" />
          Zoom to element
        </button>
      </header>

      {dims.length > 0 && (
        <section>
          <Label>Measurements</Label>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            {dims.map((d) => (
              <div className="contents" key={d.label}>
                <dt className="text-ink-soft">{d.label}</dt>
                <dd className="text-right font-mono text-ink tabular-nums">{d.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[11px] text-ink-faint leading-relaxed">
            Overall sizes as modeled. Clear widths for code checks come in Phase 3.
          </p>
        </section>
      )}

      <section>
        <Label>IFC</Label>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-xs">
          {meta.ifcType && (
            <>
              <dt className="text-ink-soft">Class</dt>
              <dd className="truncate font-mono text-[11px] text-ink">{meta.ifcType}</dd>
            </>
          )}
          {meta.typeName && (
            <>
              <dt className="text-ink-soft">Type</dt>
              <dd className="text-ink [overflow-wrap:anywhere]">{meta.typeName}</dd>
            </>
          )}
          {meta.material && (
            <>
              <dt className="text-ink-soft">Material</dt>
              <dd className="text-ink [overflow-wrap:anywhere]">{meta.material}</dd>
            </>
          )}
          {meta.globalId && (
            <>
              <dt className="text-ink-soft">GlobalId</dt>
              <dd className="min-w-0">
                <CopyValue value={meta.globalId} />
              </dd>
            </>
          )}
        </dl>
      </section>

      {sets.length > 0 && (
        <section>
          <Label>Properties</Label>
          <div className="flex flex-col divide-y divide-rule rounded-md border border-rule">
            {sets.map(([set, rows]) => {
              const open = openSets.has(set)
              return (
                <div key={set}>
                  <button
                    aria-expanded={open}
                    className="flex w-full items-center gap-1.5 px-2.5 py-2 text-left text-ink text-xs hover:bg-paper"
                    onClick={() =>
                      setOpenSets((prev) => {
                        const next = new Set(prev)
                        if (next.has(set)) next.delete(set)
                        else next.add(set)
                        return next
                      })
                    }
                    type="button"
                  >
                    <ChevronRight
                      className={`size-3 shrink-0 text-ink-faint transition-transform ${open ? 'rotate-90' : ''}`}
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{set}</span>
                    <span className="font-mono text-[11px] text-ink-faint">{rows.length}</span>
                  </button>
                  {open && (
                    <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-1 px-2.5 pb-2.5 text-[11px]">
                      {rows.map((r) => (
                        <div className="contents" key={r.name}>
                          <dt className="text-ink-soft [overflow-wrap:anywhere]">{r.name}</dt>
                          <dd className="font-mono text-ink [overflow-wrap:anywhere]">{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

function ModelSummary({
  sample,
  fileName,
  nodes,
}: {
  sample?: Sample
  fileName: string
  nodes: Record<string, AnyNode>
}) {
  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const n of Object.values(nodes)) {
      if (NON_ELEMENT_KINDS.has(n.type)) continue
      c.set(n.type, (c.get(n.type) ?? 0) + 1)
    }
    return [...c.entries()].sort((a, b) => kindRank(a[0]) - kindRank(b[0]))
  }, [nodes])
  const floors = Object.values(nodes).filter((n) => n.type === 'level').length

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <span className="font-medium text-[10px] text-ink-faint uppercase tracking-[0.08em]">
          {sample?.category ?? 'Your model'}
        </span>
        <h2 className="text-balance font-semibold text-[15px] text-ink">
          {sample?.label ?? fileName}
        </h2>
        {sample && <p className="text-ink-soft text-xs leading-relaxed">{sample.description}</p>}
      </header>

      <p className="rounded-md bg-paper px-3 py-2.5 text-ink-soft text-xs leading-relaxed">
        Click any element in the model or in the list to see its measurements and IFC data.
      </p>

      <section>
        <Label>In this model</Label>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-ink-soft">Floors</dt>
          <dd className="text-right font-mono text-ink tabular-nums">{floors}</dd>
          {counts.map(([kind, n]) => (
            <div className="contents" key={kind}>
              <dt className="text-ink-soft">{kindLabel(kind)}</dt>
              <dd className="text-right font-mono text-ink tabular-nums">{n.toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </section>

      {sample && (
        <section>
          <Label>Source</Label>
          <p className="text-[11px] text-ink-soft leading-relaxed">
            {sample.credit}. License: {sample.license}.{' '}
            <a
              className="text-accent hover:underline"
              href={sample.infoUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              About this model
            </a>
          </p>
        </section>
      )}
    </div>
  )
}

export function Inspector({ sample, fileName }: { sample?: Sample; fileName: string }) {
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const selectedId = useSelectedId()
  const node = selectedId ? nodes[selectedId] : undefined

  return (
    <div className="relative h-full overflow-y-auto px-4 py-4">
      {node ? (
        <>
          <button
            aria-label="Clear selection"
            className="absolute top-3 right-3 rounded p-1 text-ink-faint hover:bg-paper hover:text-ink"
            onClick={() => useViewer.getState().setSelection({ selectedIds: [], zoneId: null })}
            type="button"
          >
            <X className="size-4" />
          </button>
          <ElementDetails key={node.id} node={node} nodes={nodes} />
        </>
      ) : (
        <ModelSummary fileName={fileName} nodes={nodes} sample={sample} />
      )}
    </div>
  )
}
