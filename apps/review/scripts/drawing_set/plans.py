"""Floor-plan sheets: IfcConvert cuts each storey; this module annotates it.

Each plan shows walls cut 1.2 m above the floor, door swings, rooms with
number, name and area, door and window tags, overall dimensions and a north
arrow. Roof and foundation storeys are skipped: a cut there shows only slab.
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path

from .model_data import BuildingData, Opening
from .sheet import INK, PAPER, SVG_NS, Project, Sheet, drawing_area, esc, fmt_m, text

ET.register_namespace('', SVG_NS)
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
G = f'{{{SVG_NS}}}g'
PATH = f'{{{SVG_NS}}}path'

SECTION_HEIGHT = 1.2

PLAN_CSS = """
  .plan .cut path { fill: #2b2f36; stroke: #2b2f36; stroke-width: 0.15; }
  .plan .projection path { fill: none; stroke: #6b7280; stroke-width: 0.12; stroke-opacity: 1; }
  .plan .IfcSpace path { fill: #e8edf3; fill-opacity: 1; stroke: #b9c2cd; stroke-width: 0.1; }
  .plan .IfcDoor path, .plan .Symbol path { fill: none; stroke: #2b2f36; stroke-width: 0.15; }
  .plan .cut.IfcWindow path { fill: #ffffff; stroke: #2b2f36; stroke-width: 0.12; }
  .plan text { font-family: Helvetica, Arial, sans-serif; font-size: %(label)spx; fill: #1f2937; }
  .tag text { font-family: Helvetica, Arial, sans-serif; }
"""


def is_floor(storey_name: str) -> bool:
    low = storey_name.lower()
    return not any(k in low for k in ('roof', 'fdn', 'footing', 'foundation'))


def plan_title(storey_name: str) -> str:
    return f'{storey_name} floor plan'


def run_ifcconvert(exe: str, ifc: Path, out_svg: Path, bounds: tuple[float, float], scale: int) -> None:
    cmd = [
        exe, '-y', '-q', str(ifc), str(out_svg),
        '--section-height-from-storeys',
        '--door-arcs',
        '--print-space-names',
        '--print-space-areas',
        '--bounds', f'{int(bounds[0])}x{int(bounds[1])}',
        '--scale', f'1:{scale}',
        '--exclude', 'entities', 'IfcOpeningElement', 'IfcSite',
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if not out_svg.exists():
        sys.exit(f'IfcConvert failed on {ifc.name}:\n{result.stderr[-2000:]}')


def _classes(el: ET.Element) -> set[str]:
    return set((el.get('class') or '').split())


def _drop_foreign_openings(storey: ET.Element, storey_name: str, data: BuildingData) -> None:
    """--door-arcs draws every door's swing on every storey; keep this storey's."""
    level_of = {o.guid: o.level for o in [*data.doors, *data.windows]}
    for parent in list(storey.iter()):
        for child in list(parent):
            guid = child.get('data-guid')
            if _classes(child) & {'IfcDoor', 'IfcWindow'} and guid in level_of and level_of[guid] != storey_name:
                parent.remove(child)


def _matrix(storey: ET.Element) -> tuple[float, float, float]:
    """Scale (mm per metre) and offset mapping model plan metres to sheet mm.
    IfcConvert's data-matrix3 maps x directly and y mirrored (sheet y points down)."""
    nums = [float(n) for n in re.findall(r'-?\d+(?:\.\d+)?', storey.get('data-matrix3', ''))]
    return nums[0], nums[2], nums[5]


def _wall_bounds(storey: ET.Element) -> tuple[float, float, float, float] | None:
    xs: list[float] = []
    ys: list[float] = []
    for g in storey.iter(G):
        cls = _classes(g)
        if 'cut' in cls and any(c.startswith('IfcWall') or c == 'IfcColumn' for c in cls):
            for p in g.iter(PATH):
                pts = re.findall(r'(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)', p.get('d', ''))
                xs.extend(float(a) for a, _ in pts)
                ys.extend(float(b) for _, b in pts)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def _dimension(x1: float, y1: float, x2: float, y2: float, label: str, horizontal: bool) -> str:
    """A dimension line with ticks and extension stubs; label centred above or left of it."""
    tick = 1.4
    parts = [f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{INK}" stroke-width="0.18"/>']
    for x, y in ((x1, y1), (x2, y2)):
        parts.append(f'<line x1="{x - tick:.2f}" y1="{y + tick:.2f}" x2="{x + tick:.2f}" y2="{y - tick:.2f}" stroke="{INK}" stroke-width="0.35"/>')
    if horizontal:
        parts.append(text((x1 + x2) / 2, y1 - 1.5, label, 2.6, anchor='middle'))
    else:
        mx, my = x1 - 1.5, (y1 + y2) / 2
        parts.append(text(mx, my, label, 2.6, anchor='middle', extra=f' transform="rotate(-90 {mx:.2f} {my:.2f})"'))
    return '\n'.join(parts)


def _path_points(d: str) -> list[tuple[float, float]]:
    """Vertices of an SVG path. Arcs contribute only their end point (their radius
    and flag arguments are not coordinates)."""
    pts: list[tuple[float, float]] = []
    for cmd, args in re.findall(r'([MLAZHVmlazhv])([^MLAZHVmlazhv]*)', d):
        pairs = re.findall(r'(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)', args)
        if cmd in 'Aa':
            pairs = pairs[-1:]
        pts.extend((float(a), float(b)) for a, b in pairs)
    return pts


def _element_boxes(storey: ET.Element) -> dict[str, tuple[str, float, float, float, float]]:
    """GlobalId -> (kind, x0, y0, x1, y1) in plan coordinates, for rooms, doors and windows."""
    boxes: dict[str, list] = {}
    for g in storey.iter(G):
        guid = g.get('data-guid')
        kinds = _classes(g) & {'IfcSpace', 'IfcDoor', 'IfcWindow'}
        if not guid or not kinds:
            continue
        pts = [pt for p in g.iter(PATH) for pt in _path_points(p.get('d', ''))]
        if not pts:
            continue
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        box = boxes.get(guid)
        if box:
            box[1:] = [min(box[1], min(xs)), min(box[2], min(ys)), max(box[3], max(xs)), max(box[4], max(ys))]
        else:
            boxes[guid] = [kinds.pop(), min(xs), min(ys), max(xs), max(ys)]
    return {k: tuple(v) for k, v in boxes.items()}


def _tag_box(o: Opening, s: float, ox: float, oy: float, scale: int) -> tuple[float, float, float, float] | None:
    if not o.center or not o.mark:
        return None
    x, y = ox + s * o.center[0], oy - s * o.center[1]
    nx, ny = o.normal or (0.0, 1.0)
    off = 4.5 if scale <= 50 else 3.6
    if o.kind == 'window':
        off = -off
    tx, ty = x + nx * off, y - ny * off
    size = 2.0 if scale <= 50 else 1.7
    w = max(4.0, len(o.mark) * size * 0.62 + 1.6)
    h = size + 1.4
    return tx - w / 2, ty - h / 2, tx + w / 2, ty + h / 2


def _tag(o: Opening, s: float, ox: float, oy: float, scale: int) -> str:
    if not o.center or not o.mark:
        return ''
    x, y = ox + s * o.center[0], oy - s * o.center[1]
    nx, ny = o.normal or (0.0, 1.0)
    off = 4.5 if scale <= 50 else 3.6
    if o.kind == 'window':
        off = -off  # windows tagged on the far side from doors' default
    tx, ty = x + nx * off, y - ny * off
    size = 2.0 if scale <= 50 else 1.7
    w = max(4.0, len(o.mark) * size * 0.62 + 1.6)
    h = size + 1.4
    if o.kind == 'door':
        shape = f'<rect x="{tx - w / 2:.2f}" y="{ty - h / 2:.2f}" width="{w:.2f}" height="{h:.2f}" rx="0.6" fill="#ffffff" stroke="{INK}" stroke-width="0.2"/>'
    else:
        c = h / 2
        shape = (
            f'<path d="M{tx - w / 2:.2f} {ty:.2f} L{tx - w / 2 + c:.2f} {ty - c:.2f} H{tx + w / 2 - c:.2f} '
            f'L{tx + w / 2:.2f} {ty:.2f} L{tx + w / 2 - c:.2f} {ty + c:.2f} H{tx - w / 2 + c:.2f} Z" '
            f'fill="#ffffff" stroke="{INK}" stroke-width="0.2"/>'
        )
    return (
        f'<g class="tag" data-guid="{esc(o.guid)}">{shape}'
        + text(tx, ty + size * 0.36, o.mark, size, weight='bold', anchor='middle')
        + '</g>'
    )


def plan_sheets(project: Project, data: BuildingData, exe: str, ifc: Path, first_number: int) -> list[Sheet]:
    ax, ay, aw, ah = drawing_area(project.paper)
    # Leave room around the plan for dimension strings.
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / 'plans.svg'
        print(f'[drawings] cutting {project.id} storeys with IfcConvert…')
        run_ifcconvert(exe, ifc, raw, (aw - 24, ah - 24), project.scale)
        root = ET.parse(raw).getroot()

    defs = root.find(f'{{{SVG_NS}}}defs')
    base_style = root.find(f'{{{SVG_NS}}}style')
    head = (ET.tostring(defs, encoding='unicode') if defs is not None else '') + (
        ET.tostring(base_style, encoding='unicode') if base_style is not None else ''
    )
    label = 2.0 if project.scale >= 100 else 2.6
    head += f'<style type="text/css">{PLAN_CSS % {"label": label}}</style>'

    elevations = {s.name: s for s in data.storeys}
    storeys = [g for g in root.iter(G) if g.get('class') == 'IfcBuildingStorey' and is_floor(g.get('data-name') or '')]
    storeys = [g for g in storeys if sum(1 for _ in g.iter(PATH)) >= 10]
    storeys.sort(key=lambda g: elevations[g.get('data-name')].elevation if g.get('data-name') in elevations else 0.0)

    sheets: list[Sheet] = []
    for i, storey in enumerate(storeys):
        name = storey.get('data-name') or f'Storey {i + 1}'
        _drop_foreign_openings(storey, name, data)
        s, ox, oy = _matrix(storey)
        plan = ET.tostring(storey, encoding='unicode').replace('&amp;#178;', '²')
        boxes = _element_boxes(storey)

        annotations: list[str] = []
        openings = data.openings_on(name)
        annotations.extend(_tag(o, s, ox, oy, project.scale) for o in openings)
        bounds = _wall_bounds(storey)
        if bounds:
            x0, y0, x1, y1 = bounds
            width_m, depth_m = (x1 - x0) / s, (y1 - y0) / s
            annotations.append(_dimension(x0, y0 - 9, x1, y0 - 9, f'{width_m:.2f} m', True))
            annotations.append(_dimension(x0 - 9, y0, x0 - 9, y1, f'{depth_m:.2f} m', False))
            for x in (x0, x1):
                annotations.append(f'<line x1="{x:.2f}" y1="{y0 - 11:.2f}" x2="{x:.2f}" y2="{y0 - 2:.2f}" stroke="{INK}" stroke-width="0.12"/>')
            for y in (y0, y1):
                annotations.append(f'<line x1="{x0 - 11:.2f}" y1="{y:.2f}" x2="{x0 - 2:.2f}" y2="{y:.2f}" stroke="{INK}" stroke-width="0.12"/>')

        rooms = data.rooms_on(name)
        st = elevations.get(name)
        doors = [o for o in openings if o.kind == 'door']
        windows = [o for o in openings if o.kind == 'window']
        level_rows = [
            ('Floor elevation', f'{fmt_m(st.elevation)} m' if st else ''),
            ('Floor to floor', f'{fmt_m(st.height)} m' if st and st.height else ''),
            ('Plan cut height', f'{SECTION_HEIGHT:.1f} m above floor'),
            ('Rooms', str(len(rooms))),
            ('Net room area', f'{sum(r.area or 0 for r in rooms):,.1f} m²'),
            ('Doors / windows', f'{len(doors)} / {len(windows)}'),
        ]
        if bounds:
            level_rows.append(('Overall (walls)', f'{width_m:.2f} × {depth_m:.2f} m'))

        # Hotspots: rooms first, then doors and windows on top of them. A
        # door's hotspot covers its swing and its tag.
        px, py = ax + 12, ay + 12
        room_label = {r.guid: f'{r.number} {r.name}'.strip() for r in rooms}
        links: list[tuple[str, float, float, float, float, str]] = []
        by_guid = {o.guid: o for o in openings}
        # Rooms largest first, so a big corridor's bounding box never covers a small room.
        def order(kv):
            kind, x0, y0, x1, y1 = kv[1]
            return (kind != 'IfcSpace', -(x1 - x0) * (y1 - y0) if kind == 'IfcSpace' else 0)

        for guid, (kind, x0, y0, x1, y1) in sorted(boxes.items(), key=order):
            if kind == 'IfcSpace':
                label = room_label.get(guid, '')
                links.append((guid, px + x0, py + y0, x1 - x0, y1 - y0, label))
                continue
            o = by_guid.get(guid)
            if o is None:
                continue
            tb = _tag_box(o, s, ox, oy, project.scale)
            if tb:
                x0, y0, x1, y1 = min(x0, tb[0]), min(y0, tb[1]), max(x1, tb[2]), max(y1, tb[3])
            pad = 0.6
            label = f'{"Door" if o.kind == "door" else "Window"} {o.mark}'
            links.append((guid, px + x0 - pad, py + y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad, label))

        sheets.append(
            Sheet(
                number=f'A-{first_number + i}',
                title=plan_title(name),
                kind='plan',
                scale=f'1:{project.scale}',
                head=head,
                body=f'<g class="plan" transform="translate({ax + 12} {ay + 12})">{plan}{"".join(annotations)}</g>',
                sections=[
                    ('Level data', level_rows),
                    ('Legend', [
                        ('Walls and columns cut at 1.2 m', 'dark fill'),
                        ('Room: name, number, area (m²)', 'light fill'),
                        ('Door tag, see door schedule', 'mark in box'),
                        ('Window tag, see window schedule', 'mark in hexagon'),
                    ]),
                ],
                north=data.true_north or (0.0, 1.0),
                show_scale_bar=True,
                links=links,
                storey=name,
            )
        )
    return sheets
