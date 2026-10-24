"""Room, door and window schedules: table sheets in the drawing set plus CSV."""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

from .model_data import BuildingData
from .plans import is_floor
from .sheet import INK, QUIET, Project, Sheet, drawing_area, fmt_m, fmt_mm, text


@dataclass
class Column:
    title: str
    width: float  # relative weight
    align: str = 'start'  # 'start' | 'end'


@dataclass
class Table:
    key: str  # 'rooms' | 'doors' | 'windows'
    title: str
    columns: list[Column]
    rows: list[list[str]]
    guids: list[str]  # IFC GlobalId of each row, for PDF hotspots
    notes: list[str]
    summary: list[tuple[str, str]]


def floor_area(data: BuildingData) -> float:
    """Net room area on occupied floors; roof and foundation 'rooms' are left out."""
    return sum(r.area or 0 for r in data.rooms if is_floor(r.level))


def _yes_no(v: bool | None) -> str:
    return '' if v is None else ('Yes' if v else 'No')


def tables(data: BuildingData) -> list[Table]:
    room_name = {r.number: r.name for r in data.rooms}

    def room_label(number: str) -> str:
        name = room_name.get(number)
        return f'{number} {name}' if name else number

    rooms = Table(
        'rooms',
        'Room schedule',
        [
            Column('Number', 0.8), Column('Name', 2.2), Column('Level', 1.1), Column('Area (m²)', 0.8, 'end'),
            Column('Perimeter (m)', 0.9, 'end'), Column('Height (m)', 0.8, 'end'), Column('Volume (m³)', 0.9, 'end'),
            Column('Category', 1.9), Column('Occupancy zone', 1.5),
        ],
        [
            [r.number, r.name, r.level, fmt_m(r.area), fmt_m(r.perimeter), fmt_m(r.height), fmt_m(r.volume, 1),
             r.category, r.occupancy_zone]
            for r in data.rooms
        ],
        [r.guid for r in data.rooms],
        ['Areas, perimeters and volumes as computed by the authoring tool and stored in the model.'],
        [
            ('Rooms', str(len(data.rooms))),
            ('Net area, floors', f'{floor_area(data):,.1f} m²'),
            *[(f'Area on {s.name}', f'{sum(r.area or 0 for r in data.rooms_on(s.name)):,.1f} m²') for s in data.storeys if data.rooms_on(s.name)],
        ],
    )

    doors = Table(
        'doors',
        'Door schedule',
        [
            Column('Mark', 0.7), Column('Level', 1.0), Column('From / to', 2.6), Column('Type', 1.6), Column('Type mark', 0.6),
            Column('Width (mm)', 0.7, 'end'), Column('Height (mm)', 0.7, 'end'), Column('Leaf (mm)', 0.6, 'end'),
            Column('Operation', 1.4), Column('External', 0.6), Column('Fire rating', 0.7),
        ],
        [
            [d.mark, d.level, ' / '.join(room_label(n) for n in d.rooms), d.type_name, d.type_mark,
             fmt_mm(d.width), fmt_mm(d.height), fmt_mm(d.thickness), d.operation, _yes_no(d.external), d.fire_rating or '—']
            for d in data.doors
        ],
        [d.guid for d in data.doors],
        [
            'Width and height are the overall door sizes in the model, not the clear opening width used for egress checks.',
            '"From / to" lists the rooms the model records on each side of the door; one room means an exterior door or a missing boundary.',
            *(['Fire ratings are blank in the source model.'] if not any(d.fire_rating for d in data.doors) else []),
            *(['The model has no usable door marks; marks D001… are numbered here by level and position.'] if 'door' in data.generated_marks else []),
        ],
        [
            ('Doors', str(len(data.doors))),
            ('External doors', str(sum(1 for d in data.doors if d.external))),
            ('Door types', str(len({d.type_name for d in data.doors}))),
            ('Without room links', str(sum(1 for d in data.doors if not d.rooms))),
        ],
    )

    windows = Table(
        'windows',
        'Window schedule',
        [
            Column('Mark', 0.6), Column('Level', 1.0), Column('Room', 2.4), Column('Type', 1.6), Column('Type mark', 0.6),
            Column('Width (mm)', 0.7, 'end'), Column('Height (mm)', 0.7, 'end'), Column('Sill (mm)', 0.6, 'end'),
            Column('Head (mm)', 0.6, 'end'), Column('External', 0.6),
        ],
        [
            [w.mark, w.level, ' / '.join(room_label(n) for n in w.rooms), w.type_name, w.type_mark,
             fmt_mm(w.width), fmt_mm(w.height), fmt_mm(w.sill), fmt_mm(w.head), _yes_no(w.external)]
            for w in data.windows
        ],
        [w.guid for w in data.windows],
        [
            'Sill and head heights are measured from the finished floor of the window’s level.',
            *(['The model has no usable window marks; marks W001… are numbered here by level and position.'] if 'window' in data.generated_marks else []),
        ],
        [
            ('Windows', str(len(data.windows))),
            ('Window types', str(len({w.type_name for w in data.windows}))),
        ],
    )
    return [rooms, doors, windows]


def write_csv(table: Table, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow([c.title for c in table.columns])
        w.writerows(table.rows)


def _fit(s: str, width_mm: float, size: float) -> str:
    max_chars = max(3, int(width_mm / (size * 0.52)))
    return s if len(s) <= max_chars else s[: max_chars - 1] + '…'


def schedule_sheets(project: Project, table: Table, first_number: str) -> list[Sheet]:
    ax, ay, aw, ah = drawing_area(project.paper)
    size = 2.4 if project.paper in ('A2', 'A3') else 2.6
    row_h = size + 1.7
    header_h = row_h + 2
    title_h = 12
    per_page = max(10, int((ah - title_h - header_h - 6) / row_h))
    pages = [table.rows[i : i + per_page] for i in range(0, len(table.rows), per_page)] or [[]]
    page_guids = [table.guids[i : i + per_page] for i in range(0, len(table.guids), per_page)] or [[]]

    total_w = sum(c.width for c in table.columns)
    widths = [aw * c.width / total_w for c in table.columns]

    sheets: list[Sheet] = []
    for p, rows in enumerate(pages):
        parts: list[str] = []
        y = ay + 6
        page_note = f' (page {p + 1} of {len(pages)})' if len(pages) > 1 else ''
        parts.append(text(ax, y, f'{table.title.upper()}{page_note}', 4.2, weight='bold'))
        y = ay + title_h
        # Header row.
        parts.append(f'<rect x="{ax}" y="{y}" width="{aw:.2f}" height="{header_h:.2f}" fill="#eef1f5"/>')
        x = ax
        for col, w in zip(table.columns, widths):
            tx = x + (w - 1.5 if col.align == 'end' else 1.5)
            parts.append(text(tx, y + header_h - 2.3, _fit(col.title, w - 2, size), size, weight='bold', anchor='end' if col.align == 'end' else 'start'))
            x += w
        y += header_h
        links: list[tuple[str, float, float, float, float, str]] = []
        for r, row in enumerate(rows):
            links.append((page_guids[p][r], ax, y, aw, row_h, f'{table.title.split()[0]} {row[0]}'))
            if r % 2 == 1:
                parts.append(f'<rect x="{ax}" y="{y:.2f}" width="{aw:.2f}" height="{row_h:.2f}" fill="#f7f8fa"/>')
            x = ax
            for col, w, cell in zip(table.columns, widths, row):
                tx = x + (w - 1.5 if col.align == 'end' else 1.5)
                parts.append(text(tx, y + row_h - 1.4, _fit(cell, w - 2, size), size, anchor='end' if col.align == 'end' else 'start'))
                x += w
            y += row_h
        parts.append(f'<rect x="{ax}" y="{ay + title_h}" width="{aw:.2f}" height="{y - ay - title_h:.2f}" fill="none" stroke="{INK}" stroke-width="0.3"/>')
        x = ax
        for w in widths[:-1]:
            x += w
            parts.append(f'<line x1="{x:.2f}" y1="{ay + title_h}" x2="{x:.2f}" y2="{y:.2f}" stroke="#d1d5db" stroke-width="0.15"/>')
        y += 5
        if p == len(pages) - 1:
            for note in table.notes:
                y += size + 1
                parts.append(text(ax, y, note, size * 0.95, fill=QUIET))
        number = first_number if len(pages) == 1 else f'{first_number}.{p + 1}'
        sheets.append(
            Sheet(
                number=number,
                title=f'{table.title}{page_note}',
                kind='schedule',
                scale='NTS',
                body=f'<g class="schedule">{"".join(parts)}</g>',
                sections=[('Summary', table.summary)],
                links=links,
            )
        )
    return sheets


def cover_sheet(project: Project, data: BuildingData, index: list[Sheet], key_plan: Sheet | None = None) -> Sheet:
    ax, ay, aw, ah = drawing_area(project.paper)
    big = 14 if project.paper in ('A0', 'A1') else 10
    size = 3.0 if project.paper in ('A0', 'A1') else 2.6
    parts = [
        text(ax, ay + big, project.title, big, weight='bold'),
        text(ax, ay + big + size * 2.6, f'{project.category} · drawings generated from the IFC model', size * 1.3, fill=QUIET),
    ]
    y = ay + big + size * 7

    def heading(s: str, x: float, yy: float) -> float:
        parts.append(text(x, yy, s.upper(), size * 0.9, weight='bold', fill=QUIET))
        return yy + size * 2

    col_w = (aw - 12) / 2
    # Left column: sheet index.
    yl = heading('Sheet index', ax, y)
    for s in index:
        parts.append(text(ax, yl, s.number, size, weight='bold'))
        parts.append(text(ax + size * 7, yl, _fit(s.title, col_w - size * 22, size), size))
        parts.append(text(ax + col_w, yl, s.scale if s.scale != 'NTS' else '—', size, anchor='end', fill=QUIET))
        yl += size * 1.75

    # Right column: building data.
    xr = ax + col_w + 12
    yr = heading('Building data', xr, y)

    def row(k: str, v: str) -> None:
        nonlocal yr
        parts.append(text(xr, yr, k, size, fill='#374151'))
        parts.append(text(xr + col_w, yr, v, size, weight='bold', anchor='end'))
        yr += size * 1.75

    floors = [s for s in data.storeys if is_floor(s.name) and data.rooms_on(s.name)]
    row('Storeys in model', ', '.join(s.name for s in data.storeys))
    for s in data.storeys:
        row(f'{s.name}: elevation', f'{s.elevation:+.2f} m')
    row('Rooms on floors', str(sum(1 for r in data.rooms if is_floor(r.level))))
    row('Net room area, floors', f'{floor_area(data):,.1f} m²')
    for s in floors:
        row(f'Net area, {s.name}', f'{sum(r.area or 0 for r in data.rooms_on(s.name)):,.1f} m²')
    row('Doors (external)', f'{len(data.doors)} ({sum(1 for d in data.doors if d.external)})')
    row('Windows', str(len(data.windows)))
    yr += size
    yr = heading('Source model', xr, yr)
    row('File', data.file_name)
    row('Schema', data.schema)
    row('Exported', data.exported)
    parts.append(text(xr, yr, 'Authoring', size, fill='#374151'))
    yr += size * 1.75
    parts.append(text(xr, yr, _fit(data.authoring, col_w, size * 0.9), size * 0.9, fill=QUIET))
    yr += size * 2.5
    yr = heading('About these drawings', xr, yr)
    for line in (
        'Plans are cut from the 3D model 1.2 m above each floor.',
        'Schedules list the model’s own property values.',
        'Tags on plans match the Mark column of the schedules.',
        'Roof and foundation levels have no plan sheet.',
    ):
        parts.append(text(xr, yr, line, size, fill='#374151'))
        yr += size * 1.75

    head = ''
    if key_plan is not None:
        # The first floor plan, reduced into the space under the sheet index.
        top = yl + size * 3
        avail_w, avail_h = col_w, ay + ah - top - size * 3
        k = min(avail_w / aw, avail_h / ah)
        if k > 0.1:
            parts.append(text(ax, top, f'KEY PLAN · {key_plan.title.upper()} · NOT TO SCALE', size * 0.9, weight='bold', fill=QUIET))
            parts.append(
                f'<g transform="translate({ax:.2f} {top + size:.2f}) scale({k:.4f}) translate({-ax:.2f} {-ay:.2f})">{key_plan.body}</g>'
            )
            head = key_plan.head

    return Sheet(
        number='G-001',
        title='Cover sheet and sheet index',
        kind='cover',
        scale='NTS',
        head=head,
        body=f'<g class="cover">{"".join(parts)}</g>',
        sections=[('Set', [('Sheets', str(len(index))), ('Paper', project.paper)])],
    )

