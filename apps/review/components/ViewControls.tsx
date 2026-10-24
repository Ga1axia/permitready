'use client'

import { type AnyNode, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import { Aperture, Box, Layers, Maximize, Ruler, Square } from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { levelName, sortedLevels } from '@/lib/node-info'
import { DEFAULT_FOCUS_SEE_THROUGH, useReview } from '@/lib/review-store'

const WALL_MODES = [
  { id: 'up', label: 'Full', hint: 'Walls at full height' },
  { id: 'cutaway', label: 'Cutaway', hint: 'Walls facing the camera are cut away' },
  { id: 'down', label: 'Plan', hint: 'Walls cut low, like a floor plan' },
  { id: 'translucent', label: 'X-ray', hint: 'See-through walls' },
] as const

const chrome =
  'rounded-lg border border-rule bg-panel/95 shadow-[0_1px_2px_rgba(23,32,44,0.06),0_4px_16px_rgba(23,32,44,0.08)] backdrop-blur'

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
  const seeThrough = useReview((s) => s.focusSeeThrough)
  const setSeeThrough = useReview((s) => s.setFocusSeeThrough)
  const focusOn = seeThrough > 0

  return (
    <div
      className={`${chrome} flex flex-wrap items-center gap-0.5 p-1`}
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
            ? 'Turn off selection focus (building stays fully opaque)'
            : 'When you select an element, fade the rest of the building'
        }
      >
        <Aperture className="size-3.5" />
        Focus
      </Segment>
      {focusOn && (
        <label
          className="ml-0.5 flex h-7 items-center gap-1.5 px-1.5 text-ink-soft text-xs"
          title="How see-through the rest of the building is while something is selected"
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
      <Segment
        active={false}
        onClick={() => focusNode(null)}
        title="Fit the whole building in view"
      >
        <Maximize className="size-3.5" />
        Fit
      </Segment>
    </div>
  )
}

/** Top floor first. Picking a floor hides every floor above it. */
export function FloorPicker() {
  const nodes = useScene((s) => s.nodes) as Record<string, AnyNode>
  const isolated = useReview((s) => s.isolatedLevelId)
  const setIsolated = useReview((s) => s.setIsolatedLevelId)
  const levels = useMemo(() => sortedLevels(nodes), [nodes])

  if (levels.length <= 1) return null

  const row = (active: boolean) =>
    [
      'flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
      active
        ? 'bg-accent-soft font-medium text-accent'
        : 'text-ink-soft hover:bg-paper hover:text-ink',
    ].join(' ')

  return (
    <nav aria-label="Floors" className={`${chrome} flex w-40 flex-col gap-0.5 p-1`}>
      <p className="px-2.5 pt-1 pb-1 font-medium text-[10px] text-ink-faint uppercase tracking-[0.08em]">
        Floors
      </p>
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
    </nav>
  )
}
