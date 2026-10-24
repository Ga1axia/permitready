# Motion timings

The feel is a plotter inking a sheet: quick, mechanical, confident — never
bouncy or playful. All values are CSS variables in `app/drafted.css`.

| Variable | Value | Meaning |
| --- | --- | --- |
| `--drafted-ease` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | the one easing for every drafted motion |
| `--drafted-fast` | `180ms` | small reveals (icon draw-on, a single rule) |
| `--drafted-base` | `280ms` | the default (ink-in, settle) |
| `--drafted-slow` | `420ms` | a full sheet frame tracing on |
| `--drafted-stagger` | `40ms` | per-item delay in a sequence |

## Rules

- **One motion per element.** A finding row inks in; its icon draws on; its rule
  sweeps — three *different* elements, not three motions on one.
- **Stagger sequences**, don't fire them at once. Row *n* starts at
  `n × --drafted-stagger`. Cap the cascade (~10 rows) so a long list doesn't
  take seconds — later rows share the last delay.
- **No infinite motion** except a genuine status pulse (an active violation).
  Draw-on plays once on mount.
- **End state is the finished drawing.** Every animation resolves to fully
  visible/fully drawn. Interactivity is never gated on the animation.

## Reduced motion

`drafted.css` zeroes all of these under `prefers-reduced-motion: reduce`
(duration ~0, no transform, dash fully drawn). Keep new motion inside the
`.drafted-*` classes / `DrawOn` so it inherits the guard automatically. Verify by
toggling the OS "reduce motion" setting: the UI must be fully legible and static.
