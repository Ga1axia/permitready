import type { AnyNode } from '@pascal-app/core'
import { ifcMeta } from './node-info'

/** Build GlobalId → node id once per scene. */
export function buildGlobalIdIndex(nodes: Record<string, AnyNode>): Map<string, string> {
  const map = new Map<string, string>()
  for (const node of Object.values(nodes)) {
    const gid = ifcMeta(node).globalId
    if (gid) map.set(gid, node.id)
  }
  return map
}
