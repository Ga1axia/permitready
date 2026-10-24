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
import { Box3, type Object3D, type PerspectiveCamera, Sphere } from 'three'
import { applyFocusFade, clearFocusFade, setFocusFadeOpacity } from '@/lib/focus-fade'
import { focusBounds, focusKeepIds } from '@/lib/focus-targets'
import { levelOf } from '@/lib/node-info'
import { useReview } from '@/lib/review-store'
import { applyViolationHighlight, clearViolationHighlight } from '@/lib/violation-highlight'
import { RoomHighlight } from './RoomHighlight'

// Structural subset of drei's CameraControls (camera-controls is only a
// transitive dependency, so its type isn't importable here).
type Controls = {
  azimuthAngle: number
  distance: number
  dollyTo: (distance: number, transition: boolean) => Promise<unknown>
  rotateTo: (azimuth: number, polar: number, transition: boolean) => Promise<unknown>
  fitToSphere: (sphere: Sphere, transition: boolean) => Promise<unknown>
}

/** Tighter than Pascal's default 50° — less wide-angle distortion in a tall split pane. */
const REVIEW_FOV = 38
/** Extra air around a fit so the building doesn't press the edges. */
const FIT_PADDING = 1.2

function boundsOf(object: Object3D): Box3 | null {
  const box = new Box3().setFromObject(object)
  return box.isEmpty() ? null : box
}

function buildingId(): string | undefined {
  const nodes = useScene.getState().nodes as Record<string, AnyNode>
  return Object.values(nodes).find((n) => n.type === 'building')?.id
}

/**
 * When the scene was last (re)built. CameraFocus polls for settling bounds
 * only while within SETTLE_WINDOW_MS of this; after that the geometry is
 * stable and framing is immediate — no per-interaction poll latency.
 */
let sceneBuiltAt = 0
function markSceneBuilt() {
  sceneBuiltAt = performance.now()
}

const POLL_MS = 32
const MAX_POLLS = 80
/**
 * How long after a scene (re)build geometry may still be growing. Within this
 * window CameraFocus polls until bounds settle; outside it, the scene is
 * stable and framing happens on the first poll with no dead time.
 */
const SETTLE_WINDOW_MS = 1200
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
 *   scene loads, so bounds are polled until they stop changing — but only
 *   within SETTLE_WINDOW_MS of a scene build. Once the scene is stable,
 *   framing happens on the first poll so selecting, highlighting and
 *   changing views react without the poll's dead time.
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
      const nodes = useScene.getState().nodes as Record<string, AnyNode>
      const id = request.nodeId ?? buildingId()
      const target = id ? sceneRegistry.nodes.get(id) : undefined
      let box = target ? boundsOf(target) : null
      if (request.nodeId) {
        const fromNode = focusBounds(nodes, request.nodeId, box)
        if (fromNode) {
          // Polygon bounds are in the level's local frame — lift to world.
          const level = levelOf(nodes, request.nodeId)
          const levelObj = level ? sceneRegistry.nodes.get(level.id) : undefined
          if (levelObj) {
            levelObj.updateWorldMatrix(true, false)
            fromNode.applyMatrix4(levelObj.matrixWorld)
          }
          box = fromNode
        }
      }
      // Outside the post-build window the scene is stable, so the first
      // non-empty bounds are final — frame immediately with no extra poll.
      // Within the window geometry may still be growing, so wait until two
      // consecutive polls agree before committing the camera.
      const building = performance.now() - sceneBuiltAt < SETTLE_WINDOW_MS
      const settled = box && (!building || (last && box.equals(last)))
      polls++
      if (box && (settled || polls >= MAX_POLLS || nodes[request.nodeId ?? '']?.type === 'zone')) {
        // fitToSphere keeps the angle set here; fitToBox would snap the
        // camera back to the nearest axis-aligned elevation.
        if (request.nodeId) {
          controls.rotateTo(controls.azimuthAngle, ELEMENT_POLAR, true)
          box.expandByScalar(ELEMENT_CONTEXT)
        } else {
          controls.rotateTo(BUILDING_AZIMUTH, BUILDING_POLAR, true)
        }
        const sphere = box.getBoundingSphere(new Sphere())
        sphere.radius *= FIT_PADDING
        controls.fitToSphere(sphere, true)
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
 * Selection stays coloured; everything else goes gray and see-through.
 * Rooms use the same path (plus a coloured room wash in RoomHighlight).
 */
function SelectionEmphasis() {
  const scene = useThree((s) => s.scene)
  const selectedId = useViewer((s) => s.selection.selectedIds[0] as string | undefined)
  const zoneId = useViewer((s) => s.selection.zoneId as string | null)
  const seeThrough = useReview((s) => s.focusSeeThrough)

  const focusId = selectedId ?? zoneId ?? null
  const opacity = 1 - seeThrough / 100
  const active = focusId != null && seeThrough > 0

  useEffect(() => {
    if (!active || !focusId) return
    let cancel: () => void = () => {}
    const raf = requestAnimationFrame(() => {
      const see = useReview.getState().focusSeeThrough
      const ids = focusKeepIds(useScene.getState().nodes as Record<string, AnyNode>, focusId)
      cancel = applyFocusFade(scene, ids, 1 - see / 100).cancel
    })
    return () => {
      cancelAnimationFrame(raf)
      cancel()
    }
  }, [active, focusId, scene])

  useEffect(() => {
    if (!active) return
    setFocusFadeOpacity(opacity)
  }, [active, opacity])

  useEffect(() => {
    if (!active) clearFocusFade()
  }, [active])

  return null
}

/**
 * Subscribes directly to violationIds in the store and applies the highlight
 * synchronously — no React render cycle, no rAF, no async hops.
 * Mounted once inside the Viewer canvas so it has access to the Three.js scene.
 */
function ViolationEmphasis() {
  useEffect(() => {
    const apply = (ids: ReadonlyArray<string>) => {
      if (ids.length === 0) clearViolationHighlight()
      else applyViolationHighlight(ids)
    }

    // Run immediately with current state.
    apply(useReview.getState().violationIds)

    // Subscribe to future changes, filtering to violationIds only.
    let prev = useReview.getState().violationIds
    return useReview.subscribe((state) => {
      if (state.violationIds !== prev) {
        prev = state.violationIds
        apply(state.violationIds)
      }
    })
  }, [])

  return null
}

/**
 * Keep FOV architectural (not wide-angle) and re-frame when the PDF split
 * changes the canvas aspect — otherwise the first fit is for full width and
 * the half-pane view looks fisheyed.
 */
function ReviewCamera() {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as Controls | null
  const pdfOpen = useReview((s) => s.pdfOpen)
  const focusNode = useReview((s) => s.focusNode)
  const zoomRequest = useReview((s) => s.zoomRequest)

  useEffect(() => {
    const cam = camera as PerspectiveCamera
    if (!cam.isPerspectiveCamera) return
    if (cam.fov === REVIEW_FOV) return
    cam.fov = REVIEW_FOV
    cam.updateProjectionMatrix()
  }, [camera])

  // First fit often lands while the stage is still full-width; when drawings
  // open beside it the aspect shrinks and the same distance reads as fisheye.
  // Reframe after the split-pane layout has painted (two rAFs) rather than on
  // a fixed delay, so it reacts as soon as the new aspect is live.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pdfOpen is the trigger — reframe when the split toggles, not when its value is read.
  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => focusNode(null))
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [pdfOpen, focusNode])

  useEffect(() => {
    if (!controls || zoomRequest.seq === 0) return
    const next = Math.max(0.5, controls.distance * zoomRequest.factor)
    void controls.dollyTo(next, true)
  }, [zoomRequest, controls])

  return (
    <CameraControls
      makeDefault
      maxPolarAngle={Math.PI * 0.495}
      minDistance={0.5}
      // Smooth dolly reads less “lens jump” when the pane resizes.
      smoothTime={0.35}
    />
  )
}

// Soft studio look without full SSGI/denoise (those tank large IFCs).
// AO + shadows close most of the polish gap vs Pascal's editor.
const REVIEW_PRESENTATION = {
  postprocessing: { ambientOcclusion: true, colorGrading: false },
  shadows: true,
} as const

const REVIEW_MAX_FPS = 45

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
    clearViolationHighlight()
    useReview.getState().setViolationIds([])
    setScene(graph.nodes as Record<AnyNodeId, AnyNode>, graph.rootNodeIds as AnyNodeId[])
    // Open the settle window: CameraFocus polls for growing geometry only for
    // a short time after this, then frames instantly on later interactions.
    markSceneBuilt()
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
      <ReviewCamera />
      <CameraFocus />
      <FloorIsolation />
      <SelectionEmphasis />
      <ViolationEmphasis />
      <RoomHighlight />
    </Viewer>
  )
}
