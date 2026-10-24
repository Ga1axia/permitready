import { collectIsolationSubtree } from '@pascal-app/viewer'
import type { Color, Material, Mesh, Object3D } from 'three'
import { color, float } from 'three/tsl'

/**
 * Soft-focus for the review viewer.
 *
 * - Context meshes are cloned once into shared "ghost" materials: gray (no
 *   hue) and see-through. The selection keeps its original coloured materials.
 * - Switching selection diffs in place; the opacity slider only retints ghosts.
 */

type NodeMaterial = Material & {
  opacityNode?: unknown
  colorNode?: unknown
  isNodeMaterial?: boolean
  color?: Color
  emissive?: Color
  map?: unknown
  emissiveMap?: unknown
}

type Worn = {
  original: Material | Material[]
  ghost: Material | Material[]
}

const worn = new WeakMap<Mesh, Worn>()
const faded = new Set<Mesh>()
const ghostOf = new Map<Material, Material>()
const originalOf = new Map<Material, Material>()
const ghostRefs = new Map<Material, number>()

let currentOpacity = 0.3
let applyToken = 0

/** Neutral gray for drained context — no residual brand/material hue. */
const GHOST_HEX = 0x9a9a9a
const FAINT = 0.5
const CHUNK = 250

const eachOf = (material: Material | Material[]) =>
  Array.isArray(material) ? material : [material]

function isMesh(object: Object3D): object is Mesh {
  return (object as Mesh).isMesh === true && Boolean((object as Mesh).material)
}

/** Strip hue so context reads as tone only; opacity set separately. */
function drainColor(material: Material) {
  const m = material as NodeMaterial
  if (m.color?.isColor) m.color.setHex(GHOST_HEX)
  if (m.emissive?.isColor) m.emissive.setRGB(0, 0, 0)
  m.map = null
  m.emissiveMap = null
  if (m.isNodeMaterial || m.colorNode != null) {
    m.colorNode = color(GHOST_HEX)
  }
  m.needsUpdate = true
}

function writeOpacity(material: Material, opacity: number) {
  material.transparent = true
  material.opacity = opacity
  material.depthWrite = opacity > FAINT
  const nodeMat = material as NodeMaterial
  if (nodeMat.isNodeMaterial || nodeMat.opacityNode != null) {
    nodeMat.opacityNode = float(opacity)
  }
  material.needsUpdate = true
}

function styleGhost(material: Material, opacity: number) {
  drainColor(material)
  writeOpacity(material, opacity)
}

function retainGhost(original: Material): Material {
  let ghost = ghostOf.get(original)
  if (!ghost) {
    ghost = original.clone()
    styleGhost(ghost, currentOpacity)
    ghostOf.set(original, ghost)
    originalOf.set(ghost, original)
    ghostRefs.set(ghost, 0)
  }
  ghostRefs.set(ghost, (ghostRefs.get(ghost) ?? 0) + 1)
  return ghost
}

function releaseGhost(ghost: Material) {
  const next = (ghostRefs.get(ghost) ?? 1) - 1
  if (next <= 0) {
    ghostRefs.delete(ghost)
    const original = originalOf.get(ghost)
    if (original) ghostOf.delete(original)
    originalOf.delete(ghost)
    ghost.dispose()
  } else {
    ghostRefs.set(ghost, next)
  }
}

function retainGhosts(original: Material | Material[]): Material | Material[] {
  return Array.isArray(original) ? original.map((m) => retainGhost(m)) : retainGhost(original)
}

function releaseGhosts(ghost: Material | Material[]) {
  for (const material of eachOf(ghost)) releaseGhost(material)
}

function fadeMesh(mesh: Mesh) {
  const entry = worn.get(mesh)
  if (entry && mesh.material === entry.ghost) {
    faded.add(mesh)
    return
  }
  if (entry) {
    releaseGhosts(entry.ghost)
    worn.delete(mesh)
  }
  const original = mesh.material
  const ghost = retainGhosts(original)
  worn.set(mesh, { original, ghost })
  mesh.material = ghost
  faded.add(mesh)
}

function restoreMesh(mesh: Mesh) {
  const entry = worn.get(mesh)
  if (!entry) {
    faded.delete(mesh)
    return
  }
  if (mesh.material === entry.ghost) mesh.material = entry.original
  releaseGhosts(entry.ghost)
  worn.delete(mesh)
  faded.delete(mesh)
}

function pushOpacityToGhosts(opacity: number) {
  currentOpacity = opacity
  const seen = new Set<Material>()
  for (const mesh of faded) {
    const entry = worn.get(mesh)
    if (!entry) continue
    for (const material of eachOf(entry.ghost)) {
      if (seen.has(material)) continue
      seen.add(material)
      writeOpacity(material, opacity)
    }
  }
}

/**
 * Focus `ids`: those subtrees stay coloured and solid; everything else under
 * `root` goes gray and see-through.
 */
export function applyFocusFade(
  root: Object3D,
  ids: ReadonlyArray<string>,
  opacity: number,
): { cancel: () => void } {
  if (ids.length === 0) {
    clearFocusFade()
    return { cancel: () => undefined }
  }

  pushOpacityToGhosts(opacity)

  const keep = collectIsolationSubtree(ids)
  const toFade: Mesh[] = []
  root.traverse((object) => {
    if (!isMesh(object)) return
    if (object.userData?.reviewFocusKeep) {
      restoreMesh(object)
      return
    }
    if (keep.has(object)) {
      restoreMesh(object)
      return
    }
    toFade.push(object)
  })

  const toFadeSet = new Set(toFade)
  for (const mesh of [...faded]) {
    if (!toFadeSet.has(mesh)) restoreMesh(mesh)
  }

  let pending = 0
  for (const mesh of toFade) {
    const entry = worn.get(mesh)
    if (!(entry && mesh.material === entry.ghost)) pending++
  }
  if (pending === 0) return { cancel: () => undefined }

  const token = ++applyToken
  let index = 0
  let raf = 0

  const step = () => {
    if (token !== applyToken) return
    const end = Math.min(index + CHUNK, toFade.length)
    for (; index < end; index++) fadeMesh(toFade[index]!)
    if (index < toFade.length) raf = requestAnimationFrame(step)
  }
  step()

  return {
    cancel: () => {
      if (token === applyToken) applyToken++
      cancelAnimationFrame(raf)
    },
  }
}

/** Slider path — opacity only; ghosts stay drained of colour. */
export function setFocusFadeOpacity(opacity: number) {
  pushOpacityToGhosts(opacity)
}

/** Restore every faded mesh. */
export function clearFocusFade() {
  applyToken++
  for (const mesh of [...faded]) restoreMesh(mesh)
}

/**
 * Restore only the faded meshes that have `userData.reviewFocusKeep` set.
 * Called synchronously after violation meshes are tagged so they pop out of
 * the ghost state without re-running the full O(scene) applyFocusFade traversal.
 */
export function restoreTaggedMeshes(): void {
  for (const mesh of [...faded]) {
    if (mesh.userData.reviewFocusKeep) restoreMesh(mesh)
  }
}
