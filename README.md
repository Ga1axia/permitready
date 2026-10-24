# PermitReady

Side-by-side **2D drawings** and **3D building models** for permit review.

Open an IFC model next to its floor plans. Select a wall, door, or room in either pane — the other highlights the same element. Run code checks against the model and jump straight to each violation in both the 3D view and on the sheet.

![PermitReady](apps/review/public/brand/wordmark.jpeg)

## What it does

- **3D model** — load IFC in the browser (WebGPU), explore floor by floor, and focus a selection while the rest of the building goes see-through for clarity
- **2D drawings** — open a linked drawing set (or any PDF) beside the model and resize the split
- **Linked selection** — IFC GlobalId hotspots keep plan and model in sync; selecting in either pane highlights the same element in the other
- **Code checks** — run building-code rules against a sample model and step through each finding, with the offending element highlighted in 3D and marked on the floor plan

Sample buildings ship with generated plans, schedules, GlobalId links, and code-check reports. The duplex opens with drawings beside the model by default.

## Run

```bash
bun install

cd apps/review
bun run dev        # http://localhost:3004
```

Sample IFCs (`apps/review/public/models/`) and drawing sets (`apps/review/public/reference/*/drawings/`) are committed and open automatically — side by side on load. No download step.

Open `?model=duplex` (default), `?model=office`, or `?model=clinic` to load a sample with drawings beside the model. Drag an `.ifc` onto the page, or use **Open IFC**, to review your own file.

## Code checks

```bash
cd apps/review
bun run check      # runs the rules and writes public/checks/duplex.json + duplex.md
```

`bun run check` runs 30 checks tied to the codes enforced in Boston — the Massachusetts State Building Code (780 CMR), whose Residential Volume (780 CMR 51.00, 10th Edition) adopts the 2021 IRC with Massachusetts amendments — across all three sample buildings. They cover egress openings and doors, stairs (tread, riser, nosing, width, handrail, guards), safety glazing, unit separation, smoke and CO alarms, ventilation and natural light, ceiling height and minimum room size, fixture clearances, and electrical/plumbing items (GFCI, kitchen/bath receptacles, lighting outlets, water-heater relief). Each run writes a machine-readable `<building>.json` plus a readable `<building>.md`, and every finding names the element to select, a 3D point, and its position on the floor plan. Rules live in `scripts/code_check/rules.py`. The MEP and electrical rules need `bun run references` for their source models, plus `pip install ifcopenshell shapely`.

## Data refresh (optional)

Run these from `apps/review`:

- `bun run samples` — refresh the sample IFCs from upstream
- `bun run references` — pull extra source documents (~370 MB, not shipped)
- `bun run drawings` — regenerate floor plans from the IFC models

More detail on samples and drawings: `apps/review/public/reference/README.md`.

## Built with Kiro

PermitReady was developed with [Kiro](https://kiro.dev). The Kiro configuration is committed (it is **not** gitignored) so the setup is reproducible:

```
.kiro/
  agents/permitready.json     # project agent: scoped tools, trusted paths, resources
  steering/permitready.md     # persistent project rules loaded every session
  specs/code-check-engine/    # spec-driven dev: requirements.md → design.md → tasks.md
.agents/skills/
  permitready-pizazz/         # the drafted-sheet design-system skill (SKILL.md + references + examples)
  review-architecture/        # architectural PR review
  open-pr/                    # PR workflow
```

- **`.kiro/steering/permitready.md`** — persistent rules Kiro loads into context every session: work in `apps/review`, treat `packages/*` as read-only engine, verify with `tsc` + `biome`, regenerate the code-check reports, honor the design system. It encodes the hard-won invariants (e.g. the Pascal workspace packages are load-bearing) so they survive across sessions and contributors.
- **`.kiro/agents/permitready.json`** — a project agent with least-privilege tool trust: writes auto-approved under `apps/review/**`, `.kiro/**`, and `.agents/skills/**` but **denied** under `packages/**` and any `.env*`; read-only shell plus the project's own commands pre-trusted. It loads the steering files and the skills as resources.

### How Kiro was used

The strategy was to treat Kiro as a collaborator that *encodes and enforces* the project's own conventions, not just a one-off code generator:

- **Agent configuration & trust as guardrails.** Rather than running fully open, the project agent pins trust to the review app and blocks writes to the Pascal engine packages and secrets. When asked to "remove the Pascal structure," Kiro read the workspace graph first, discovered `apps/review` depends on `@pascal-app/*` transitively through `@pascal-app/nodes`, and stopped to confirm scope instead of deleting load-bearing code — the trust boundary made that caution concrete.
- **Spec-driven development.** The code-check engine was built through Kiro's spec workflow in `.kiro/specs/code-check-engine/` — `requirements.md` (EARS-style requirements) → `design.md` (the pipeline and key decisions) → `tasks.md` (checkbox tasks that trace back to requirements). The spec is committed and loaded as an agent resource, so the requirements stay the contract: the move from 10 to 30 rules and the Boston 780 CMR relabel were driven as tasks against the same requirements, and the "degrade gracefully" requirement is exactly what surfaced the water-heater false-positive during verification.
- **Skills as a reusable design system.** The drafted-sheet visual language ("permit-ready pizazz") is captured as a Kiro **skill** — `SKILL.md` plus `references/` (line-weights, colour-roles, motion-timings) and right/wrong `examples/` — then applied back onto the live app. The skill is grounded in the project's real `@theme` tokens and the Python drawing-sheet generator, so the UI matches the drawings it sits beside, and future work inherits the system by loading the skill.
- **Introspection to use Kiro correctly.** Kiro's own `introspect` capability was used to look up trust configuration and the `.kiro` layout from first-party docs before writing config, so the `.kiro/` files follow documented conventions (steering `inclusion`, agent `allowedTools`/`toolsSettings`) rather than guesswork.
- **Verification built into the loop.** Every change is checked before being called done — `tsc --noEmit` and `biome` for the frontend; regenerating all three `public/checks/*.json` code-check reports in a throwaway Python venv for the rules. That verification discipline is itself written into the steering file so it persists.
- **Research-backed correctness.** When the brief changed to "tie the checks to Boston building codes," Kiro verified the governing code (Massachusetts 780 CMR / IRC adoption) against primary sources before relabeling all 30 rules — and caught a false-positive bug (a rule matching hot-water *pipes* as water heaters) during the regenerate-and-verify step.

## Stack

Next.js app in `apps/review`, rendering with React Three Fiber on WebGPU. In-browser IFC conversion and the 3D viewer come from the open-source [Pascal](https://github.com/pascalorg/editor) libraries (`@pascal-app/viewer`, `@pascal-app/ifc-converter`, `@pascal-app/core`) under MIT. Floor-plan PDFs render with `pdfjs-dist`; code-check scripts are Python (`ifcopenshell`, `shapely`).

## License

MIT — see [LICENSE](LICENSE). Sample model credits: [`apps/review/public/models/ATTRIBUTION.md`](apps/review/public/models/ATTRIBUTION.md).

Roadmap: [`apps/review/ROADMAP.md`](apps/review/ROADMAP.md).
