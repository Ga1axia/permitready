# Code Review 3D

A 3D plan-review tool for building departments and design teams. It loads a
building model, checks it against code, and shows every failure on the
building itself: the measured value, the required value, the code section and
a suggested fix. The goal is a review a reviewer can see in 10 seconds and
trust in 60.

Today (Phase 1) it opens IFC models in 3D, shows them floor by floor, and lets
you inspect any element. The code checks, drawn on the model, come in the
following phases; see [ROADMAP.md](ROADMAP.md).

Built on [Pascal](https://github.com/pascalorg/editor) (MIT): its viewer does
the rendering (WebGPU, falling back to WebGL2) and its IFC converter turns
IFC files into a scene graph in the browser. This app lives in `apps/review`
of a Pascal checkout, so Pascal updates come in with a merge from upstream.

## Run it

```bash
# from the repository root
bun install
bunx turbo run build --filter='review^...'   # build the Pascal packages it uses

cd apps/review
bun run samples      # download the three sample models into public/models/
bun run references   # optional: their documents into public/reference/ (about 370 MB)
bun run dev          # http://localhost:3004
```

`?model=office`, `?model=duplex` or `?model=clinic` opens a sample directly.
Drop any `.ifc` file on the page, or use **Open IFC**, to open your own;
it is converted in the browser and never uploaded.

**Open PDF** places a drawing beside the model: on a sample building, its
generated drawing set (below), already linked; otherwise a PDF you pick.
Drag the divider to resize. Select an element, click **Link** on the PDF toolbar, and drag a box on the
sheet — after that, selecting the element in 3D (or the hotspot on the PDF)
highlights both. **Save links** / **Load links** store the map as JSON keyed
by IFC GlobalId.

The review viewer turns off SSGI, colour grading and shadows by default and
caps the frame rate so large models stay interactive on a normal laptop. On a
machine without a GPU (CI, a headless browser), add `&disable=postFx` to skip
the rest of Pascal's post-processing so the scene can render in software.

## Sample models

| Model | Type | License |
| --- | --- | --- |
| KIT office building | Commercial | Unrestricted use (credit IAI / KIT) |
| Duplex apartment | Residential | CC BY 4.0, buildingSMART International |
| Medical-dental clinic | Public facility | CC BY 4.0, buildingSMART International |

Sources and full credits: `public/models/ATTRIBUTION.md`. The IFC files are
not committed.

## Drawing set and reference documents

`public/reference/<building>/` holds everything that comes with each sample
building besides the 3D file the app opens; each building's `INDEX.md` lists
it all in detail. See [public/reference/README.md](public/reference/README.md).

- **Drawing set** in `drawings/`, generated from the 3D model by
  `bun run drawings` (`scripts/make_drawings.py`, using IfcOpenShell): a cover
  sheet, a floor plan per floor (cut walls, door swings, rooms with areas,
  door and window tags, overall dimensions, north arrow) and room, door and
  window schedules, as SVG and PDF plus one combined PDF. Committed.
- **Linked to the 3D model:** every room, door and window on the plans and
  every schedule row is mapped to its IFC GlobalId (`*.links.json`). **Open
  PDF** on a sample building opens its set beside the model; clicking either
  side selects the same element, and turning to a plan shows that floor.
- **Schedules** as CSV in `schedules/`, and a per-document list in `index/`.
- **Source documents** from `bun run references`: the other discipline models
  (electrical, mechanical, plumbing, structural), COBie spreadsheets,
  discipline images, the duplex's manufacturer product data and the clinic's
  O&M archive. Not committed.

## Rollout

Each phase switches on only after the one before passes its gate.
[ROADMAP.md](ROADMAP.md) has each phase in full: what you see, the steps,
the files it adds, pseudocode, and the gate.

| Phase | What you see | Gate | Status |
| --- | --- | --- | --- |
| 1. See the building | Spin, slice and click through all three models | A new user finds a 2nd-floor door unaided | **Built** |
| 2. See the problems | Red elements, dimension tags, exit paths (sample findings) | Top 5 clinic issues explained in under 2 min | Next |
| 3. Measure the building | Real widths, stairs, rooms and the escape network | Measurements match a manual check | |
| 4. Real checks replace the samples | Same visuals, driven by the rule engine | Hand check agrees, no unexplained flags | |
| 5. See the fix | Ghost fixes, recheck to green, export the letter | Clinic review to letter in under 30 min | |
| 6. Pilot on real models | Users' own projects, measured against today's process | A pilot user keeps it | |

## Code map

| Path | What it does |
| --- | --- |
| `components/ReviewApp.tsx` | Page shell: model switcher, file open and drop, loading and error states, panel layout |
| `components/ModelViewer.tsx` | Pascal `<Viewer>` plus camera framing and floor isolation |
| `components/SplitStage.tsx` | Resizable PDF ‖ 3D split |
| `components/PdfPane.tsx` | Drawing PDF viewer, hotspots, link drawing |
| `components/ViewControls.tsx` | Wall modes (Full, Cutaway, Plan, X-ray), explode, camera, units, fit; floor picker |
| `components/ModelTree.tsx` | Elements by floor and kind, search, selection sync with the 3D view |
| `components/Inspector.tsx` | Selected element's measurements, IFC data and property sets; model summary |
| `lib/load-model.ts` | Download and convert IFC, sharing one conversion per model |
| `lib/node-info.ts` | Names, measurements, units and property rows read from Pascal nodes |
| `lib/samples.ts` | The three sample models and their sources |
| `lib/review-store.ts` | App state the viewer reacts to: camera focus, isolated floor, units |
| `scripts/fetch-samples.mjs` | `bun run samples`: downloads the three sample models |
| `scripts/fetch-references.mjs` | `bun run references`: downloads the documents listed in `public/reference/sources.json` |
| `scripts/make_drawings.py`, `scripts/drawing_set/` | `bun run drawings`: the 2D drawing set, schedules and PDF links for each building |
| `scripts/index_references.py` | `bun run index-references`: each building's `INDEX.md` and document list |
| `lib/drawing-sets.ts`, `components/DrawingSetBar.tsx` | Open a building's drawing set in the PDF pane, pick sheets, keep the 3D floor in step |

The app uses Pascal only through its published package entry points
(`@pascal-app/core`, `viewer`, `nodes`, `ifc-converter`), so it never depends
on Pascal internals and needs no changes inside `packages/`.

## Known limits

- Pascal's IFC converter is early alpha. Some curtain-wall elements in the
  clinic land outside the building, and stairs come in as plain meshes.
- Material textures load from Pascal's CDN (`editor.pascal.app`); without
  network access, surfaces fall back to flat colors.
- The section control uses Pascal's wall modes. A free section plane you can
  drag through the building is not built yet.
