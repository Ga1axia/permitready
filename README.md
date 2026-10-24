# PermitReady

Side-by-side **2D drawings** and **3D building models** for permit review.

Open an IFC model next to its floor plans. Select a wall, door, or room in either pane — the other highlights the same element. Floors stay linked to their plan sheets.

![PermitReady](apps/review/public/brand/wordmark.jpeg)

## What it does

- **3D model** — load IFC in the browser (WebGPU), explore floor by floor, focus a selection while the rest of the building stays see-through
- **2D drawings** — open a linked drawing set (or any PDF) beside the model; resize the split
- **Linked selection** — IFC GlobalId hotspots keep plan and model in sync

Sample buildings ship with generated plans, schedules, and GlobalId links. Duplex opens with drawings beside the model by default.

## Run

```bash
bun install
bunx turbo run build --filter='review^...'

cd apps/review
bun run samples    # sample IFCs → public/models/
bun run dev        # http://localhost:3004
```

`?model=duplex`, `?model=office`, or `?model=clinic` opens a sample. Drop an `.ifc` on the page, or use **Open IFC**.

## Stack

The review app lives in `apps/review`. Rendering and IFC conversion use open-source [Pascal](https://github.com/pascalorg/editor) packages (`@pascal-app/viewer`, `@pascal-app/ifc-converter`) under MIT.

## License

MIT — see [LICENSE](LICENSE). Sample model credits: `apps/review/public/models/ATTRIBUTION.md`.
