# Example — a drafted finding card (right)

A code-check finding rendered as a small sheet: framed region, title-block
label, mono measured values, one motion per element, staggered on mount.

```tsx
import { DraftedFrame } from '@/components/drafted/DraftedFrame'

function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  return (
    <DraftedFrame
      className="drafted-ink-in bg-panel p-3"
      // sequence: each card inks on 40ms after the previous
      style={{ animationDelay: `calc(${index} * var(--drafted-stagger))` }}
    >
      {/* title-block label — the signature cue */}
      <p className="text-[10px] uppercase tracking-[0.08em] text-ink-faint">
        {finding.section}
      </p>

      {/* a hairline rule sweeps in under the label */}
      <span className="drafted-rule-sweep mt-1 mb-2 block h-px bg-rule" aria-hidden />

      <p className="text-sm text-ink">{finding.message}</p>

      {/* measured values read as a schedule: mono, tabular */}
      <dl className="mt-2 flex gap-4 font-mono text-[11px] tabular-nums text-ink-soft">
        <div><dt className="text-ink-faint">Got</dt><dd>{finding.measured}</dd></div>
        <div><dt className="text-ink-faint">Need</dt><dd>{finding.required}</dd></div>
      </dl>
    </DraftedFrame>
  )
}
```

Why this is right:

- **Tokens only** — `bg-panel`, `text-ink*`, `bg-rule`. No raw hex.
- **One motion per element** — the card inks in, the rule sweeps; the icon (if
  any) would draw on. Not stacked on one node.
- **Staggered** via `--drafted-stagger`, so a list plots on in order.
- **Title-block label + mono schedule values** — the PermitReady reading.
- **Reduced-motion safe** — all motion is inside `.drafted-*` classes, which
  `drafted.css` neutralises; the end state is the full, legible card.
