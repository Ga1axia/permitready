# Colour roles

All colours are `@theme` tokens in `app/globals.css`. Use the token
(`text-ink`, `bg-paper`, `border-accent`…), never a raw hex that duplicates one.

## Paper and ink (the sheet)

| Token | Role |
| --- | --- |
| `--color-paper` / `bg-paper` | the sheet — default page background |
| `--color-paper-deep` | a recessed trough (segmented control track, inset) |
| `--color-panel` | a raised paper surface (panels, cards) sitting on the page |
| `--color-stage` | the 3D viewport background only |
| `--color-ink` | primary text / darkest line |
| `--color-ink-soft` | secondary text |
| `--color-ink-faint` | title-block labels, captions, quiet meta |
| `--color-rule` / `--color-rule-strong` | the two hairline/medium line weights |

## Interaction

| Token | Role |
| --- | --- |
| `--color-accent` (`#1f5fff`) | selected/active state, links, focus ring, PDF link ink |
| `--color-accent-soft` | the soft wash behind an active segment |

## Code-check semantics (findings only)

| Token | Role |
| --- | --- |
| `--color-fail` | a violation |
| `--color-review` | needs review / caution |
| `--color-pass` | compliant |

Keep the two systems apart: **accent = interaction**, **fail/review/pass =
findings**. A selected finding may show both (accent selection + fail dot), but
never recolour a UI control with a semantic finding colour, or mark a finding
with accent.
