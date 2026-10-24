# PermitReady

The PermitReady review app — **drawings and 3D side by side**.

```bash
# from the repository root
bun install
bunx turbo run build --filter='review^...'

cd apps/review
bun run dev          # http://localhost:3004
```

Sample IFCs (`public/models/`) and drawing sets (`public/reference/*/drawings/`) are committed and open automatically — side by side on load. Optional: `bun run samples` refreshes IFCs from upstream; `bun run references` pulls extra source docs (~370 MB, not shipped); `bun run drawings` regenerates plans from IFC.

Open `?model=duplex` (default), `office`, or `clinic`. Drag the divider; select in 3D or on the sheet to highlight both.

**Code checks:** `bun run check` runs 30 checks tied to the codes enforced in Boston (the Massachusetts State Building Code, 780 CMR — its Residential Volume, 780 CMR 51.00, adopts the 2021 IRC with Massachusetts amendments) across all three samples, and writes `public/checks/<building>.json` and a readable `<building>.md`. Findings cover egress, stairs, glazing, unit separation, alarms, ventilation and daylight, room size and ceiling height, fixture clearances, and electrical/plumbing items — each with the element to select, a 3D point and its position on the floor plan. Rules live in `scripts/code_check/rules.py`; it needs `bun run references` for the MEP and electrical models and `pip install ifcopenshell shapely`.

More detail on samples and drawings: `public/reference/README.md`. Roadmap: [ROADMAP.md](ROADMAP.md).
