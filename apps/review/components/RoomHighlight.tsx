'use client'

import { type AnyNode, sceneRegistry, useScene, type ZoneNode } from '@pascal-app/core'
import { createZoneShape, createZoneWallGeometry, useViewer } from '@pascal-app/viewer'
import { createPortal, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import { Color, DoubleSide, type Object3D } from 'three'
import { color, float } from 'three/tsl'
import { MeshBasicNodeMaterial } from 'three/webgpu'

/** Brand accent — the selected room stays vividly coloured while context goes gray. */
const HIGHLIGHT = '#1f5fff'

/**
 * Coloured floor + wall wash for the selected room. Zone meshes are normally
 * off in review (Html labels lag on large models), so this portal paints only
 * the active room into its registered group.
 */
export function RoomHighlight() {
  const zoneId = useViewer((s) => s.selection.zoneId) as string | null
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const zone = zoneId ? nodes[zoneId] : undefined
  const isZone = zone?.type === 'zone'

  // Zone groups mount a frame or two after setScene; poll until present.
  const [host, setHost] = useState<Object3D | null>(null)
  useFrame(() => {
    if (!zoneId || !isZone) {
      if (host) setHost(null)
      return
    }
    const next = sceneRegistry.nodes.get(zoneId) ?? null
    if (next !== host) setHost(next)
  })

  if (!zoneId || !isZone || !host || !zone) return null
  return createPortal(<RoomVolume node={zone as ZoneNode} />, host)
}

function RoomVolume({ node }: { node: ZoneNode }) {
  const floorShape = useMemo(
    () => (node.polygon.length >= 3 ? createZoneShape(node) : null),
    [node],
  )
  const wallGeometry = useMemo(
    () => (node.polygon.length >= 3 ? createZoneWallGeometry(node) : null),
    [node],
  )

  const floorMaterial = useMemo(() => {
    const base = color(new Color(HIGHLIGHT))
    return new MeshBasicNodeMaterial({
      transparent: true,
      colorNode: base,
      opacityNode: float(0.35),
      side: DoubleSide,
      depthWrite: false,
      depthTest: true,
    })
  }, [])

  const wallMaterial = useMemo(() => {
    const base = color(new Color(HIGHLIGHT))
    return new MeshBasicNodeMaterial({
      transparent: true,
      colorNode: base,
      opacityNode: float(0.55),
      side: DoubleSide,
      depthWrite: false,
      depthTest: true,
    })
  }, [])

  useEffect(
    () => () => {
      floorMaterial.dispose()
      wallMaterial.dispose()
      wallGeometry?.dispose()
    },
    [floorMaterial, wallMaterial, wallGeometry],
  )

  if (!floorShape || !wallGeometry) return null

  return (
    <group userData={{ reviewFocusKeep: true }}>
      <mesh
        material={floorMaterial}
        name="review-room-floor"
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ reviewFocusKeep: true }}
      >
        <shapeGeometry args={[floorShape]} />
      </mesh>
      <mesh
        geometry={wallGeometry}
        material={wallMaterial}
        name="review-room-walls"
        userData={{ reviewFocusKeep: true }}
      />
    </group>
  )
}
