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

`bun run check` runs ten 2021 IRC checks on the duplex (egress windows, stairs, safety glazing, unit separation, smoke and CO alarms, ventilation, fixture spacing) and writes a machine-readable `duplex.json` plus a readable `duplex.md`: 44 violations, each with the element to select, a 3D point, and its position on the floor plan. Rules live in `scripts/code_check/rules.py`. The MEP and electrical rules need `bun run references` for their source models, plus `pip install ifcopenshell shapely`.

## Data refresh (optional)

Run these from `apps/review`:

- `bun run samples` — refresh the sample IFCs from upstream
- `bun run references` — pull extra source documents (~370 MB, not shipped)
- `bun run drawings` — regenerate floor plans from the IFC models

More detail on samples and drawings: `apps/review/public/reference/README.md`.

## Stack

Next.js app in `apps/review`, rendering with React Three Fiber on WebGPU. In-browser IFC conversion and the 3D viewer come from the open-source [Pascal](https://github.com/pascalorg/editor) libraries (`@pascal-app/viewer`, `@pascal-app/ifc-converter`, `@pascal-app/core`) under MIT. Floor-plan PDFs render with `pdfjs-dist`; code-check scripts are Python (`ifcopenshell`, `shapely`).

## License

MIT — see [LICENSE](LICENSE). Sample model credits: [`apps/review/public/models/ATTRIBUTION.md`](apps/review/public/models/ATTRIBUTION.md).

Roadmap: [`apps/review/ROADMAP.md`](apps/review/ROADMAP.md).
