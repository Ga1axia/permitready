#!/usr/bin/env python3
"""Generate a 2D drawing set for each sample building from its IFC model.

None of the sample models ship with drawings, so the set is produced from the
model itself:

  G-001          Cover sheet: sheet index, building data, source model
  A-101, A-102…  Floor plans, one per floor: walls cut 1.2 m above the floor,
                 door swings, rooms (number, name, area), door and window
                 tags, overall dimensions, north arrow, level data
  A-601…         Room schedule
  A-611…         Door schedule (with the rooms on each side of every door)
  A-621…         Window schedule

Long schedules continue on numbered pages (A-601.1, A-601.2…).

Output, in public/reference/<building>/:
  drawings/<building>-<sheet>-<title>.svg / .pdf   every sheet
  drawings/<building>-drawing-set.pdf               the whole set in order
  drawings/<building>-drawing-set.links.json        hotspots for the app's PDF pane
  drawings/<sheet>.links.json                       hotspots for one sheet's PDF
  drawings/index.json                               sheets, pages and storeys, read by the app
  schedules/<building>-rooms.csv, -doors.csv, -windows.csv

Requirements:
  - IfcConvert 0.8.x from https://github.com/IfcOpenShell/IfcOpenShell/releases
    (asset ifcconvert-<version>-<platform>.zip); set IFCCONVERT or put it on PATH
  - pip install ifcopenshell cairosvg pypdf

Usage (from apps/review):
  python3 scripts/make_drawings.py            # every building whose model is present
  python3 scripts/make_drawings.py clinic     # one building
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

from drawing_set import model_data
from drawing_set.plans import plan_sheets
from drawing_set.schedules import cover_sheet, schedule_sheets, tables, write_csv
from drawing_set.sheet import PAPER, Project, render, slug

APP_DIR = Path(__file__).resolve().parent.parent

PROJECTS = {
    p.id: p
    for p in [
        Project(
            'office', 'Office Building', 'Commercial', 'A1', 100,
            'Institute for Automation and Applied Informatics (IAI) / Karlsruhe Institute of Technology (KIT)',
            'Unrestricted use', 'kit-office.ifc',
        ),
        Project(
            'duplex', 'Duplex Apartment', 'Residential', 'A2', 50,
            'BSI (2020) "Duplex Apartment Test Files," buildingSMART International',
            'CC BY 4.0', 'duplex.ifc',
        ),
        Project(
            'clinic', 'Medical-Dental Clinic', 'Public facility', 'A0', 100,
            'BSI (2020) "Medical-Dental Test Files," buildingSMART International',
            'CC BY 4.0', 'clinic.ifc',
        ),
    ]
}


def find_ifcconvert() -> str:
    exe = os.environ.get('IFCCONVERT') or shutil.which('IfcConvert')
    if not exe:
        sys.exit('IfcConvert not found. Download it from the IfcOpenShell releases page and set IFCCONVERT=/path/to/IfcConvert.')
    return exe


def build(project: Project, exe: str) -> None:
    ifc = APP_DIR / 'public' / 'models' / project.source_file
    if not ifc.exists():
        print(f'[drawings] skipping {project.id}: public/models/{project.source_file} not found (run `bun run samples`)')
        return

    import cairosvg
    from pypdf import PdfWriter

    print(f'[drawings] reading {project.source_file}…')
    data = model_data.load(ifc)

    plans = plan_sheets(project, data, exe, ifc, first_number=101)
    schedule_tables = tables(data)
    schedules = []
    for table, first in zip(schedule_tables, ('A-601', 'A-611', 'A-621')):
        schedules.extend(schedule_sheets(project, table, first))
    # The cover lists every sheet, itself included.
    placeholder = cover_sheet(project, data, [])
    sheets = [placeholder, *plans, *schedules]
    elevation = {s.name: s.elevation for s in data.storeys}
    ground = min(plans, key=lambda p: abs(elevation.get(p.storey, 0.0)), default=None)
    sheets[0] = cover_sheet(project, data, sheets, key_plan=ground)

    out = APP_DIR / 'public' / 'reference' / project.id
    drawings_dir = out / 'drawings'
    if drawings_dir.exists():
        shutil.rmtree(drawings_dir)
    drawings_dir.mkdir(parents=True)

    W, H = PAPER[project.paper]

    def link_json(sheet, page: int, prefix: str) -> list[dict]:
        # The app's PDF pane format: normalized page units, origin top-left.
        return [
            {
                'id': f'{prefix}-{i + 1}',
                'globalId': guid,
                'page': page,
                'rect': {'x': round(x / W, 5), 'y': round(y / H, 5), 'w': round(w / W, 5), 'h': round(h / H, 5)},
                'label': label,
            }
            for i, (guid, x, y, w, h, label) in enumerate(sheet.links)
        ]

    writer = PdfWriter()
    set_links: list[dict] = []
    index_sheets: list[dict] = []
    for page, sheet in enumerate(sheets, start=1):
        svg = render(project, sheet, len(sheets))
        # Not Path.with_suffix: sheet numbers such as A-601.1 contain a dot.
        base = f'{project.id}-{sheet.number}-{slug(sheet.title)}'
        (drawings_dir / f'{base}.svg').write_text(svg, encoding='utf-8')
        pdf = drawings_dir / f'{base}.pdf'
        cairosvg.svg2pdf(bytestring=svg.encode('utf-8'), write_to=str(pdf))
        writer.append(str(pdf))
        prefix = slug(sheet.number)
        if sheet.links:
            (drawings_dir / f'{base}.links.json').write_text(
                json.dumps({'version': 1, 'links': link_json(sheet, 1, prefix)}, indent=1) + '\n', encoding='utf-8'
            )
        set_links.extend(link_json(sheet, page, prefix))
        index_sheets.append({
            'number': sheet.number,
            'title': sheet.title,
            'kind': sheet.kind,
            'storey': sheet.storey,
            'page': page,
            'pdf': f'{base}.pdf',
            'svg': f'{base}.svg',
            'links': f'{base}.links.json' if sheet.links else None,
            'hotspots': len(sheet.links),
        })
        print(f'[drawings] {sheet.number:<8} {sheet.title} ({len(sheet.links)} hotspots)')
    set_pdf = drawings_dir / f'{project.id}-drawing-set.pdf'
    with open(set_pdf, 'wb') as fh:
        writer.write(fh)
    set_links_name = f'{project.id}-drawing-set.links.json'
    (drawings_dir / set_links_name).write_text(json.dumps({'version': 1, 'links': set_links}, indent=1) + '\n', encoding='utf-8')
    (drawings_dir / 'index.json').write_text(
        json.dumps(
            {
                'version': 1,
                'building': project.id,
                'title': project.title,
                'paper': project.paper,
                'scale': f'1:{project.scale}',
                'set': {'pdf': set_pdf.name, 'links': set_links_name, 'pages': len(sheets)},
                'sheets': index_sheets,
            },
            indent=1,
        )
        + '\n',
        encoding='utf-8',
    )

    for table in schedule_tables:
        write_csv(table, out / 'schedules' / f'{project.id}-{table.key}.csv')
    print(f'[drawings] {set_pdf.relative_to(APP_DIR)} ({len(sheets)} sheets) and schedules/*.csv')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('buildings', nargs='*', help=f'buildings to draw: {", ".join(PROJECTS)} (default: all present)')
    args = parser.parse_args()
    unknown = [b for b in args.buildings if b not in PROJECTS]
    if unknown:
        parser.error(f'unknown building {", ".join(unknown)}; choose from {", ".join(PROJECTS)}')
    exe = find_ifcconvert()
    for building in args.buildings or list(PROJECTS):
        build(PROJECTS[building], exe)


if __name__ == '__main__':
    main()
