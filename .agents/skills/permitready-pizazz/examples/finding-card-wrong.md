# Example — the same card done wrong

```tsx
function FindingCard({ finding }: { finding: Finding }) {
  return (
    <div
      className="animate-bounce rounded-2xl p-3 shadow-lg"
      style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
    >
      <p className="text-sm font-bold text-gray-800">{finding.section}</p>
      <p className="animate-pulse text-sm">{finding.message}</p>
      <p className="text-sm">Got {finding.measured} / Need {finding.required}</p>
    </div>
  )
}
```

What's wrong, line by line:

- `background: #ffffff` — pure white, not paper. Use `bg-panel`.
- `border: 1px solid #e5e7eb` — raw hex duplicating a token, and a flat uniform
  weight. Use the `DraftedFrame` / line-weight scale.
- `rounded-2xl` + `shadow-lg` — pill corners and a soft drop shadow read as a
  generic SaaS card, not a drawing sheet. Use `rounded-sm` and the hairline frame.
- `animate-bounce` + `animate-pulse` — bouncy, playful, and **two** motions on
  overlapping nodes; also neither honours reduced-motion the drafted way, and
  the pulse animates the message text itself (content flicker). Use a single
  `drafted-ink-in` on the card.
- `text-gray-800` / bold section header — not the uppercase, tracked, faint
  title-block label. No mono/tabular treatment on the measured values, so they
  don't read as a schedule.

Net: it works, but it looks like any dashboard. None of the PermitReady drawing
language survives.
