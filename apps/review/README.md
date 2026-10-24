# PermitReady

The PermitReady review app — **drawings and 3D side by side**.

```bash
# from the repository root
bun install
bunx turbo run build --filter='review^...'

cd apps/review
bun run samples      # IFCs → public/models/
bun run references   # optional source docs (~370 MB)
bun run drawings     # regenerate drawing sets from IFC
bun run dev          # http://localhost:3004
```

Open `?model=duplex` for the linked duplex set. **Open PDF** loads a building’s drawing set when one exists, or any PDF you pick. Drag the divider; select in 3D or on the sheet to highlight both.

More detail on samples and drawings: `public/reference/README.md`. Roadmap: [ROADMAP.md](ROADMAP.md).
