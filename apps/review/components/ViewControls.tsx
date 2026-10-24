'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import {
  Aperture,
  Box,
  ChevronsUpDown,
  GripVertical,
  Layers,
  Maximize,
  Ruler,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { levelName, sortedLevels } from '@/lib/node-info'
import { DEFAULT_FOCUS_SEE_THROUGH, useReview } from '@/lib/review-store'

const WALL_MODES = [
  { id: 'up', label: 'Full', hint: 'Walls at full height' },
  { id: 'cutaway', label: 'Cutaway', hint: 'Walls facing the camera are cut away' },
  { id: 'down', label: 'Plan', hint: 'Walls cut low, like a floor plan' },
  { id: 'translucent', label: 'X-ray', hint: 'See-through walls' },
] as const

const chrome =
  'rounded-xl border border-rule/80 bg-panel/90 shadow-[0_1px_2px_rgba(20,20,20,0.04),0_8px_28px_rgba(20,20,20,0.1)] backdrop-blur-md'

function Segment({
  active,
  children,
  onClick,
  title,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      aria-pressed={active}
      className={[
        'flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium text-xs transition-colors',
        active ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-paper hover:text-ink',
      ].join(' ')}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-rule" />
}

function IconSegment({
  active,
  children,
  onClick,
  title,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      aria-label={title}
      aria-pressed={active}
      className={[
        'flex size-7 items-center justify-center rounded-md transition-colors',
        active ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-paper hover:text-ink',
      ].join(' ')}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
}

export function ViewToolbar() {
  const wallMode = useViewer((s) => s.wallMode)
  const setWallMode = useViewer((s) => s.setWallMode)
  const levelMode = useViewer((s) => s.levelMode)
  const setLevelMode = useViewer((s) => s.setLevelMode)
  const cameraMode = useViewer((s) => s.cameraMode)
  const setCameraMode = useViewer((s) => s.setCameraMode)
  const unit = useReview((s) => s.unit)
  const setUnit = useReview((s) => s.setUnit)
  const focusNode = useReview((s) => s.focusNode)
  const zoomBy = useReview((s) => s.zoomBy)
  const seeThrough = useReview((s) => s.focusSeeThrough)
  const setSeeThrough = useReview((s) => s.setFocusSeeThrough)
  const focusOn = seeThrough > 0

  return (
    <div
      className={`${chrome} drafted-settle flex flex-wrap items-center gap-0.5 p-1`}
      role="toolbar"
      aria-label="View"
    >
      {WALL_MODES.map((m) => (
        <Segment
          active={wallMode === m.id}
          key={m.id}
          onClick={() => setWallMode(m.id)}
          title={m.hint}
        >
          {m.label}
        </Segment>
      ))}
      <Divider />
      <Segment
        active={levelMode === 'exploded'}
        onClick={() => setLevelMode(levelMode === 'exploded' ? 'stacked' : 'exploded')}
        title="Pull the floors apart vertically"
      >
        <Layers className="size-3.5" />
        Explode
      </Segment>
      <Segment
        active={cameraMode === 'orthographic'}
        onClick={() => setCameraMode(cameraMode === 'perspective' ? 'orthographic' : 'perspective')}
        title="Switch between perspective and orthographic camera"
      >
        {cameraMode === 'perspective' ? (
          <Box className="size-3.5" />
        ) : (
          <Square className="size-3.5" />
        )}
        {cameraMode === 'perspective' ? '3D' : 'Ortho'}
      </Segment>
      <Segment
        active={false}
        onClick={() => setUnit(unit === 'imperial' ? 'metric' : 'imperial')}
        title="Switch measurement units"
      >
        <Ruler className="size-3.5" />
        {unit === 'imperial' ? 'ft-in' : 'm'}
      </Segment>
      <Divider />
      <Segment
        active={focusOn}
        onClick={() => setSeeThrough(focusOn ? 0 : DEFAULT_FOCUS_SEE_THROUGH)}
        title={
          focusOn
            ? 'Turn off selection focus (context stays coloured)'
            : 'When you select something, drain colour from the rest of the building'
        }
      >
        <Aperture className="size-3.5" />
        Focus
      </Segment>
      {focusOn && (
        <label
          className="ml-0.5 flex h-7 items-center gap-1.5 px-1.5 text-ink-soft text-xs"
          title="How see-through the grayed-out context is"
        >
          <span className="sr-only">Focus see-through</span>
          <input
            aria-valuemax={95}
            aria-valuemin={10}
            aria-valuenow={seeThrough}
            className="h-1 w-20 cursor-pointer accent-accent"
            max={95}
            min={10}
            onChange={(e) => setSeeThrough(Number(e.target.value))}
            step={5}
            type="range"
            value={seeThrough}
          />
          <span className="w-8 font-mono text-[11px] text-ink-faint tabular-nums">
            {seeThrough}%
          </span>
        </label>
      )}
      <Divider />
      <IconSegment active={false} onClick={() => zoomBy(1 / 1.35)} title="Zoom in">
        <ZoomIn className="size-3.5" />
      </IconSegment>
      <IconSegment active={false} onClick={() => zoomBy(1.35)} title="Zoom out">
        <ZoomOut className="size-3.5" />
      </IconSegment>
      <IconSegment
        active={false}
        onClick={() => focusNode(null)}
        title="Fit the whole building in view"
      >
        <Maximize className="size-3.5" />
      </IconSegment>
    </div>
  )
}

const FLOOR_POS_KEY = 'permitready.floors.pos'
const FLOOR_OPEN_KEY = 'permitready.floors.open'

/** Top floor first. Picking a floor hides every floor above it. Draggable + foldable. */
export function FloorPicker() {
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const isolated = useReview((s) => s.isolatedLevelId)
  const setIsolated = useReview((s) => s.setIsolatedLevelId)
  const levels = useMemo(() => sortedLevels(nodes), [nodes])

  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(FLOOR_OPEN_KEY) === '1'
  })
  const [pos, setPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 12, y: 64 }
    try {
      const raw = window.localStorage.getItem(FLOOR_POS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number }
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return { x: parsed.x, y: parsed.y }
        }
      }
    } catch {
      // fall through
    }
    return { x: 12, y: 64 }
  })
  const drag = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null)
  const moved = useRef(false)

  useEffect(() => {
    window.localStorage.setItem(FLOOR_OPEN_KEY, open ? '1' : '0')
  }, [open])

  useEffect(() => {
    window.localStorage.setItem(FLOOR_POS_KEY, JSON.stringify(pos))
  }, [pos])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      drag.current = { ox: e.clientX, oy: e.clientY, sx: pos.x, sy: pos.y }
      moved.current = false
    },
    [pos.x, pos.y],
  )

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const start = drag.current
    if (!start) return
    const dx = e.clientX - start.ox
    const dy = e.clientY - start.oy
    if (Math.hypot(dx, dy) > 3) moved.current = true
    const maxX = Math.max(0, window.innerWidth - 180)
    const maxY = Math.max(0, window.innerHeight - 48)
    setPos({
      x: Math.min(maxX, Math.max(0, start.sx + dx)),
      y: Math.min(maxY, Math.max(0, start.sy + dy)),
    })
  }, [])

  const onPointerUp = useCallback(() => {
    drag.current = null
  }, [])

  if (levels.length <= 1) return null

  const row = (active: boolean) =>
    [
      'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
      active
        ? 'bg-accent-soft font-medium text-accent'
        : 'text-ink-soft hover:bg-paper hover:text-ink',
    ].join(' ')

  const isolatedLevel = isolated ? levels.find((l) => l.id === isolated) : undefined
  const activeLabel =
    isolated === null ? 'All floors' : isolatedLevel ? levelName(isolatedLevel) : 'Floors'

  return (
    <nav
      aria-label="Floors"
      className={`${chrome} drafted-settle pointer-events-auto absolute z-[2] flex w-44 flex-col gap-0.5 p-1`}
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="flex cursor-grab items-center gap-1 rounded-md px-1 py-0.5 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <GripVertical aria-hidden className="size-3.5 shrink-0 text-ink-faint" />
        <p className="min-w-0 flex-1 truncate font-medium text-[10px] text-ink-faint uppercase tracking-[0.08em]">
          {open ? 'Floors' : activeLabel}
        </p>
        <button
          aria-expanded={open}
          aria-label={open ? 'Collapse floors' : 'Expand floors'}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-paper hover:text-ink"
          onClick={() => {
            if (moved.current) return
            setOpen((v) => !v)
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title={open ? 'Collapse' : 'Expand'}
          type="button"
        >
          <ChevronsUpDown className="size-3.5" />
        </button>
      </div>
      {open && (
        <>
          <button
            aria-pressed={isolated === null}
            className={row(isolated === null)}
            onClick={() => setIsolated(null)}
            type="button"
          >
            All floors
          </button>
          {levels.map((level) => (
            <button
              aria-pressed={isolated === level.id}
              className={row(isolated === level.id)}
              key={level.id}
              onClick={() => setIsolated(level.id)}
              title={`Show ${levelName(level)} and everything below it`}
              type="button"
            >
              <span className="truncate">{levelName(level)}</span>
            </button>
          ))}
        </>
      )}
    </nav>
  )
}
