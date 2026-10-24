/**
 * Red violation emissive overlay for code-check findings.
 *
 * Design goals:
 * - Zero async hops: every public call completes synchronously in one frame.
 * - Diff-based: applyViolationHighlight only touches meshes that actually
 *   changed, so clicking between findings swaps one room's materials, not all.
 * - No re-running applyFocusFade: after tagging violation meshes with
 *   reviewFocusKeep we call restoreTaggedMeshes() — O(faded set) — to pop
 *   them out of the ghost state without a full scene traversal.
 *
 * Material strategy:
 *   - Node materials (WebGPU): inject a TSL emissiveNode that pulses red
 *     entirely on the GPU — sin(time) in the shader, zero CPU per-frame cost.
 *   - Legacy materials: set emissive + emissiveIntensity, driven by a single
 *     shared rAF loop that touches only the overlay materials in the map.
 */

import { sceneRegistry } from '@pascal-app/core'
import type { Material, Mesh, Object3D } from 'three'
import { color, float, mix, sin, time } from 'three/tsl'
import { restoreTaggedMeshes } from './focus-fade'

// ─── types ─────────────────────────────────────────────────────────────────

type NodeMaterial = Material & {
  isNodeMaterial?: boolean
  colorNode?: unknown
  emissiveNode?: unknown
  color?: import('three').Color
  emissive?: import('three').Color
  emissiveIntensity?: number
  emissiveMap?: unknown
}

type HighlightEntry = {
  original: Material | Material[]
  overlay: Material | Material[]
}

// ─── constants ─────────────────────────────────────────────────────────────

const VIOLATION_RED = 0xff2020
const PULSE_LOW = 0.35
const PULSE_HIGH = 1.1
const PULSE_HZ = 1.4

// ─── module state ──────────────────────────────────────────────────────────

/** mesh → { original, overlay } for currently-highlighted meshes */
const highlighted = new Map<Mesh, HighlightEntry>()

/** original material → overlay clone (ref-counted) */
const overlayFor = new Map<Material, Material>()
/** overlay → ref count */
const overlayRefs = new Map<Material, number>()

/** currently-highlighted node ids (strings) for diffing */
let currentIds = new Set<string>()

// CPU pulse for legacy materials
let rafId = 0
let cpuRunning = false
let startTime = 0

// ─── TSL emissive node (GPU path) ──────────────────────────────────────────

function buildEmissiveNode() {
  // sin(t * 2π * Hz) → [0,1] → [PULSE_LOW, PULSE_HIGH]
  const wave = sin(time.mul(Math.PI * 2 * PULSE_HZ))
    .mul(0.5)
    .add(0.5)
  const intensity = mix(float(PULSE_LOW), float(PULSE_HIGH), wave)
  return color(VIOLATION_RED).mul(intensity)
}

// ─── CPU pulse (legacy materials) ─────────────────────────────────────────

function startCpuPulse() {
  if (cpuRunning) return
  cpuRunning = true
  startTime = performance.now()
  const tick = () => {
    if (!cpuRunning) return
    const t = (performance.now() - startTime) / 1000
    const wave = Math.sin(t * Math.PI * 2 * PULSE_HZ) * 0.5 + 0.5
    const intensity = PULSE_LOW + wave * (PULSE_HIGH - PULSE_LOW)
    for (const [, entry] of highlighted) {
      for (const mat of Array.isArray(entry.overlay) ? entry.overlay : [entry.overlay]) {
        const m = mat as NodeMaterial
        if (!m.isNodeMaterial && m.emissive) {
          m.emissiveIntensity = intensity
        }
      }
    }
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function stopCpuPulse() {
  cpuRunning = false
  cancelAnimationFrame(rafId)
}

// ─── per-material helpers ──────────────────────────────────────────────────

function isMesh(o: Object3D): o is Mesh {
  return (o as Mesh).isMesh === true && Boolean((o as Mesh).material)
}

function acquireOverlay(original: Material): Material {
  const existing = overlayFor.get(original)
  if (existing) {
    overlayRefs.set(existing, (overlayRefs.get(existing) ?? 0) + 1)
    return existing
  }
  const clone = original.clone() as NodeMaterial
  clone.userData = { ...clone.userData, __pascalCachedMaterial: false }
  clone.emissiveMap = null
  if (clone.isNodeMaterial) {
    clone.emissiveNode = buildEmissiveNode()
  } else {
    if (clone.emissive) clone.emissive.setHex(VIOLATION_RED)
    clone.emissiveIntensity = PULSE_LOW
  }
  clone.needsUpdate = true
  overlayFor.set(original, clone)
  overlayRefs.set(clone, 1)
  return clone
}

function acquireOverlays(original: Material | Material[]): Material | Material[] {
  return Array.isArray(original) ? original.map(acquireOverlay) : acquireOverlay(original)
}

function releaseOverlay(overlay: Material) {
  const refs = (overlayRefs.get(overlay) ?? 1) - 1
  if (refs <= 0) {
    overlayRefs.delete(overlay)
    // remove forward entry
    for (const [orig, ov] of overlayFor) {
      if (ov === overlay) {
        overlayFor.delete(orig)
        break
      }
    }
    overlay.dispose()
  } else {
    overlayRefs.set(overlay, refs)
  }
}

function releaseOverlays(overlay: Material | Material[]) {
  for (const m of Array.isArray(overlay) ? overlay : [overlay]) releaseOverlay(m)
}

/** Add red overlay to one mesh. Idempotent if already highlighted. */
function highlightMesh(mesh: Mesh): boolean {
  if (highlighted.has(mesh)) return false
  mesh.userData.reviewFocusKeep = true
  const original = mesh.material
  const overlay = acquireOverlays(original)
  highlighted.set(mesh, { original, overlay })
  mesh.material = overlay
  return true
}

/** Remove red overlay from one mesh. */
function unhighlightMesh(mesh: Mesh) {
  const entry = highlighted.get(mesh)
  if (!entry) return
  delete mesh.userData.reviewFocusKeep
  const mats = Array.isArray(entry.overlay) ? entry.overlay : [entry.overlay]
  const cur = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  if (cur.some((m) => mats.includes(m))) mesh.material = entry.original
  releaseOverlays(entry.overlay)
  highlighted.delete(mesh)
}

// ─── public API ────────────────────────────────────────────────────────────

/**
 * Apply/update the red violation overlay synchronously.
 *
 * Only meshes that are entering or leaving the highlighted set are touched —
 * clicking between two findings swaps one room's materials, not all.
 *
 * After tagging, restoreTaggedMeshes() pulls any newly-tagged meshes out of
 * the focus-fade ghost state without re-running the full scene traversal.
 */
export function applyViolationHighlight(ids: ReadonlyArray<string>): void {
  const nextIds = new Set(ids)

  // Collect meshes for the new set
  const nextMeshes = new Set<Mesh>()
  for (const id of nextIds) {
    const root = sceneRegistry.nodes.get(id)
    if (!root) continue
    root.traverse((obj) => {
      if (isMesh(obj)) nextMeshes.add(obj)
    })
  }

  // Remove meshes that left the set
  for (const [mesh] of [...highlighted]) {
    if (!nextMeshes.has(mesh)) unhighlightMesh(mesh)
  }

  // Add meshes that entered the set
  let hasLegacy = false
  for (const mesh of nextMeshes) {
    if (highlightMesh(mesh)) {
      const entry = highlighted.get(mesh)!
      for (const m of Array.isArray(entry.overlay) ? entry.overlay : [entry.overlay]) {
        if (!(m as NodeMaterial).isNodeMaterial) hasLegacy = true
      }
    }
  }

  // Pop newly-tagged meshes out of focus-fade ghost state — O(faded) not O(scene)
  restoreTaggedMeshes()

  currentIds = nextIds

  if (highlighted.size > 0 && hasLegacy) startCpuPulse()
  else if (highlighted.size === 0) stopCpuPulse()
}

/** Restore all highlighted meshes. Synchronous. */
export function clearViolationHighlight(): void {
  stopCpuPulse()
  for (const [mesh] of [...highlighted]) unhighlightMesh(mesh)
  currentIds.clear()
}
