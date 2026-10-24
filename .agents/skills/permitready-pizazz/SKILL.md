---
name: permitready-pizazz
description: Apply PermitReady's hand-drafted architectural-sheet look and draw-on motion to frontend code in apps/review. Use when building or restyling any React/CSS UI in the review app — panels, toolbars, headers, cards, results lists, overlays — so it reads like ink drawn onto a permit drawing sheet. Not "patent ready" — PermitReady.
metadata:
  internal: true
allowed-tools: Read Grep Glob Edit
---

# PermitReady pizazz — the drafted-sheet design language

Make `apps/review` feel like a permit drawing: ink on cream paper, hairline sheet
frames, title-block typography, and motion that **draws itself on** the way a
plotter inks a sheet. This is PermitReady's signature "pizazz" — restrained,
architectural, never decorative noise. The name is **PermitReady**, not "patent".

## Where the style comes from (do not reinvent it)

The look is already latent in two places. Read them before styling anything so
the UI matches the drawings it sits beside:

- `apps/review/app/globals.css` — the `@theme` tokens (cream paper, ink, electric
  blue accent, fail/review/pass), `Space Grotesk` / `IBM Plex Mono`, the fractal
  grain overlay, and the `prefers-reduced-motion` guard. **Use these tokens. Never
  hardcode a hex that duplicates one.**
- `apps/review/scripts/drawing_set/sheet.py` — the real drafting furniture the
  generated plan sheets use: a thin double **sheet border**, a ruled **title
  block** with uppercase small-cap labels, **hairline rules** (stroke 0.25–0.7),
  a **scale bar**, and a **north arrow**. The UI should echo these motifs.

The animation layer and reference primitives live in the app at:

- `apps/review/app/drafted.css` — keyframes + utility classes (the motion vocabulary)
- `apps/review/components/drafted/DraftedFrame.tsx` — sheet-border wrapper
- `apps/review/components/drafted/DrawOn.tsx` — SVG stroke draw-on primitive

## The design system

### Surfaces read as paper
Backgrounds are `bg-paper` / `bg-panel` (cream), never pure white. Grain comes
from the existing `body::before` overlay — do not add a second global grain.

### Lines have weight, like a drawing
Borders are a deliberate three-step line-weight scale, not a uniform `1px`:

| Weight | Token / class | Use for |
| --- | --- | --- |
| Hairline | `border-rule` | internal dividers, title-block rules, quiet separators |
| Medium | `border-rule-strong` | a card or panel edge that should register |
| Sheet | `.drafted-frame` (2 nested strokes) | a region that is "a sheet": panels, result cards, overlays |

Prefer **square or barely-rounded** corners (`rounded-sm`, `rounded`), not pill
shapes — a drawing sheet has crisp corners. Existing pills/large radii may stay;
do not churn them unless restyling that component.

### Typography is a title block
- Section labels: uppercase, letter-spaced, small, `text-ink-faint` —
  `text-[10px] uppercase tracking-[0.08em] text-ink-faint`. This is the single
  most recognizable PermitReady cue; use it for every panel/section heading.
- Numbers and measured values: `font-mono tabular-nums` (it's a schedule).
- Body copy stays `font-sans` (Space Grotesk).

### Colour roles (reuse, don't invent)
`accent` = active/selected and link ink. `fail`/`review`/`pass` = code-check
semantics only. `ink` / `ink-soft` / `ink-faint` = the three ink darknesses.
Keep accent for interaction and the semantic triad for findings — don't bleed
them together.

## The motion vocabulary — "it draws itself on"

Five named motions, all in `drafted.css`. Use these; don't write ad-hoc
transitions that fight them.

| Motion | Class | What it does | When |
| --- | --- | --- | --- |
| Draw-on | `DrawOn` component | strokes an SVG path via `stroke-dashoffset` | icons, rules, the brand check, dividers |
| Ink-in | `.drafted-ink-in` | fade + 2px settle, like ink meeting paper | content appearing (findings, panels) |
| Sheet-settle | `.drafted-settle` | slight scale/translate as a "sheet" lands | cards, overlays, dialogs mounting |
| Rule-sweep | `.drafted-rule-sweep` | a hairline rule wipes left→right | section reveals, title-block dividers |
| Trace-border | `.drafted-trace` | the sheet frame draws corner-to-corner | a region becoming active/selected |

**Timing:** motions are quick and mechanical, not bouncy — 180–420ms,
`cubic-bezier(0.2, 0.7, 0.2, 1)` (defined as `--drafted-ease`). Stagger lists by
~40ms per row (`--drafted-stagger`) so findings ink on in sequence like a plotter.

## Accessibility — non-negotiable

- Every motion **must** collapse under `prefers-reduced-motion: reduce`.
  `drafted.css` already zeroes its own keyframes under that query; keep new
  motion inside these classes so it inherits the guard. Never animate a property
  that hides content such that a reduced-motion user can't see it — end states
  are always the fully-drawn, fully-visible state.
- Draw-on is **decorative**: SVGs that only animate get `aria-hidden`. Meaning
  must survive with motion off.
- Contrast: ink-on-paper already passes; if you tint, keep text at `ink` or
  `ink-soft` on paper surfaces.
- Don't trap focus or delay interactivity behind an animation — elements are
  clickable immediately; the draw-on is purely visual.

## How to apply it (the workflow)

1. **Read the tokens and the two source files above.** Match, don't invent.
2. **Wrap "sheet-like" regions** — panels, result cards, overlays — in
   `DraftedFrame` (or `.drafted-frame`) for the double hairline border.
3. **Give every section a title-block label** (uppercase, tracked, faint).
4. **Add one motion per element, not five.** A finding row inks in; its rule
   sweeps; its icon draws on. Resist stacking.
5. **Stagger sequences** with `--drafted-stagger` so lists plot on in order.
6. **Verify reduced-motion** by toggling the OS setting (or temporarily forcing
   the media query) — the UI must be fully legible and static.

See `references/line-weights.md`, `references/colour-roles.md`,
`references/motion-timings.md`, and the `examples/` for right-vs-wrong usage.

## Optional assets (graceful without them)

The style is complete with generated SVG/CSS. If richer assets exist, drop them
in and they upgrade the look without code changes:

- `apps/review/public/brand/vellum.png` — a seamless paper/vellum tile. If
  present, a surface can set it as a low-opacity background; absent, the fractal
  grain carries the texture.
- `apps/review/public/brand/*.svg` line-art motifs (compass rose, scale ruler)
  with **open `<path>` strokes** (not outlined) so `DrawOn` can ink them.

Never block a feature on a missing asset — fall back to the SVG/CSS path.
