import type { AnyNode, ZoneNode } from '@pascal-app/core'
import { Box3, Vector3 } from 'three'
import { levelOf } from './node-info'

/**
 * IDs that stay in full color under focus: the selection, and for rooms the
 * walls that enclose them (plus openings on those walls).
 */
export function focusKeepIds(nodes: Record<string, AnyNode>, focusId: string): string[] {
  const node = nodes[focusId]
  if (!node) return [focusId]
  if (node.type !== 'zone') return [focusId]

  const zone = node as ZoneNode
  const keep = new Set<string>([focusId])
  for (const wallId of zone.boundaryWallIds ?? []) keep.add(wallId)

  for (const other of Object.values(nodes)) {
    if (other.type !== 'door' && other.type !== 'window') continue
    const parentId = (other as { parentId?: string }).parentId
    if (parentId && keep.has(parentId)) keep.add(other.id)
  }
  return [...keep]
}

/** World-ish bounds for framing: mesh when present, else a room's polygon. */
export function focusBounds(
  nodes: Record<string, AnyNode>,
  focusId: string,
  meshBox: Box3 | null,
): Box3 | null {
  if (meshBox && !meshBox.isEmpty()) return meshBox

  const node = nodes[focusId]
  if (node?.type !== 'zone') return null
  const zone = node as ZoneNode
  if (!zone.polygon || zone.polygon.length < 3) return null

  const level = levelOf(nodes, focusId)
  const y0 = zone.floor?.elevation ?? 0
  const height = Math.max(2.4, (level as { height?: number } | undefined)?.height ?? 2.7)
  const box = new Box3()
  for (const [x, z] of zone.polygon) {
    box.expandByPoint(new Vector3(x, y0, z))
    box.expandByPoint(new Vector3(x, y0 + height, z))
  }
  for (const hole of zone.holes ?? []) {
    for (const [x, z] of hole) {
      box.expandByPoint(new Vector3(x, y0, z))
      box.expandByPoint(new Vector3(x, y0 + height, z))
    }
  }
  return box.isEmpty() ? null : box
}
