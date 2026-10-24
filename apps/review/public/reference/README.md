# Reference documents

Everything that comes with the sample buildings besides the 3D model the app
opens (those live in `../models/`): a generated 2D drawing set linked to the
model, schedules, the other discipline models, COBie spreadsheets, and the
manufacturer and O&M documents. One folder per building, each with a full
`INDEX.md`.

| Folder | What it holds | Made by | In git |
| --- | --- | --- | --- |
| `INDEX.md` | Detailed index of everything in the building's folder | `bun run index-references` | Yes |
| `drawings/` | 2D drawing set: cover, floor plans, room / door / window schedules, as SVG and PDF; the combined set PDF; links files and `index.json` for the app | `bun run drawings` | Yes |
| `schedules/` | Room, door and window schedules as CSV | `bun run drawings` | Yes |
| `index/` | One row per manufacturer or O&M document, joined to its COBie product type | `bun run index-references` | Yes |
| `models/` | The other discipline models (electrical, mechanical, plumbing, structural) | `bun run references` | No |
| `cobie/` | COBie spreadsheets, design and handover versions | `bun run references` | No |
| `images/` | One overview image per discipline model | `bun run references` | No |
| `product-data/` | Manufacturer product data, O&M manuals and warranties (duplex) | `bun run references` | No |
| `om/` | Operation and maintenance documents as one archive (clinic, 497 files) | `bun run references` | No |

`sources.json` lists every downloaded file with its source path and size.

## The drawing set

None of the sample buildings ship with drawings, so the set is generated from
each building's IFC model by `scripts/make_drawings.py`:

| Sheet | Contents |
| --- | --- |
| **G-001** Cover | Sheet index, storeys and elevations, rooms and net area per floor, door and window counts, source model, key plan |
| **A-101, A-102…** Floor plans | Walls and columns cut 1.2 m above the floor, door swings, rooms (number, name, area), door tags (mark in a box) and window tags (mark in a hexagon) matching the schedules, overall dimensions, north arrow, scale bar; level data in the title block |
| **A-601…** Room schedule | Number, name, level, area, perimeter, height, volume, category, occupancy zone |
| **A-611…** Door schedule | Mark, level, rooms on each side, type, type mark, width, height, leaf thickness, operation, external, fire rating |
| **A-621…** Window schedule | Mark, level, room, type, type mark, width, height, sill, head, external |

Long schedules continue on numbered pages (A-601.1, A-601.2). Roof and
foundation levels have no plan sheet, since a cut there shows only slab.

| Building | Paper and scale | Sheets | Linked regions |
| --- | --- | --- | --- |
| Duplex apartment | A2, plans at 1:50 | 6 | 109 |
| Medical-dental clinic | A0, plans at 1:100 | 8 | 1,153 |
| Office building | A1, plans at 1:100 | 10 | 730 |

All values come from the model's own properties (Revit exports for the
duplex and clinic, ArchiCAD for the office). The office model has no usable
door or window marks, so its tags are numbered D001… and W001… by floor and
position. Revit writes unfilled parameters as their own name
("Fire Rating" = "Fire Rating"); those show as blank. Room areas on the plans
are measured from the room outlines; the room schedule lists the areas
Revit stored, which can differ slightly.

### Side by side with the 3D model

Every sheet is linked to the model by IFC GlobalId:

- `<building>-drawing-set.links.json` holds one rectangle per room, door and
  window on each plan and one per schedule row, in the app's PDF-link format
  (`{ globalId, page, rect }`, page units 0 to 1 from the top left).
- `<sheet>.links.json` holds the same for one sheet's own PDF (page 1).
- `index.json` lists each sheet, its page in the set, and the storey each plan
  shows.

In the app, **Open PDF** on a sample building opens its set beside the model:

- Click a room, door or window on a plan, or a row in a schedule, to select it
  in 3D.
- Select something in 3D or in the element list and the sheet jumps to it and
  highlights it. When the element is on the page you are reading (its
  schedule row, say), the page stays put.
- Turning to a floor plan shows that floor in 3D.
- Zoom in on large sheets (the clinic is A0) to click door-sized regions.

## Regenerating

```bash
# from apps/review
bun run references                     # download the source documents (about 370 MB)
IFCCONVERT=/path/to/IfcConvert bun run drawings        # every building with a model
IFCCONVERT=/path/to/IfcConvert bun run drawings clinic # one building
bun run index-references               # rewrite INDEX.md and index/*.csv
```

`bun run drawings` needs IfcConvert 0.8
([IfcOpenShell releases](https://github.com/IfcOpenShell/IfcOpenShell/releases),
asset `ifcconvert-<version>-<platform>.zip`) and
`pip install ifcopenshell cairosvg pypdf`. `bun run index-references` also needs
`pip install openpyxl`.

## How these help the rollout

- **Phase 2 and 3:** the drawing set is the familiar 2D view reviewers work
  from today, already linked to the 3D model element by element.
- **Phase 3 gate:** the COBie spreadsheets are an independent list of every
  room and door to check extracted counts against. COBie Component rows carry
  the IFC GlobalId, so the join is exact (see the cross-check in each
  `INDEX.md`).
- **Phase 3, clear widths:** the door product data gives manufacturer
  dimensions to check computed clear widths against.
- **Layers:** the structural and MEP models can be shown as extra layers; they
  are not needed for the egress checks.

## Licenses

The buildingSMART repository publishes the sample files under CC BY 4.0.
Credit: BSI (2020) "Duplex Apartment Test Files" and "Medical-Dental Test
Files," buildingSMART International,
https://github.com/buildingsmart-community/Community-Sample-Test-Files. The
manufacturer documents in `product-data/` and `om/` are third-party product
literature; use them for internal checks, not in public demos. The generated
drawings and schedules are derived from the CC BY 4.0 models and carry the
same credit on every sheet.
