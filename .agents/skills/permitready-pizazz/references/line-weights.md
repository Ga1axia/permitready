# Line weights

A drawing reads because its lines have a deliberate hierarchy. Mirror the sheet
(`scripts/drawing_set/sheet.py`: sheet frame 0.7, title rule 0.5, hairlines
0.25) in the UI with three steps — not a uniform `1px` everywhere.

| Step | Where it maps | CSS |
| --- | --- | --- |
| Hairline | internal dividers, section rules, title-block lines | `border-rule` (1px, cream-gray `--color-rule`) |
| Medium | a panel/card edge that must register against paper | `border-rule-strong` (`--color-rule-strong`) |
| Sheet frame | a region that is conceptually "a sheet" | `.drafted-frame` — an outer medium stroke + an inset hairline, 2–3px apart |

Rules of thumb:

- One sheet frame per region. Don't nest framed sheets inside framed sheets;
  the inner regions use hairline dividers instead.
- Dividers between rows are hairline (`border-rule`), full-strength borders are
  reserved for the region edge.
- Corners: `rounded-sm` or `rounded`. A sheet has crisp corners; avoid `rounded-xl`
  / `rounded-full` on newly drafted surfaces (leave existing pills alone unless
  restyling them).
- Accent borders (`border-accent`) mean "active/selected", never decoration.
