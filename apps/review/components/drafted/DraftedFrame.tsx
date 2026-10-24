import type { CSSProperties, ElementType, ReactNode } from 'react'

/**
 * A region drawn as a sheet: the `.drafted-frame` double hairline border
 * (outer medium stroke + inset hairline), echoing the plan-sheet border in
 * scripts/drawing_set/sheet.py. Part of the PermitReady "pizazz" language —
 * see .agents/skills/permitready-pizazz/SKILL.md.
 *
 * Pair with a motion class (`drafted-ink-in` / `drafted-settle`) via
 * `className`, and `drafted-trace` to ink the frame on. Reduced-motion is
 * handled by drafted.css.
 */
export function DraftedFrame({
  as: Tag = 'div',
  className = '',
  style,
  children,
  ...rest
}: {
  /** Element to render as. Defaults to a div. */
  as?: ElementType
  className?: string
  style?: CSSProperties
  children?: ReactNode
} & Record<string, unknown>) {
  return (
    <Tag className={`drafted-frame ${className}`.trim()} style={style} {...rest}>
      {children}
    </Tag>
  )
}
