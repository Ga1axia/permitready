# PermitReady — project steering

Persistent rules for any Kiro session working in this repo. The app lives in
`apps/review`; everything else is the upstream Pascal monorepo it consumes.

## Scope
- Work in `apps/review`. Treat `packages/*` as read-only engine (the review app
  imports `@pascal-app/{core,viewer,ifc-converter,nodes}` from them — removing
  them breaks the build).
- Never remove the Pascal workspace packages, `turbo.json`, `patches/`, or
  `tooling/typescript-config`; the app depends on them transitively.

## Verify before claiming done
- After any frontend change: `bunx tsc --noEmit -p tsconfig.json` and
  `bunx biome check <changed files>` from `apps/review`. Both must be clean
  (CSS files are excluded from Biome by repo config — that is not an error).
- After any code-check change: run `scripts/check_code.py` and confirm the three
  `public/checks/<building>.json` reports stay valid (`version 1`, selectable
  `target.globalId`, sane violation counts). Python deps go in a throwaway venv
  (`pip install ifcopenshell shapely numpy`); never pollute system Python.
- Clean up temporary files (venvs, scratch) before finishing.

## Conventions
- Design: follow `.agents/skills/permitready-pizazz` — ink-on-paper drafted
  sheet look, `@theme` tokens only (no raw hex that duplicates a token),
  title-block labels, one motion per element, honor `prefers-reduced-motion`.
- UI state lives in the `useReview` Zustand store; material emphasis
  (`lib/focus-fade.ts`, `lib/violation-highlight.ts`) stays off the React
  render path — synchronous, diffed, ref-counted.
- Code checks are tied to Boston's governing code: the Massachusetts State
  Building Code (780 CMR), Residential Volume 780 CMR 51.00 (10th Ed., adopting
  the 2021 IRC with MA amendments). Cite sections as `780 CMR 51 · <section>`.
  Rules degrade gracefully when a sample lacks the relevant elements.

## Git
- Do not commit unless asked. Stage specific files, not `git add .`.
- Flag any file that may hold secrets before committing.
