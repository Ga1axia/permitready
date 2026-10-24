#!/usr/bin/env python3
"""Write a detailed index of every reference document for each sample building.

Reads what is in public/reference/<building>/ (after `bun run references` and
`bun run drawings`) plus the architectural model in public/models/, and writes:

  public/reference/<building>/INDEX.md                  the full index
  public/reference/<building>/index/<building>-documents.csv
                                                        one row per manufacturer document

The index covers the generated drawing set and schedules, every discipline
model (schema, authoring tool, export date, storeys, element counts), each
COBie workbook (facility record, every sheet with its row count and purpose,
a cross-check against the model), every product or O&M document (grouped by
product type, with manufacturer, model number, warranty, expected life and
how many installed components use the type), and the overview images.

Requirements: pip install ifcopenshell openpyxl pypdf

Usage (from apps/review):
  python3 scripts/index_references.py            # every building with documents
  python3 scripts/index_references.py clinic
"""

from __future__ import annotations

import argparse
import collections
import csv
import datetime as dt
import json
import re
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
REF = APP_DIR / 'public' / 'reference'

BUILDINGS = {
    'office': ('Office Building', 'kit-office.ifc'),
    'duplex': ('Duplex Apartment', 'duplex.ifc'),
    'clinic': ('Medical-Dental Clinic', 'clinic.ifc'),
    'office': ('Office Building', 'kit-office.ifc'),
}

DISCIPLINE = [
    ('structural', 'Structural'),
    ('hvac', 'Mechanical (HVAC)'),
    ('plumbing', 'Plumbing'),
    ('electrical', 'Electrical'),
    ('mep', 'Mechanical, electrical and plumbing'),
    ('rooms_and_spaces', 'Mechanical: rooms and spaces'),
    ('architectural', 'Architectural'),
]

# What each COBie sheet holds (COBie 2.4 sheet definitions, in plain words).
COBIE_SHEETS = {
    'Instruction': 'How the workbook is organised; colour key for required and optional columns',
    'Contact': 'People and companies referenced elsewhere: designers, contractors, manufacturers',
    'Facility': 'The project, site and building, with the units every other sheet uses',
    'Floor': 'Storeys with elevation and height',
    'Space': 'Rooms: number, name, floor, category, areas',
    'Zone': 'Groupings of rooms: occupancy, fire alarm, lighting, ventilation and circulation zones',
    'Type': 'Product types: manufacturer, model number, warranty, expected life, nominal sizes',
    'Component': 'Every installed instance of a type, with the room it is in and its IFC GlobalId',
    'System': 'Building systems (HVAC, plumbing, electrical, fire) and the components in each',
    'Assembly': 'Assemblies of components or types',
    'Connection': 'Physical connections between components',
    'Spare': 'Spare parts per type and who supplies them',
    'Resource': 'Materials, tools and training needed for maintenance',
    'Job': 'Maintenance, inspection and safety tasks per type, with frequency and duration',
    'Impact': 'Environmental and cost impacts',
    'Document': 'Every handover document and the type, system or space it belongs to',
    'Attribute': 'Extra properties on any row of any other sheet',
    'Coordinate': 'Locations and bounding boxes of floors, spaces and components',
    'Issue': 'Known issues and risks',
    'PickLists': 'Allowed values for category and status columns',
}


def md_escape(s: object) -> str:
    return str(s if s is not None else '').replace('|', '\\|').replace('\n', ' ').strip()


def size_text(n: int) -> str:
    return f'{n / 1e6:.1f} MB' if n >= 1e6 else f'{max(1, round(n / 1e3))} KB'


def table(headers: list[str], rows: list[list[object]], align: list[str] | None = None) -> str:
    align = align or ['l'] * len(headers)
    sep = ['---:' if a == 'r' else '---' for a in align]
    out = ['| ' + ' | '.join(headers) + ' |', '| ' + ' | '.join(sep) + ' |']
    out += ['| ' + ' | '.join(md_escape(c) for c in r) + ' |' for r in rows]
    return '\n'.join(out)


# ---------------------------------------------------------------- IFC models


@dataclass
class ModelStats:
    path: Path
    discipline: str
    schema: str
    authoring: str
    exported: str
    storeys: list[tuple[str, float]]
    products: collections.Counter
    spaces: int


def discipline_of(name: str) -> str:
    low = name.lower()
    for key, label in DISCIPLINE:
        if key.replace('_', '') in low.replace('_', '').replace('-', ''):
            return label
    if re.search(r'(^|_)a(_|$)', low):
        return 'Architectural'
    return 'Other'


def model_stats(path: Path, discipline: str | None = None) -> ModelStats:
    import ifcopenshell

    m = ifcopenshell.open(str(path))
    h = m.header.file_name
    products = collections.Counter(
        p.is_a() for p in m.by_type('IfcProduct')
        if not p.is_a('IfcSpatialStructureElement') and not p.is_a('IfcOpeningElement') and not p.is_a('IfcAnnotation')
    )
    storeys = sorted(((s.Name or '', float(s.Elevation or 0)) for s in m.by_type('IfcBuildingStorey')), key=lambda s: s[1])
    return ModelStats(
        path=path,
        discipline=discipline or discipline_of(path.name),
        schema=m.schema,
        authoring=' '.join(s for s in (h.originating_system, h.preprocessor_version) if s),
        exported=(h.time_stamp or '')[:10],
        storeys=storeys,
        products=products,
        spaces=len(m.by_type('IfcSpace')),
    )


# ---------------------------------------------------------------- COBie


def cobie_sheets(path: Path) -> dict[str, list[dict]]:
    import openpyxl

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    out: dict[str, list[dict]] = {}
    for ws in wb.worksheets:
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            out[ws.title.strip()] = []
            continue
        header = [str(h).strip() if h is not None else f'col{i}' for i, h in enumerate(rows[0])]
        out[ws.title.strip()] = [
            dict(zip(header, r)) for r in rows[1:] if any(v not in (None, '') for v in r)
        ]
    return out


def clean(v: object) -> str:
    s = str(v).strip() if v is not None else ''
    return '' if s.lower() in ('n/a', 'none', '') else s


# ---------------------------------------------------------------- index


def build_index(building: str) -> None:
    title, arch_file = BUILDINGS[building]
    root = REF / building
    if not root.exists():
        print(f'[index] skipping {building}: no reference folder yet')
        return

    lines: list[str] = []
    w = lines.append
    sources = json.loads((REF / 'sources.json').read_text())['files']
    published = any(f.get('building') == building or str(f.get('path', '')).startswith(f'{building}/') for f in sources)
    today = dt.date.today().isoformat()

    drawings = sorted((root / 'drawings').glob('*.pdf')) if (root / 'drawings').exists() else []
    schedules = sorted((root / 'schedules').glob('*.csv')) if (root / 'schedules').exists() else []
    models = sorted((root / 'models').glob('*.ifc')) if (root / 'models').exists() else []
    cobies = sorted((root / 'cobie').glob('*.xlsx')) if (root / 'cobie').exists() else []
    images = sorted((root / 'images').glob('*')) if (root / 'images').exists() else []
    product_pdfs = sorted((root / 'product-data').glob('*')) if (root / 'product-data').exists() else []
    om_zips = sorted((root / 'om').glob('*.zip')) if (root / 'om').exists() else []

    w(f'# {title}: reference documents')
    w('')
    w(f'Index generated {today} by `scripts/index_references.py` from the files in this folder. '
      'Sizes and counts are read from the files themselves.')
    w('')
    overview = [
        ['Drawing set (generated)', f'{len([d for d in drawings if not d.name.endswith("drawing-set.pdf")])} sheets + combined PDF', '`drawings/`'],
        ['Schedules (generated)', f'{len(schedules)} CSV files', '`schedules/`'],
        ['Architectural model', '1 IFC file', f'`../../models/{arch_file}`'],
        ['Other discipline models', f'{len(models)} IFC files', '`models/`'],
        ['COBie workbooks', f'{len(cobies)} spreadsheets', '`cobie/`'],
        ['Overview images', f'{len(images)} images', '`images/`'],
    ]
    if product_pdfs:
        overview.append(['Manufacturer documents', f'{len(product_pdfs)} files', '`product-data/`'])
    om_names: list[str] = []
    for z in om_zips:
        om_names = [n for n in zipfile.ZipFile(z).namelist() if not n.endswith('/')]
        overview.append(['O&M documents', f'{len(om_names)} files in {z.name}', '`om/`'])
    overview = [row for row in overview if not row[1].startswith('0 ')]
    w(table(['What', 'Count', 'Where'], overview))
    w('')

    # 1. Drawing set
    w('## 1. Drawing set')
    w('')
    if drawings:
        w('Generated from the architectural model by `bun run drawings` (`scripts/make_drawings.py`). '
          'Every sheet exists as SVG and PDF; `' + f'{building}-drawing-set.pdf' + '` has them all in order.')
        w('')
        rows = []
        index_file = root / 'drawings' / 'index.json'
        titles = {}
        if index_file.exists():
            titles = {s['number']: s['title'] for s in json.loads(index_file.read_text())['sheets']}
        # Cover first, then plans and schedules in sheet-number order.
        for d in sorted(drawings, key=lambda p: (not re.search(r'-G-\d', p.name), p.name)):
            if d.name.endswith('drawing-set.pdf'):
                continue
            m = re.match(rf'{building}-([A-Z]-\d+(?:\.\d+)?)-(.*)\.pdf', d.name)
            number, rest = (m.group(1), m.group(2).replace('-', ' ')) if m else ('', d.stem)
            title = titles.get(number) or rest[:1].upper() + rest[1:]
            rows.append([number, title, f'`{d.stem}.svg` / `.pdf`'])
        w(table(['Sheet', 'Title', 'Files'], rows))
        w('')
        w('What the sheets contain:')
        w('')
        w('- **G-001 cover:** sheet index, storeys and elevations, room counts and net areas per floor, '
          'door and window counts, source model details, and a key plan.')
        w('- **A-1xx floor plans:** walls and columns cut 1.2 m above each floor, door swings, rooms with '
          'number, name and area, door tags (mark in a box) and window tags (mark in a hexagon) that match '
          'the schedules, overall dimensions, north arrow, scale bar, and level data in the title block.')
        w('- **A-60x room schedule:** number, name, level, area, perimeter, height, volume, category, occupancy zone.')
        w('- **A-61x door schedule:** mark, level, rooms on each side, type, type mark, width, height, leaf '
          'thickness, operation, external, fire rating.')
        w('- **A-62x window schedule:** mark, level, room, type, type mark, width, height, sill and head heights, external.')
        w('')
        w('Linked to the 3D model: `' + f'{building}-drawing-set.links.json' + '` (and a `.links.json` beside each '
          'sheet) maps every room, door and window on the plans, and every schedule row, to its IFC GlobalId and '
          'its rectangle on the page. `index.json` lists the sheets, their pages in the set and the storey each '
          'plan shows. The app reads both: open the PDF pane on a sample building and the set opens beside the '
          'model, with clicks on either side selecting the same element.')
    else:
        w('Not generated yet: run `bun run drawings ' + building + '`.')
    w('')

    # 2. Schedules
    w('## 2. Schedules (CSV)')
    w('')
    if schedules:
        rows = []
        for s in schedules:
            with open(s, encoding='utf-8') as fh:
                n = sum(1 for _ in fh) - 1
            rows.append([f'`{s.name}`', n, 'Same columns as the schedule sheet'])
        w(table(['File', 'Rows', 'Contents'], rows, ['l', 'r', 'l']))
    else:
        w('Not generated yet.')
    w('')

    # 3. Models
    w('## 3. 3D models')
    w('')
    arch_path = APP_DIR / 'public' / 'models' / arch_file
    stats: list[ModelStats] = []
    if arch_path.exists():
        print(f'[index] reading {arch_file}…')
        stats.append(model_stats(arch_path, 'Architectural (opened by the app)'))
    for m in models:
        print(f'[index] reading {m.name}…')
        stats.append(model_stats(m))
    if stats:
        rows = [
            [f'`{s.path.name}`', s.discipline, s.schema, size_text(s.path.stat().st_size), s.exported,
             sum(s.products.values()), s.spaces]
            for s in stats
        ]
        w(table(['File', 'Discipline', 'Schema', 'Size', 'Exported', 'Elements', 'Rooms (IfcSpace)'], rows,
                ['l', 'l', 'l', 'r', 'l', 'r', 'r']))
        w('')
        for s in stats:
            w(f'### {s.path.name}')
            w('')
            w(f'- Discipline: {s.discipline}')
            w(f'- Authoring tool: {s.authoring or "not recorded"}')
            w(f'- Storeys: ' + ', '.join(f'{n} ({e:+.2f} m)' for n, e in s.storeys))
            w('')
            w(table(['IFC class', 'Count'], [[k, v] for k, v in s.products.most_common(15)], ['l', 'r']))
            if len(s.products) > 15:
                w('')
                w(f'Plus {len(s.products) - 15} more classes with {sum(v for _, v in s.products.most_common()[15:])} elements.')
            w('')

    # 4. COBie
    w('## 4. COBie workbooks')
    w('')
    handover: dict[str, list[dict]] | None = None
    if not cobies:
        w('None downloaded: run `bun run references`.' if published else 'None published for this building.')
        w('')
    for c in cobies:
        print(f'[index] reading {c.name}…')
        sheets = cobie_sheets(c)
        stage = 'handover (as built)' if 'handover' in c.name.lower() else 'design'
        if 'handover' in c.name.lower():
            handover = sheets
        w(f'### {c.name}')
        w('')
        w(f'COBie spreadsheet, {stage} version, {size_text(c.stat().st_size)}.')
        w('')
        fac = (sheets.get('Facility') or [{}])[0]
        if fac:
            w(table(['Facility field', 'Value'], [
                ['Facility', clean(fac.get('Name'))],
                ['Category', clean(fac.get('Category'))],
                ['Project', clean(fac.get('ProjectName'))],
                ['Site', clean(fac.get('SiteName'))],
                ['Units', ', '.join(x for x in (clean(fac.get('LinearUnits')), clean(fac.get('AreaUnits')), clean(fac.get('VolumeUnits'))) if x)],
                ['Area measurement', clean(fac.get('AreaMeasurement'))],
                ['Authoring system', clean(fac.get('ExternalSystem'))],
                ['Phase', clean(fac.get('Phase'))],
            ]))
            w('')
        w(table(['Sheet', 'Rows', 'What it holds'],
                [[name, len(rows), COBIE_SHEETS.get(name, '')] for name, rows in sheets.items()], ['l', 'r', 'l']))
        w('')
        floors = sheets.get('Floor') or []
        if floors:
            w('Floors: ' + ', '.join(f'{clean(f.get("Name"))} ({f.get("Elevation")})' for f in floors) + '.')
            w('')

    if handover and stats:
        arch = stats[0]
        comp = handover.get('Component') or []
        comp_guids = {clean(r.get('ExtIdentifier')) for r in comp}
        w('### Cross-check: COBie handover against the architectural model')
        w('')
        rows = [
            ['Floors', len(handover.get('Floor') or []), len(arch.storeys)],
            ['Rooms', len(handover.get('Space') or []), arch.spaces],
            ['Doors (IfcDoor)', '', arch.products.get('IfcDoor', 0)],
            ['Windows (IfcWindow)', '', arch.products.get('IfcWindow', 0)],
            ['Components, all disciplines', len(comp), ''],
        ]
        try:
            import ifcopenshell

            m = ifcopenshell.open(str(arch.path))
            door_guids = {d.GlobalId for d in m.by_type('IfcDoor')}
            win_guids = {d.GlobalId for d in m.by_type('IfcWindow')}
            rows[2][1] = f'{len(door_guids & comp_guids)} matched by GlobalId'
            rows[3][1] = f'{len(win_guids & comp_guids)} matched by GlobalId'
        except Exception:
            pass
        w(table(['Item', 'In COBie', 'In model'], rows))
        w('')
        w('COBie Component rows carry the IFC GlobalId in `ExtIdentifier`, so every door and window in the '
          'schedules can be joined to its COBie type, warranty and documents.')
        w('')

    # 5. Documents
    w('## 5. Manufacturer and O&M documents')
    w('')
    doc_rows = (handover or {}).get('Document') or []
    types = {clean(t.get('Name')): t for t in (handover or {}).get('Type') or []}
    comp_by_type = collections.Counter(clean(c.get('TypeName')) for c in (handover or {}).get('Component') or [])
    present = {p.name for p in product_pdfs} | {Path(n).name for n in om_names}
    if not doc_rows and not product_pdfs and not om_names:
        w('None for this building.')
        w('')
    if om_names:
        by_kind = collections.Counter(Path(n).suffix.lower() for n in om_names)
        w(f'The O&M archive holds {len(om_names)} files ('
          + ', '.join(f'{v} {k[1:].upper()}' for k, v in by_kind.most_common()) + ').')
        w('')
    if doc_rows:
        groups: dict[tuple[str, str], list[dict]] = collections.defaultdict(list)
        for d in doc_rows:
            groups[(clean(d.get('SheetName')) or 'Other', clean(d.get('RowName')) or 'Unassigned')].append(d)
        w(f'{len(doc_rows)} documents are listed in the COBie handover, attached to '
          f'{len({k for k in groups if k[0] == "Type"})} product types and '
          f'{len({k for k in groups if k[0] != "Type"})} systems or other items. '
          f'{sum(1 for d in doc_rows if clean(d.get("File")) and Path(clean(d.get("File"))).name in present)} '
          'of the listed files are present in this folder. The full list, one row per document, is in '
          f'`index/{building}-documents.csv`.')
        w('')
        for sheet_name in sorted({k[0] for k in groups}, key=lambda s: (s != 'Type', s)):
            heading = 'Product types' if sheet_name == 'Type' else f'{sheet_name.strip()} documents'
            w(f'### {heading}')
            w('')
            rows = []
            for (sn, row_name), docs in sorted(groups.items()):
                if sn != sheet_name:
                    continue
                t = types.get(row_name, {})
                warranty = clean(t.get('WarrantyDurationParts'))
                unit = clean(t.get('WarrantyDurationUnit'))
                files = sorted({clean(d.get('File')) for d in docs if clean(d.get('File'))})
                have = sum(1 for f in files if Path(f).name in present)
                rows.append([
                    row_name,
                    clean(t.get('Category')).split(':', 1)[-1].strip() if t else '',
                    clean(t.get('Manufacturer')),
                    clean(t.get('ModelNumber')),
                    f'{warranty} {unit}'.strip() if warranty else '',
                    comp_by_type.get(row_name, '') if sheet_name == 'Type' else '',
                    ', '.join(sorted({clean(d.get('Category')) for d in docs if clean(d.get('Category'))})),
                    f'{have}/{len(files)}',
                ])
            w(table(['Item', 'Category', 'Manufacturer', 'Model', 'Warranty (parts)', 'Installed', 'Document kinds', 'Files here'],
                    rows, ['l', 'l', 'l', 'l', 'l', 'r', 'l', 'r']))
            w('')

        out_csv = root / 'index' / f'{building}-documents.csv'
        out_csv.parent.mkdir(parents=True, exist_ok=True)
        with open(out_csv, 'w', newline='', encoding='utf-8') as fh:
            cw = csv.writer(fh)
            cw.writerow(['Document', 'Category', 'Stage', 'Approval', 'Attached to', 'Item', 'Manufacturer', 'Model', 'File', 'Present here', 'Location'])
            for d in doc_rows:
                f = clean(d.get('File'))
                name = Path(f).name if f else ''
                where = ''
                if name in {p.name for p in product_pdfs}:
                    where = f'product-data/{name}'
                elif name in {Path(n).name for n in om_names}:
                    where = f'om/{om_zips[0].name}: {next(n for n in om_names if Path(n).name == name)}'
                t = types.get(clean(d.get('RowName')), {})
                cw.writerow([clean(d.get('Name')), clean(d.get('Category')), clean(d.get('Stage')), clean(d.get('ApprovalBy')),
                             clean(d.get('SheetName')), clean(d.get('RowName')), clean(t.get('Manufacturer')),
                             clean(t.get('ModelNumber')), f, 'yes' if where else 'no', where])
    elif product_pdfs:
        w(table(['File', 'Size'], [[f'`{p.name}`', size_text(p.stat().st_size)] for p in product_pdfs], ['l', 'r']))
        w('')

    # 6. Images
    if images:
        w('## 6. Overview images')
        w('')
        w(table(['File', 'Shows', 'Size'], [[f'`{i.name}`', discipline_of(i.stem.replace('Arc', '_a_').replace('Ele', 'electrical').replace('Mec', 'mep').replace('Plu', 'plumbing')), size_text(i.stat().st_size)] for i in images], ['l', 'l', 'r']))
        w('')

    w('## Licenses')
    w('')
    if published:
        w('The buildingSMART sample files are published under CC BY 4.0. Manufacturer product data, O&M '
          'manuals and warranties are third-party literature: use them for internal checks, not in public demos. '
          'Generated drawings and schedules carry the model credit on every sheet. See `../README.md`.')
    else:
        w('The model is published for unrestricted use with credit to its authors (see '
          '`../../models/ATTRIBUTION.md`). Generated drawings and schedules carry that credit on every sheet.')
    w('')

    (root / 'INDEX.md').write_text('\n'.join(lines), encoding='utf-8')
    print(f'[index] {(root / "INDEX.md").relative_to(APP_DIR)}')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('buildings', nargs='*', help=f'buildings: {", ".join(BUILDINGS)} (default: all with a reference folder)')
    args = parser.parse_args()
    unknown = [b for b in args.buildings if b not in BUILDINGS]
    if unknown:
        parser.error(f'unknown building {", ".join(unknown)}')
    for b in args.buildings or list(BUILDINGS):
        build_index(b)


if __name__ == '__main__':
    sys.exit(main())
