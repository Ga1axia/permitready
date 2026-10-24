import type { AnyNode } from '@pascal-app/core'

/** The fields `@pascal-app/ifc-converter` writes into `BaseNode.metadata`. */
export type IfcMetadata = {
  ifcType?: string
  globalId?: string
  expressID?: number
  typeName?: string
  material?: string
  properties?: Record<string, Record<string, unknown>>
}

export function ifcMeta(node: AnyNode | undefined): IfcMetadata {
  return ((node as { metadata?: unknown } | undefined)?.metadata ?? {}) as IfcMetadata
}

type NodeMap = Record<string, AnyNode>

const KIND_LABELS: Record<string, string> = {
  wall: 'Walls',
  door: 'Doors',
  window: 'Windows',
  slab: 'Slabs',
  ceiling: 'Ceilings',
  roof: 'Roofs',
  zone: 'Rooms',
  column: 'Columns',
  block: 'Beams',
  'imported-mesh': 'Other elements',
}

// Elements a reviewer looks for first come first in the tree.
const KIND_ORDER = ['zone', 'door', 'window', 'wall', 'slab', 'ceiling', 'roof', 'column', 'block']

export function kindLabel(type: string): string {
  return KIND_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')
}

export function kindRank(type: string): number {
  const i = KIND_ORDER.indexOf(type)
  return i === -1 ? KIND_ORDER.length + (type === 'imported-mesh' ? 1 : 0) : i
}

/** Kinds that are structure of the scene graph rather than building elements. */
export const NON_ELEMENT_KINDS = new Set([
  'site',
  'building',
  'level',
  'separator',
  'floor-opening',
])

/** A readable name: the IFC name trimmed of Revit's trailing ":<id>" chains. */
export function displayName(node: AnyNode): string {
  const raw = (node as { name?: string }).name?.trim()
  if (!raw) return ifcMeta(node).typeName ?? kindLabel(node.type).replace(/s$/, '')
  const parts = raw.split(':')
  return parts.length > 2 ? `${parts[0]}: ${parts[1]}` : raw
}

export function levelOf(nodes: NodeMap, id: string): AnyNode | undefined {
  let current: AnyNode | undefined = nodes[id]
  while (current) {
    if (current.type === 'level') return current
    const parentId = (current as { parentId?: string | null }).parentId
    current = parentId ? nodes[parentId] : undefined
  }
  return undefined
}

/** Levels sorted top floor first, the way a building section reads. */
export function sortedLevels(nodes: NodeMap): AnyNode[] {
  return Object.values(nodes)
    .filter((n) => n.type === 'level')
    .sort((a, b) => levelNumber(b) - levelNumber(a))
}

export function levelNumber(node: AnyNode): number {
  return (node as { level?: number }).level ?? 0
}

export function levelName(node: AnyNode): string {
  return (node as { name?: string }).name?.trim() || `Level ${levelNumber(node)}`
}

export type Unit = 'metric' | 'imperial'

export function formatLength(metres: number, unit: Unit): string {
  if (unit === 'metric') return metres >= 10 ? `${metres.toFixed(1)} m` : `${metres.toFixed(2)} m`
  const totalInches = metres / 0.0254
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  if (inches === 12) return `${feet + 1}′ 0″`
  return feet > 0 ? `${feet}′ ${inches}″` : `${inches}″`
}

export function formatArea(squareMetres: number, unit: Unit): string {
  return unit === 'metric'
    ? `${squareMetres.toFixed(1)} m²`
    : `${(squareMetres * 10.7639).toFixed(0)} ft²`
}

export type Measurement = { label: string; value: string }

function num(node: AnyNode, key: string): number | undefined {
  const v = (node as Record<string, unknown>)[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}

function vec2(node: AnyNode, key: string): [number, number] | undefined {
  const v = (node as Record<string, unknown>)[key]
  return Array.isArray(v) && v.length >= 2 ? [Number(v[0]), Number(v[1])] : undefined
}

function polygonArea(points: [number, number][]): number {
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]!
    const [x2, y2] = points[(i + 1) % points.length]!
    sum += x1 * y2 - x2 * y1
  }
  return Math.abs(sum) / 2
}

/** The dimensions a plan reviewer reads first, per kind of element. */
export function measurements(node: AnyNode, unit: Unit): Measurement[] {
  const out: Measurement[] = []
  const length = (label: string, metres: number | undefined) => {
    if (metres !== undefined && metres > 0) out.push({ label, value: formatLength(metres, unit) })
  }

  switch (node.type) {
    case 'door':
    case 'window':
      length('Width', num(node, 'width'))
      length('Height', num(node, 'height'))
      break
    case 'wall': {
      const start = vec2(node, 'start')
      const end = vec2(node, 'end')
      if (start && end) length('Length', Math.hypot(end[0] - start[0], end[1] - start[1]))
      length('Thickness', num(node, 'thickness'))
      length('Height', num(node, 'height'))
      break
    }
    case 'zone': {
      const polygon = (node as { polygon?: [number, number][] }).polygon
      if (polygon && polygon.length >= 3) {
        out.push({ label: 'Floor area', value: formatArea(polygonArea(polygon), unit) })
      }
      break
    }
    case 'slab':
      length('Thickness', num(node, 'thickness'))
      break
    case 'level':
      length('Floor-to-floor', num(node, 'height'))
      break
  }
  return out
}

/** Property sets flattened to rows, skipping empty values. */
export function propertyRows(node: AnyNode): { set: string; name: string; value: string }[] {
  const rows: { set: string; name: string; value: string }[] = []
  for (const [set, props] of Object.entries(ifcMeta(node).properties ?? {})) {
    for (const [name, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === '') continue
      rows.push({
        set,
        name,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      })
    }
  }
  return rows
}
