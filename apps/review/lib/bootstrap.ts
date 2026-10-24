import { type AnyNodeDefinition, registerNode } from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import { useViewer } from '@pascal-app/viewer'

// Every built-in node kind must be in the registry before the first
// `<Viewer>` mounts, or each NodeRenderer resolves to nothing and the
// scene is empty. Same approach as apps/ifc-converter/lib/bootstrap.ts.
let loaded = false

export function loadBuiltins(): void {
  if (loaded) return
  loaded = true
  for (const def of builtinPlugin.nodes ?? []) {
    registerNode(def as AnyNodeDefinition)
  }
}

loadBuiltins()

// Zone visuals mount a drei `<Html>` React root per room. The clinic has
// hundreds; swapping models then tries to unmount those roots mid-render and
// React warns. Review doesn't need room overlays in 3D — rooms stay in the
// element list. Turn this off before any scene loads.
if (typeof window !== 'undefined') {
  useViewer.getState().setShowZones(false)
}
