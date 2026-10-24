'use client'

// The 3D view: Pascal's <Viewer> (WebGPU, React Three Fiber) with camera
// controls and helpers that live inside the Canvas — camera framing, floor
// isolation, and selection emphasis (translucent context around the focus).

import { type AnyNode, type AnyNodeId, sceneRegistry, useScene } from '@pascal-app/core'
import type { PascalSceneGraph } from '@pascal-app/ifc-converter'
import { useViewer, Viewer } from '@pascal-app/viewer'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Box3, type Object3D, Sphere } from 'three'
import { applyFocusFade, clearFocusFade, setFocusFadeOpacity } from '@/lib/focus-fade'
import { levelOf } from '@/lib/node-info'
import { useReview } from '@/lib/review-store'

// Structural subset of drei's CameraControls (camera-controls is only a
// transitive dependency, so its type isn't importable here).
type Controls = {
  azimuthAngle: number
  rotateTo: (azimuth: number, polar: number, transition: boolean) => Promise<unknown>
  fitToSphere: (sphere: Sphere, transition: boolean) => Promise<unknown>
}

function boundsOf(object: Object3D): Box3 | null {
  const box = new Box3().setFromObject(object)
  return box.isEmpty() ? null : box
}

function buildingId(): string | undefined {
  const nodes = useScene.getState().nodes as Record<string, AnyNode>
  return Object.values(nodes).find((n) => n.type === 'building')?.id
}

const POLL_MS = 150
const MAX_POLLS = 80
// Camera angles, in radians. Polar is measured from straight overhead.
const BUILDING_AZIMUTH = Math.PI / 4 // three-quarter view from a corner
const BUILDING_POLAR = 1.1 // about 27° above the horizon
const ELEMENT_POLAR = 0.75 // about 47° above the horizon, looking down into the room
// Metres of context kept around a focused element.
const ELEMENT_CONTEXT = 1.5
/**
 * Frames one element, or the building when no element is given, whenever
 * `useReview.focusNode` is called.
 *
 * - An element's floor is isolated and the camera looks down into it, so
 *   walls and the floors above never stand between the camera and the
 *   element.
 * - Pascal builds wall, slab and roof geometry over several frames after a
 *   scene loads, so bounds are polled until they stop changing.
 * - The site's ground is never framed: it is far larger than the building.
 */
function CameraFocus() {
  const controls = useThree((s) => s.controls) as Controls | null
  const request = useReview((s) => s.focusRequest)

  useEffect(() => {
    if (!controls) return
    let cancelled = false
    let polls = 0
    let last: Box3 | null = null
    let timer = 0

    if (request.nodeId) {
      const nodes = useScene.getState().nodes as Record<string, AnyNode>
      const level = levelOf(nodes, request.nodeId)
      if (level) useReview.getState().setIsolatedLevelId(level.id)
    }

    const tick = () => {
      if (cancelled) return
      const id = request.nodeId ?? buildingId()
      const target = id ? sceneRegistry.nodes.get(id) : undefined
      const box = target ? boundsOf(target) : null
      const settled = box && last && box.equals(last)
      polls++
      if (box && (settled || polls >= MAX_POLLS)) {
        // fitToSphere keeps the angle set here; fitToBox would snap the
        // camera back to the nearest axis-aligned elevation.
        if (request.nodeId) {
          controls.rotateTo(controls.azimuthAngle, ELEMENT_POLAR, true)
          box.expandByScalar(ELEMENT_CONTEXT)
        } else {
          controls.rotateTo(BUILDING_AZIMUTH, BUILDING_POLAR, true)
        }
        controls.fitToSphere(box.getBoundingSphere(new Sphere()), true)
        return
      }
      if (polls >= MAX_POLLS) return
      last = box
      timer = window.setTimeout(tick, POLL_MS)
    }
    tick()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [request, controls])

  return null
}

/** Pascal hides every level above the selected one when this flag is set. */
function FloorIsolation() {
  const isolatedLevelId = useReview((s) => s.isolatedLevelId)
  useEffect(() => {
    const { selection, setSelection } = useViewer.getState()
    if (isolatedLevelId && selection.levelId !== isolatedLevelId) {
      // Changing the level resets the element selection unless it is passed
      // along; keep it, so focusing an element doesn't deselect it.
      setSelection({
        levelId: isolatedLevelId as never,
        zoneId: selection.zoneId,
        selectedIds: selection.selectedIds,
      })
    }
    useViewer.setState({ hideLevelsAboveSelection: isolatedLevelId !== null })
  }, [isolatedLevelId])
  return null
}

/**
 * Keep the selected element solid; fade everything else by the user's
 * see-through setting. Rooms (zones) are skipped — their 3D overlays are off.
 *
 * Selection changes must not tear down the fade (that was the hitch). Opacity
 * changes write through to shared ghost materials. Wall-mode swaps are left
 * alone — re-fading on every geometryRevision recloned the whole building.
 */
function SelectionEmphasis() {
  const scene = useThree((s) => s.scene)
  const selectedId = useViewer((s) => s.selection.selectedIds[0] as string | undefined)
  const zoneId = useViewer((s) => s.selection.zoneId as string | null)
  const seeThrough = useReview((s) => s.focusSeeThrough)
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>

  const focusId = selectedId ?? zoneId ?? null
  const focusType = focusId ? nodes[focusId]?.type : undefined
  const opacity = 1 - seeThrough / 100
  const active = focusId != null && focusType !== 'zone' && seeThrough > 0

  // Apply / update fade when the focused element changes. Do not clear on
  // cleanup — the next apply diffs in place. Opacity is read at apply time
  // so the slider can stay on its cheap path without restarting this walk.
  useEffect(() => {
    if (!active || !focusId) return
    let cancel: () => void = () => {}
    const raf = requestAnimationFrame(() => {
      const see = useReview.getState().focusSeeThrough
      cancel = applyFocusFade(scene, [focusId], 1 - see / 100).cancel
    })
    return () => {
      cancelAnimationFrame(raf)
      cancel()
    }
  }, [active, focusId, scene])

  // Opacity slider: cheap path, no traversal of unfaded meshes.
  useEffect(() => {
    if (!active) return
    setFocusFadeOpacity(opacity)
  }, [active, opacity])

  // Only clear when focus turns off (deselection or Focus toggle → 0%).
  useEffect(() => {
    if (!active) clearFocusFade()
  }, [active])

  return null
}

// Review models are large (the clinic is ~3k nodes). Skip SSGI/denoise so a
// normal laptop stays interactive; keep outline for selection, and cap FPS.
const REVIEW_PRESENTATION = {
  postprocessing: { ambientOcclusion: false, colorGrading: false },
  shadows: false,
} as const

const REVIEW_MAX_FPS = 30

export default function ModelViewer({
  graph,
  paused = false,
}: {
  graph: PascalSceneGraph
  /** Stop advancing frames while a loading/error overlay covers the canvas. */
  paused?: boolean
}) {
  const setScene = useScene((s) => s.setScene)

  useEffect(() => {
    // Keep zone <Html> portals off across model swaps (see lib/bootstrap.ts).
    useViewer.getState().setShowZones(false)
    clearFocusFade()
    setScene(graph.nodes as Record<AnyNodeId, AnyNode>, graph.rootNodeIds as AnyNodeId[])
    // Pre-selecting the building and a level lets the first click on a wall
    // or door select that element instead of drilling into the building.
    const all = Object.values(graph.nodes) as AnyNode[]
    const building = all.find((n) => n.type === 'building')
    const level = all
      .filter((n) => n.type === 'level')
      .sort(
        (a, b) => ((a as { level?: number }).level ?? 0) - ((b as { level?: number }).level ?? 0),
      )
      .find((n) => ((n as { level?: number }).level ?? 0) >= 1)
    useViewer.getState().setSelection({
      buildingId: (building?.id ?? null) as never,
      levelId: (level?.id ?? null) as never,
      zoneId: null,
      selectedIds: [],
    })
    useReview.getState().setIsolatedLevelId(null)
    useReview.getState().focusNode(null)
  }, [graph, setScene])

  return (
    <Viewer
      maxFps={REVIEW_MAX_FPS}
      presentation={REVIEW_PRESENTATION}
      renderPaused={paused}
      useBvh={false}
    >
      <CameraControls makeDefault />
      <CameraFocus />
      <FloorIsolation />
      <SelectionEmphasis />
    </Viewer>
  )
}
