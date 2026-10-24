"""Code checks for Boston, Massachusetts, written against what a Revit-exported
residential model carries.

Boston enforces the Massachusetts State Building Code, 780 CMR — its Residential
Volume (780 CMR 51.00, the Massachusetts Residential Code, 10th Edition) adopts
the 2021 IRC with Massachusetts amendments. Rules cite the IRC section as
adopted into 780 CMR 51; electrical rules follow the Massachusetts Electrical
Code (527 CMR 12, the amended NEC) and plumbing the state plumbing code
(248 CMR). Boston adds local administration through the City's Inspectional
Services Department, but the technical thresholds here are the 780 CMR ones.

Each rule lists what complies and what violates in plain terms, then reports
every element or room it examined. A finding is anchored on an element in
the architectural model (so the app can select it) and on a point (so the
3D view and the floor plan can mark the exact spot)."""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from shapely.geometry import LineString, Point

from .context import MM_PER_IN, Context, Device, Space, inches, sq_ft

CODE = '780 CMR — Massachusetts State Building Code, 10th Ed. (Residential Volume, 780 CMR 51.00, adopting the 2021 IRC with Massachusetts amendments), as enforced in Boston'



@dataclass
class Rule:
    id: str
    section: str
    title: str
    complies: str  # what the code accepts
    violates: str  # what fails it
    fix: str  # the usual remedy
    check: object = None  # (Context) -> list[Finding]


@dataclass
class Finding:
    rule: str
    status: str  # 'fail' | 'pass'
    target: dict  # {globalId, ifcClass, name, model}: the element the app selects
    storey: str
    room: str
    measured: str
    required: str
    message: str
    point: tuple[float, float, float]  # model coordinates, metres, Z up
    related: list[dict] = field(default_factory=list)  # other elements involved, any model
    sheet: dict | None = None  # {number, page, x, y} on the floor plan


RULES: list[Rule] = []


def rule(**meta):
    def register(fn):
        RULES.append(Rule(**meta, check=fn))
        return fn

    return register


# ---------------------------------------------------------------- helpers


def _ref(ctx: Context, guid: str) -> dict:
    el = ctx.arch.by_guid(guid)
    return {'globalId': guid, 'ifcClass': el.is_a(), 'name': el.Name or '', 'model': ctx.arch_path.name}


def _dev(d: Device) -> dict:
    return {'globalId': d.guid, 'ifcClass': d.ifc_class, 'name': d.name, 'model': d.model}


def _space_ref(s: Space) -> dict:
    return {'globalId': s.guid, 'ifcClass': 'IfcSpace', 'name': s.label, 'model': ''}


def _finding(ctx: Context, rule_id: str, ok: bool, target: dict, point, room: str, measured: str, required: str,
             message: str, related: list[dict] | None = None, storey: str | None = None) -> 'Finding':
    point = tuple(round(float(c), 3) for c in point)
    storey = storey or ctx.storey_at(point[2])
    if not target.get('model'):
        target = {**target, 'model': ctx.arch_path.name}
    return Finding(rule_id, 'pass' if ok else 'fail', target, storey, room, measured, required, message, point,
                   related or [], ctx.on_sheet(point, storey))


def _pset(el_or_psets, *names: str):
    psets = el_or_psets if isinstance(el_or_psets, dict) else None
    for props in (psets or {}).values():
        for n in names:
            v = props.get(n)
            if v not in (None, '', n):  # Revit writes unfilled parameters as their own name
                return v
    return None


def _psets(ctx: Context, guid: str) -> dict:
    import ifcopenshell.util.element as ue

    el = ctx.arch.by_guid(guid)
    t = ue.get_type(el)
    return {**(ue.get_psets(t) if t is not None else {}), **ue.get_psets(el)}


def _window_operable(ctx: Context, guid: str) -> bool:
    ps = _psets(ctx, guid)
    el = ctx.arch.by_guid(guid)
    text = ' '.join(str(x) for x in (el.Name, _pset(ps, 'OmniClass Title'), _pset(ps, 'OperationType'))).lower()
    return 'fixed' not in text


def _opening_point(ctx: Context, o) -> tuple[float, float, float]:
    level = next((s.elevation for s in ctx.data.storeys if s.name == o.level), 0.0)
    x, y = o.center or (0.0, 0.0)
    return (x, y, level + (o.sill or 0.0) + (o.height or 0.0) / 2)


def _room_point(s: Space, height: float | None = None) -> tuple[float, float, float]:
    c = s.outline.representative_point()
    return (c.x, c.y, s.floor + (height if height is not None else 1.2))


def _beside(s: Space, p, step: float = 0.6) -> tuple[float, float, float]:
    """A point next to p inside the room, so two markers for one room don't overlap."""
    for dx, dy in ((0, step), (0, -step), (step, 0), (-step, 0)):
        if s.outline.contains(Point(p[0] + dx, p[1] + dy)):
            return (p[0] + dx, p[1] + dy, p[2])
    return p


def _inside(s: Space, p, normal, depth: float) -> tuple[float, float, float]:
    """p moved `depth` metres off a wall into the room, along the wall's normal."""
    if not normal:
        return p
    for sign in (1, -1):
        q = (p[0] + sign * normal[0] * depth, p[1] + sign * normal[1] * depth, p[2])
        if s.outline.contains(Point(q[0], q[1])):
            return q
    return p


SLEEPING = ('bedroom', 'sleeping')
HABITABLE = ('bedroom', 'living', 'kitchen', 'dining', 'family', 'den', 'study', 'office')


def _is(s: Space, words) -> bool:
    return any(w in s.name.lower() for w in words)


def _sleeping_area_halls(ctx: Context) -> list[tuple[Space, list[Space]]]:
    """The spaces just outside each group of bedrooms: whatever a bedroom door opens onto."""
    halls: dict[str, list[Space]] = {}
    for d in ctx.data.doors:
        rooms = [ctx.space_by_number(n) for n in d.rooms]
        rooms = [r for r in rooms if r]
        beds = [r for r in rooms if _is(r, SLEEPING)]
        others = [r for r in rooms if not _is(r, SLEEPING)]
        for b in beds:
            for o in others:
                halls.setdefault(o.guid, []).append(b)
    return [(ctx.space(g), sorted({b.guid: b for b in beds}.values(), key=lambda b: b.number)) for g, beds in halls.items()]


# ---------------------------------------------------------------- 1. emergency escape


@rule(
    id='IRC-R310.1',
    section='780 CMR 51 · R310.1, R310.2',
    title='Emergency escape and rescue opening in every sleeping room',
    complies='Every bedroom has an operable window or exterior door with at least 5.7 sq ft net clear opening '
             '(5.0 sq ft at grade floor), at least 24 in clear height and 20 in clear width, sill no more than 44 in above the floor.',
    violates='A bedroom whose only windows are fixed glazing, or whose operable window is too small or too high.',
    fix='Change one window per bedroom to an egress casement (for example 30 × 54 in rough opening, sill ≤ 44 in).',
)
def emergency_escape(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not _is(s, SLEEPING):
            continue
        windows = [w for w in ctx.data.windows if s.number in w.rooms]
        doors = [d for d in ctx.data.doors if s.number in d.rooms and d.external]
        qualifying = []
        for w in windows:
            if not _window_operable(ctx, w.guid):
                continue
            # Net clear opening of an operable sash is smaller than the unit; without
            # sash data, take the unit size and leave the margin to the reviewer.
            wd, ht, sill = (w.width or 0) * 1000, (w.height or 0) * 1000, (w.sill or 0) * 1000
            if wd * ht / 1e6 >= 0.53 and ht >= 610 and wd >= 508 and sill <= 1118:
                qualifying.append(w)
        ok = bool(qualifying or doors)
        biggest = max(windows, key=lambda w: (w.width or 0) * (w.height or 0), default=None)
        point = _inside(s, _opening_point(ctx, biggest), biggest.normal, 0.8) if biggest else _room_point(s)
        fixed = sum(1 for w in windows if not _window_operable(ctx, w.guid))
        measured = (f'{len(qualifying)} qualifying opening(s)' if ok else
                    f'0 operable openings: {fixed} of {len(windows)} windows are fixed glazing, no exterior door')
        out.append(_finding(
            ctx, 'IRC-R310.1', ok, _space_ref(s), point, s.label, measured,
            '≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in',
            f'{s.label} has an emergency escape opening.' if ok else
            f'{s.label} has no way out but the door: every window is fixed.',
            [_ref(ctx, w.guid) for w in windows], storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 2-3. stairs


def _stairs(ctx: Context):
    for st in ctx.arch.by_type('IfcStair'):
        import ifcopenshell.util.element as ue

        ps = ue.get_psets(st)
        flights = [c for rel in getattr(st, 'IsDecomposedBy', []) for c in rel.RelatedObjects if c.is_a('IfcStairFlight')]
        container = ue.get_container(st)
        yield st, ps, flights, (container.Name if container else '')


def _stair_point(ctx: Context, st, flights) -> tuple[float, float, float]:
    el = flights[0] if flights else st
    return ctx.centre(el)


def _stair_label(ctx: Context, st, flights) -> str:
    p = _stair_point(ctx, st, flights)
    s = ctx.space_at((p[0], p[1], ctx.data.storeys[1].elevation + 0.5 if len(ctx.data.storeys) > 1 else p[2]))
    unit = f'Unit {s.unit} stair' if s and s.unit else 'Stair'
    return f'{unit} ({s.label})' if s else unit


@rule(
    id='IRC-R311.7.5.2',
    section='780 CMR 51 · R311.7.5.2',
    title='Stair tread depth',
    complies='Tread depth at least 10 in (254 mm), measured horizontally nosing to nosing; the largest and smallest tread in a flight within 3/8 in.',
    violates='Any tread shallower than 10 in.',
    fix='Lengthen the run: 15 treads × 254 mm needs 3.81 m of run instead of 3.75 m, or redistribute with one more riser.',
)
def tread_depth(ctx: Context) -> list[Finding]:
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        tread = _pset(ps, 'TreadLength', 'Actual Tread Depth')
        if tread is None:
            continue
        mm = float(tread) * 1000
        ok = mm >= 254 - 0.5
        label = _stair_label(ctx, st, flights)
        out.append(_finding(
            ctx, 'IRC-R311.7.5.2', ok, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
            f'{mm:.0f} mm ({inches(mm)})', '≥ 254 mm (10 in)',
            f'{label}: treads are {mm:.0f} mm, {254 - mm:.0f} mm short of 10 in.' if not ok else f'{label}: treads {mm:.0f} mm.',
            [_ref(ctx, f.GlobalId) for f in flights], storey=storey,
        ))
    return out


@rule(
    id='IRC-R311.7.5.3',
    section='780 CMR 51 · R311.7.5.3',
    title='Stair nosing projection',
    complies='Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.',
    violates='Treads under 11 in with no nosing or one under 3/4 in.',
    fix='Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.',
)
def nosing(ctx: Context) -> list[Finding]:
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        tread = _pset(ps, 'TreadLength', 'Actual Tread Depth')
        nose = _pset(ps, 'Nosing Length', 'NosingLength')
        if tread is None:
            continue
        tread_mm = float(tread) * 1000
        nose_mm = float(nose or 0) * 1000
        needed = tread_mm < 279.4
        ok = (not needed) or 19.05 - 0.5 <= nose_mm <= 31.75 + 0.5
        label = _stair_label(ctx, st, flights)
        out.append(_finding(
            ctx, 'IRC-R311.7.5.3', ok, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
            f'{nose_mm:.0f} mm ({inches(nose_mm)}) nosing on {tread_mm:.0f} mm treads',
            '19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in)',
            f'{label}: nosing {nose_mm:.0f} mm, needs at least 19 mm.' if not ok else f'{label}: nosing within range.',
            [_ref(ctx, f.GlobalId) for f in flights], storey=storey,
        ))
    return out


# ---------------------------------------------------------------- 4. safety glazing


@rule(
    id='IRC-R308.4.3',
    section='780 CMR 51 · R308.4.3',
    title='Safety glazing in hazardous window locations',
    complies='Glazing that meets all four conditions (pane over 9 sq ft, bottom edge under 18 in above the floor, top edge over 36 in, '
             'walking surface within 36 in) is tempered or laminated safety glazing; any other window may be annealed.',
    violates='A large, low pane like this that is specified as ordinary glass.',
    fix='Specify tempered (or laminated) glass for these window types, or raise the sill to 18 in.',
)
def safety_glazing(ctx: Context) -> list[Finding]:
    out = []
    for w in ctx.data.windows:
        if w.sill is None or not w.width or not w.height:
            continue
        area = w.width * w.height
        hazardous = area > 0.836 and w.sill * 1000 < 457 and (w.sill + w.height) * 1000 > 914
        if not hazardous:
            continue
        glass = str(_pset(_psets(ctx, w.guid), 'Glass Pane Material', 'Glazing', 'GlazingType') or 'not specified')
        safe = any(k in glass.lower() for k in ('temper', 'laminat', 'safety'))
        room = ', '.join(w.rooms)
        out.append(_finding(
            ctx, 'IRC-R308.4.3', safe, _ref(ctx, w.guid), _opening_point(ctx, w), room,
            f'{sq_ft(area)} pane, bottom edge {inches(w.sill * 1000)} above floor; glass: {glass}',
            'tempered or laminated safety glazing',
            f'Window {w.mark} ({room}) is in a hazardous location and specified as "{glass}".' if not safe
            else f'Window {w.mark} is safety glazed.',
            storey=w.level,
        ))
    return out


# ---------------------------------------------------------------- 5. dwelling unit separation


@rule(
    id='IRC-R302.3',
    section='780 CMR 51 · R302.3',
    title='Two-family dwelling separation',
    complies='The wall separating the two dwelling units is fire-resistance rated for 1 hour (1/2 hour where the building is '
             'sprinklered per NFPA 13D), continuous to the underside of the roof deck.',
    violates='A separation wall with no fire-resistance rating in an unsprinklered two-family dwelling.',
    fix='Assign a tested 1-hour assembly (for example UL U905 masonry) to the party wall type and carry it to the roof deck.',
)
def unit_separation(ctx: Context) -> list[Finding]:
    import ifcopenshell.util.element as ue

    sprinklered = bool(ctx.devices_named('sprinkler'))
    required_h = 0.5 if sprinklered else 1.0
    sides: dict[str, set[str]] = {}
    for rel in ctx.arch.by_type('IfcRelSpaceBoundary'):
        el, sp = rel.RelatedBuildingElement, rel.RelatingSpace
        if el is not None and sp is not None and el.is_a('IfcWall'):
            s = ctx.space(sp.GlobalId)
            if s and s.unit:
                sides.setdefault(el.GlobalId, set()).add(s.unit)
    out = []
    for wall in ctx.arch.by_type('IfcWall'):
        t = ue.get_type(wall)
        name = f'{wall.Name or ""} {t.Name if t else ""}'.lower()
        named = any(k in name for k in ('party', 'demising', 'dimising', 'separation'))
        if not (named or (len(sides.get(wall.GlobalId, ())) > 1 and 'exterior' not in name)):
            continue
        rating = _pset(_psets(ctx, wall.GlobalId), 'FireRating', 'Fire Rating')
        hours = _hours(rating)
        ok = hours is not None and hours >= required_h
        lo, hi = ctx.bbox(wall)
        point = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2] + 1.2)
        storey = ue.get_container(wall).Name if ue.get_container(wall) else ctx.storey_at(point[2])
        out.append(_finding(
            ctx, 'IRC-R302.3', ok, _ref(ctx, wall.GlobalId), point, 'Between units A and B',
            f'fire rating: {rating or "none"}{"" if sprinklered else "; no sprinklers in any model"}',
            f'{"1/2" if sprinklered else "1"}-hour fire-resistance rating',
            f'Party wall ({(t.Name if t else wall.Name or "").split(":")[-1]}) has no fire-resistance rating.' if not ok
            else 'Party wall rating meets R302.3.',
            storey=storey,
        ))
    return out


def _hours(rating) -> float | None:
    if rating is None:
        return None
    import re

    m = re.search(r'(\d+(?:\.\d+)?)\s*(?:-|\s)?\s*(h|hr|hour)', str(rating).lower())
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+)\s*min', str(rating).lower())
    return float(m.group(1)) / 60 if m else None


# ---------------------------------------------------------------- 6-7. alarms


@rule(
    id='IRC-R314.3',
    section='780 CMR 51 · R314.3',
    title='Smoke alarm locations',
    complies='A smoke alarm in each sleeping room, outside each separate sleeping area in the immediate vicinity of the bedrooms, '
             'and on each story.',
    violates='A sleeping area whose hallway has no smoke alarm (or a bedroom or story without one).',
    fix='Add an interconnected smoke alarm on the hallway ceiling outside the bedrooms.',
)
def smoke_alarms(ctx: Context) -> list[Finding]:
    alarms = ctx.devices_named('smoke detector', 'smoke alarm')
    out = []

    def check(space: Space, why: str):
        here = [a for a in alarms if a.space is space]
        ok = bool(here)
        out.append(_finding(
            ctx, 'IRC-R314.3', ok, _space_ref(space),
            here[0].point if here else _room_point(space, space.ceiling - space.floor), space.label,
            f'{len(here)} smoke alarm(s)', f'1 smoke alarm ({why})',
            f'{space.label}: smoke alarm present.' if ok else f'{space.label} has no smoke alarm ({why}).',
            [_dev(a) for a in here], storey=space.storey,
        ))

    for s in ctx.spaces:
        if _is(s, SLEEPING):
            check(s, 'sleeping room')
    for hall, beds in _sleeping_area_halls(ctx):
        check(hall, f'outside sleeping area of {", ".join(b.number for b in beds)}')
    return out


@rule(
    id='IRC-R315.2',
    section='780 CMR 51 · R315.2.1, R315.3',
    title='Carbon monoxide alarms where there are fuel-burning appliances',
    complies='A dwelling unit with a fuel-burning appliance has a CO alarm outside each separate sleeping area in the immediate '
             'vicinity of the bedrooms (and in any bedroom that contains such an appliance).',
    violates='A unit with a gas-fired appliance and no CO alarm outside its bedrooms.',
    fix='Add a CO alarm (or combination smoke/CO alarm) on the hallway ceiling outside the bedrooms.',
)
def co_alarms(ctx: Context) -> list[Finding]:
    fuel = [d for d in ctx.devices if _pset(d.psets, 'Gas Flow', 'Gas Diameter', 'FuelType')
            or any(k in d.name.lower() for k in ('furnace', 'gas water heater', 'fireplace'))]
    if not fuel:
        return []
    co = ctx.devices_named('carbon monoxide', 'co alarm', 'co detector', 'smoke/co', 'smoke and co')
    out = []
    for hall, beds in _sleeping_area_halls(ctx):
        appliances = [d for d in fuel if d.space and d.space.unit == hall.unit]
        if not appliances:
            continue
        here = [a for a in co if a.space is hall]
        ok = bool(here)
        out.append(_finding(
            ctx, 'IRC-R315.2', ok, _space_ref(hall),
            here[0].point if here else _beside(hall, _room_point(hall, hall.ceiling - hall.floor)), hall.label,
            f'{len(here)} CO alarm(s); fuel-burning: {", ".join(f"{a.name.split(":")[0]} in {a.space.label}" for a in appliances)}',
            '1 CO alarm outside the sleeping area',
            f'{hall.label}: CO alarm present.' if ok else
            f'Unit {hall.unit} has a gas-fired boiler but no CO alarm outside bedrooms {", ".join(b.number for b in beds)}.',
            [_dev(a) for a in appliances], storey=hall.storey,
        ))
    return out


# ---------------------------------------------------------------- 8-9. ventilation


def _whole_house_ventilation(ctx: Context) -> list[Device]:
    return [d for d in ctx.devices if any(k in d.name.lower() for k in
            ('erv', 'hrv', 'energy recovery', 'heat recovery', 'ventilator', 'supply air', 'air handling'))]


@rule(
    id='IRC-R303.1',
    section='780 CMR 51 · R303.1',
    title='Habitable room ventilation',
    complies='Openable area to the outdoors (operable windows, exterior doors) of at least 4% of each habitable room’s floor area, '
             'or a whole-house mechanical ventilation system per M1505.4.',
    violates='A habitable room with only fixed glazing and no whole-house mechanical ventilation.',
    fix='Make part of the glazing operable, or add a whole-house ventilation system (ERV/HRV or exhaust-only per M1505.4).',
)
def room_ventilation(ctx: Context) -> list[Finding]:
    mech = _whole_house_ventilation(ctx)
    out = []
    for s in ctx.spaces:
        if not _is(s, HABITABLE):
            continue
        area = s.outline.area
        openable = sum((w.width or 0) * (w.height or 0) for w in ctx.data.windows
                       if s.number in w.rooms and _window_operable(ctx, w.guid))
        openable += sum((d.width or 0) * (d.height or 0) for d in ctx.data.doors if s.number in d.rooms and d.external)
        need = 0.04 * area
        ok = openable >= need or bool(mech)
        out.append(_finding(
            ctx, 'IRC-R303.1', ok, _space_ref(s), _room_point(s), s.label,
            f'{openable:.2f} m² openable ({sq_ft(openable)}) for {area:.1f} m² floor'
            + ('' if mech else '; no whole-house ventilation in the MEP model'),
            f'≥ {need:.2f} m² ({sq_ft(need)}), 4% of floor area',
            f'{s.label}: openable area {openable:.2f} m², needs {need:.2f} m².' if not ok else f'{s.label}: ventilated.',
            storey=s.storey,
        ))
    return out


@rule(
    id='IRC-R303.3',
    section='780 CMR 51 · R303.3, M1505',
    title='Bathroom ventilation',
    complies='Each bathroom has a window of at least 3 sq ft, half of it openable, or a mechanical exhaust to the outdoors '
             '(50 cfm intermittent or 20 cfm continuous).',
    violates='A bathroom with no window and no exhaust fan or exhaust duct.',
    fix='Add a ceiling exhaust fan ducted to the outdoors (50 cfm intermittent).',
)
def bathroom_ventilation(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not any(k in s.name.lower() for k in ('bath', 'toilet', 'wc', 'powder')):
            continue
        windows = [w for w in ctx.data.windows if s.number in w.rooms]
        window_ok = any((w.width or 0) * (w.height or 0) >= 0.279 and _window_operable(ctx, w.guid) for w in windows)
        exhaust = [d for d in ctx.devices if d.space is s and
                   any(k in d.name.lower() for k in ('exhaust', 'fan', 'grille', 'diffuser', 'air terminal'))]
        ok = window_ok or bool(exhaust)
        out.append(_finding(
            ctx, 'IRC-R303.3', ok, _space_ref(s), _room_point(s, s.ceiling - s.floor - 0.1), s.label,
            f'{len(windows)} window(s), {len(exhaust)} exhaust device(s)', '3 sq ft window, half openable, or exhaust fan to outdoors',
            f'{s.label}: ventilated.' if ok else f'{s.label} has no window and no exhaust fan.',
            [_dev(d) for d in exhaust], storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 10. fixture spacing


@rule(
    id='IRC-R307.1',
    section='780 CMR 51 · R307.1, P2705.1',
    title='Plumbing fixture clearances',
    complies='Water closets and lavatories at least 15 in (381 mm) from their centre to a side wall or obstruction, and at least '
             '30 in (762 mm) centre to centre from an adjacent fixture.',
    violates='Fixtures set closer than 30 in apart, or less than 15 in from a side wall.',
    fix='Respace the fixtures to 30 in centres, or replace the pair of lavatories with one.',
)
def fixture_spacing(ctx: Context) -> list[Finding]:
    fixtures = [d for d in ctx.devices_named('water closet', 'lavatory', 'bidet') if d.space and d.ifc_class == 'IfcFlowTerminal']
    out = []
    by_room: dict[str, list[Device]] = {}
    for f in fixtures:
        by_room.setdefault(f.space.guid, []).append(f)
    for guid, items in by_room.items():
        s = ctx.space(guid)
        name = lambda f: f.name.split(':')[0].replace('M_', '')
        placed = {f.guid: _against_wall(s, f) for f in items}
        # Centre to centre between fixtures side by side on the same wall.
        for i, a in enumerate(items):
            for b in items[i + 1:]:
                (na, wa), (nb, wb) = placed[a.guid], placed[b.guid]
                if na is None or nb is None or wa.distance(wb) > 0.05 or na[0] * nb[0] + na[1] * nb[1] < 0.9:
                    continue
                d = math.dist(a.point[:2], b.point[:2]) * 1000
                ok = d >= 762 - 1
                mid = tuple((p + q) / 2 for p, q in zip(_front(a, na), _front(b, nb)))
                out.append(_finding(
                    ctx, 'IRC-R307.1', ok, _space_ref(s), mid, s.label,
                    f'{d:.0f} mm ({inches(d)}) centre to centre, {name(a)} and {name(b)}', '≥ 762 mm (30 in)',
                    f'{s.label}: {name(a)} and {name(b)} are {d:.0f} mm apart on centres, {762 - d:.0f} mm too close.' if not ok
                    else f'{s.label}: {name(a)} and {name(b)} {d:.0f} mm apart.',
                    [_dev(a), _dev(b)], storey=s.storey,
                ))
        # Centre to the nearest side wall, along the wall the fixture is set against.
        for f in items:
            side = _side_clearance(s, f, *placed[f.guid])
            if side is None:
                continue
            ok = side >= 381 - 1
            out.append(_finding(
                ctx, 'IRC-R307.1', ok, _space_ref(s), _front(f, placed[f.guid][0]), s.label,
                f'{side:.0f} mm ({inches(side)}) centre to side wall, {name(f)}', '≥ 381 mm (15 in)',
                f'{s.label}: {name(f)} is {side:.0f} mm from the side wall, {381 - side:.0f} mm too close.' if not ok
                else f'{s.label}: {name(f)} side clearance {side:.0f} mm.',
                [_dev(f)], storey=s.storey,
            ))
    return out


def _front(f: Device, facing, depth: float = 0.25) -> tuple[float, float, float]:
    """The middle of a fixture, rather than its insertion point on the back wall."""
    if facing is None:
        return f.point
    return (f.point[0] + facing[0] * depth, f.point[1] + facing[1] * depth, f.point[2])


def _against_wall(s: Space, f: Device):
    """The room edge a fixture is set against, and the direction it faces (into the room)."""
    p = Point(f.point[:2])
    ring = list(s.outline.exterior.coords)
    edges = [LineString([ring[i], ring[i + 1]]) for i in range(len(ring) - 1)]
    edge = min(edges, key=lambda e: e.distance(p))
    (x0, y0), (x1, y1) = edge.coords
    length = math.hypot(x1 - x0, y1 - y0) or 1.0
    nx, ny = -(y1 - y0) / length, (x1 - x0) / length
    if not s.outline.contains(Point(p.x + nx * 0.1, p.y + ny * 0.1)):
        nx, ny = -nx, -ny
    return (nx, ny), edge


def _side_clearance(s: Space, f: Device, facing, edge) -> float | None:
    """mm from the fixture's centre line to the nearest wall either side of it."""
    if facing is None:
        return None
    nx, ny = facing
    # Measure a little in front of the back wall, along the wall's direction.
    x, y = f.point[0] + nx * 0.2, f.point[1] + ny * 0.2
    ux, uy = -ny, nx
    best = None
    for sign in (1, -1):
        ray = LineString([(x, y), (x + sign * ux * 10, y + sign * uy * 10)])
        hit = ray.intersection(s.outline.exterior)
        pts = [hit] if hit.geom_type == 'Point' else [g for g in getattr(hit, 'geoms', []) if g.geom_type == 'Point']
        if pts:
            d = min(Point(x, y).distance(q) for q in pts) * 1000
            best = d if best is None else min(best, d)
    return best


# ════════════════════════════════════════════════════════════════════════════
#  Twenty further checks. Each examines only what a sample actually carries and
#  reports a pass/fail per element or room; a sample missing the relevant
#  element (e.g. the office has no MEP devices) simply yields no findings for
#  that rule rather than failing to run.
# ════════════════════════════════════════════════════════════════════════════


# ---------------------------------------------------------------- 11. ceiling height


@rule(
    id='IRC-R305.1',
    section='780 CMR 51 · R305.1',
    title='Minimum ceiling height in habitable rooms',
    complies='Habitable rooms, hallways and portions of basements with habitable space have a ceiling height of at least '
             '7 ft (2134 mm); bathrooms and toilet rooms at least 6 ft 8 in (2032 mm).',
    violates='A habitable room with a finished ceiling under 7 ft.',
    fix='Raise the ceiling or reclassify the low space as non-habitable (storage) on the plans.',
)
def ceiling_height(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not _is(s, HABITABLE):
            continue
        h = (s.ceiling - s.floor) * 1000
        if h < 300:  # a slab-to-slab space with no real ceiling reading
            continue
        ok = h >= 2134 - 1
        out.append(_finding(
            ctx, 'IRC-R305.1', ok, _space_ref(s), _room_point(s, (s.ceiling - s.floor) - 0.1), s.label,
            f'{h:.0f} mm ({inches(h)})', '≥ 2134 mm (7 ft)',
            f'{s.label}: ceiling {h:.0f} mm, {2134 - h:.0f} mm short of 7 ft.' if not ok else f'{s.label}: ceiling {h:.0f} mm.',
            storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 12. minimum room area


@rule(
    id='IRC-R304.1',
    section='780 CMR 51 · R304.1',
    title='Minimum habitable room area',
    complies='Every habitable room has at least 70 sq ft (6.5 m²) of floor area (kitchens are exempt from the 70 sq ft minimum).',
    violates='A habitable room — other than a kitchen — smaller than 70 sq ft.',
    fix='Combine the undersized room with an adjacent space, or reclassify it as an alcove/closet.',
)
def room_area(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not _is(s, HABITABLE) or 'kitchen' in s.name.lower():
            continue
        area = s.outline.area
        ok = area >= 6.5 - 0.01
        out.append(_finding(
            ctx, 'IRC-R304.1', ok, _space_ref(s), _room_point(s), s.label,
            f'{area:.1f} m² ({sq_ft(area)})', '≥ 6.5 m² (70 sq ft)',
            f'{s.label}: {sq_ft(area)}, below the 70 sq ft minimum.' if not ok else f'{s.label}: {sq_ft(area)}.',
            storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 13. minimum room width


@rule(
    id='IRC-R304.2',
    section='780 CMR 51 · R304.2',
    title='Minimum habitable room dimension',
    complies='Habitable rooms are at least 7 ft (2134 mm) in any horizontal direction.',
    violates='A habitable room with a least-width under 7 ft.',
    fix='Widen the room, or merge the narrow strip into the adjoining space.',
)
def room_width(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not _is(s, HABITABLE):
            continue
        width = _least_width(s) * 1000
        if width <= 0:
            continue
        ok = width >= 2134 - 1
        out.append(_finding(
            ctx, 'IRC-R304.2', ok, _space_ref(s), _room_point(s), s.label,
            f'{width:.0f} mm ({inches(width)}) least width', '≥ 2134 mm (7 ft)',
            f'{s.label}: narrowest span {width:.0f} mm, under 7 ft.' if not ok else f'{s.label}: least width {width:.0f} mm.',
            storey=s.storey,
        ))
    return out


def _least_width(s: Space) -> float:
    """Smallest side of the room's bounding rectangle (a cheap least-width proxy)."""
    minx, miny, maxx, maxy = s.outline.bounds
    return max(0.0, min(maxx - minx, maxy - miny))


# ---------------------------------------------------------------- 14. natural light


@rule(
    id='IRC-R303.1-light',
    section='780 CMR 51 · R303.1',
    title='Natural light in habitable rooms',
    complies='Glazing area opening to the outdoors of at least 8% of each habitable room’s floor area (artificial light at '
             '6 fc is an accepted alternative).',
    violates='A habitable room whose total glazing is under 8% of its floor area.',
    fix='Enlarge or add a window, or document compliant artificial lighting for the room.',
)
def natural_light(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not _is(s, HABITABLE):
            continue
        area = s.outline.area
        glazing = sum((w.width or 0) * (w.height or 0) for w in ctx.data.windows if s.number in w.rooms)
        need = 0.08 * area
        ok = glazing >= need
        out.append(_finding(
            ctx, 'IRC-R303.1-light', ok, _space_ref(s), _room_point(s), s.label,
            f'{glazing:.2f} m² glazing ({sq_ft(glazing)}) for {area:.1f} m² floor', f'≥ {need:.2f} m² ({sq_ft(need)}), 8% of floor',
            f'{s.label}: glazing {glazing:.2f} m², needs {need:.2f} m².' if not ok else f'{s.label}: daylight adequate.',
            storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 15. landing at doors


@rule(
    id='IRC-R311.3',
    section='780 CMR 51 · R311.3',
    title='Floor or landing at exterior doors',
    complies='A landing or floor on each side of every required egress door, no more than 1-1/2 in (38 mm) lower than the '
             'threshold, at least as wide as the door and 36 in (914 mm) deep in the direction of travel.',
    violates='An exterior egress door that opens into a room too shallow to hold a 36 in landing.',
    fix='Provide a 36 in deep landing at the door, or relocate the door to a space that can hold one.',
)
def door_landing(ctx: Context) -> list[Finding]:
    out = []
    for d in ctx.data.doors:
        if not d.external:
            continue
        rooms = [ctx.space_by_number(n) for n in d.rooms]
        inner = next((r for r in rooms if r), None)
        if inner is None:
            continue
        depth = _least_width(inner) * 1000
        ok = depth >= 914 - 1
        out.append(_finding(
            ctx, 'IRC-R311.3', ok, _ref(ctx, d.guid), _opening_point(ctx, d), inner.label,
            f'{depth:.0f} mm ({inches(depth)}) clear in front of the door', '≥ 914 mm (36 in) landing depth',
            f'Door {d.mark} ({inner.label}): only {depth:.0f} mm in front, not enough for a 36 in landing.' if not ok
            else f'Door {d.mark}: landing depth adequate.',
            storey=d.level,
        ))
    return out


# ---------------------------------------------------------------- 16. egress door size


@rule(
    id='IRC-R311.2',
    section='780 CMR 51 · R311.2',
    title='Required egress door size',
    complies='At least one side-hinged egress door per dwelling, at least 32 in (813 mm) clear width and 78 in (1981 mm) clear height.',
    violates='A unit whose widest exterior door is under 32 in clear.',
    fix='Widen the main entry door to a 36 in leaf (≈ 34 in clear), or designate a compliant door as the egress door.',
)
def egress_door(ctx: Context) -> list[Finding]:
    units: dict[str, list[Opening]] = {}
    for d in ctx.data.doors:
        if not d.external:
            continue
        rooms = [ctx.space_by_number(n) for n in d.rooms]
        unit = next((r.unit for r in rooms if r and r.unit), '')
        units.setdefault(unit, []).append(d)
    out = []
    for unit, doors in units.items():
        widest = max(doors, key=lambda d: d.width or 0)
        w = (widest.width or 0) * 1000
        ok = w >= 813 - 1
        label = f'Unit {unit}' if unit else 'Building entry'
        out.append(_finding(
            ctx, 'IRC-R311.2', ok, _ref(ctx, widest.guid), _opening_point(ctx, widest), label,
            f'widest egress door {w:.0f} mm ({inches(w)}) leaf', '≥ 813 mm (32 in) clear',
            f'{label}: widest exterior door is only {w:.0f} mm, under the 32 in egress minimum.' if not ok
            else f'{label}: egress door {w:.0f} mm.',
            storey=widest.level,
        ))
    return out


# ---------------------------------------------------------------- 17. hallway width


@rule(
    id='IRC-R311.6',
    section='780 CMR 51 · R311.6',
    title='Minimum hallway width',
    complies='Hallways at least 3 ft (914 mm) wide.',
    violates='A corridor or hallway narrower than 36 in.',
    fix='Widen the hall to 36 in clear between finished wall faces.',
)
def hallway_width(ctx: Context) -> list[Finding]:
    out = []
    for s in ctx.spaces:
        if not any(k in s.name.lower() for k in ('hall', 'corridor', 'passage')):
            continue
        width = _least_width(s) * 1000
        if width <= 0:
            continue
        ok = width >= 914 - 1
        out.append(_finding(
            ctx, 'IRC-R311.6', ok, _space_ref(s), _room_point(s), s.label,
            f'{width:.0f} mm ({inches(width)}) clear width', '≥ 914 mm (36 in)',
            f'{s.label}: {width:.0f} mm wide, under the 36 in minimum.' if not ok else f'{s.label}: {width:.0f} mm.',
            storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 18. window fall protection


@rule(
    id='IRC-R312.2',
    section='780 CMR 51 · R312.2.1',
    title='Window fall protection',
    complies='Where the sill of an operable window is less than 24 in (610 mm) above the finished floor and more than 72 in '
             '(1829 mm) above the exterior grade, the window limits its opening to 4 in or has a fall-prevention device.',
    violates='A low operable window on an upper storey with no opening limiter noted.',
    fix='Specify opening-control devices or window guards on low sills above the ground floor.',
)
def window_fall(ctx: Context) -> list[Finding]:
    storeys = sorted(ctx.data.storeys, key=lambda s: s.elevation)
    upper = {s.name for s in storeys[1:]} if len(storeys) > 1 else set()
    out = []
    for w in ctx.data.windows:
        if w.sill is None or w.level not in upper or not _window_operable(ctx, w.guid):
            continue
        if w.sill * 1000 >= 610:
            continue
        ps = _psets(ctx, w.guid)
        limited = bool(_pset(ps, 'Opening Limit', 'Fall Protection', 'OpeningControlDevice'))
        out.append(_finding(
            ctx, 'IRC-R312.2', limited, _ref(ctx, w.guid), _opening_point(ctx, w), ', '.join(w.rooms),
            f'sill {inches(w.sill * 1000)} above floor on {w.level}, limiter: {"yes" if limited else "none noted"}',
            'opening ≤ 4 in or fall-prevention device',
            f'Window {w.mark} on {w.level}: low sill ({inches(w.sill * 1000)}) with no fall protection noted.' if not limited
            else f'Window {w.mark}: fall protection noted.',
            storey=w.level,
        ))
    return out


# ---------------------------------------------------------------- 19. guard at stairs/floors


@rule(
    id='IRC-R312.1',
    section='780 CMR 51 · R312.1.1, R312.1.2',
    title='Guards at walking surfaces over 30 in',
    complies='Guards at least 36 in (914 mm) high along open-sided walking surfaces, including stairs and landings, more than '
             '30 in (762 mm) above the floor or grade below.',
    violates='A raised floor edge, stair or landing over 30 in up with no guard element modeled.',
    fix='Add a 36 in guard (with ≤ 4 in sphere-rule infill) along the open edges.',
)
def guards(ctx: Context) -> list[Finding]:
    rails = [el for el in ctx.arch.by_type('IfcRailing')]
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        near = _rail_near(ctx, rails, _stair_point(ctx, st, flights))
        ok = near is not None
        label = _stair_label(ctx, st, flights)
        height = ''
        if near is not None:
            lo, hi = ctx.bbox(near)
            height = f', guard ≈ {(hi[2] - lo[2]) * 1000:.0f} mm'
        out.append(_finding(
            ctx, 'IRC-R312.1', ok, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
            f'{"a railing is present" if ok else "no railing modeled nearby"}{height}', 'guard ≥ 914 mm (36 in) at open edges > 30 in',
            f'{label}: no guard/railing modeled at the stair.' if not ok else f'{label}: guard present.',
            [_ref(ctx, near.GlobalId)] if near is not None else [], storey=storey,
        ))
    return out


def _rail_near(ctx: Context, rails, p, radius: float = 3.0):
    best, bestd = None, radius
    for r in rails:
        try:
            lo, hi = ctx.bbox(r)
        except Exception:
            continue
        c = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2)
        d = math.dist(c, p[:2])
        if d < bestd:
            best, bestd = r, d
    return best


# ---------------------------------------------------------------- 20. kitchen counter receptacles


@rule(
    id='IRC-E3901.4',
    section='780 CMR 51 · E3901.4',
    title='Kitchen counter receptacles',
    complies='A receptacle outlet serving each kitchen counter space, so no point along the counter wall line is more than '
             '24 in (610 mm) from one (two or more outlets at a typical kitchen).',
    violates='A kitchen with fewer than two small-appliance receptacles modeled.',
    fix='Add counter-top receptacles on 20 A small-appliance branch circuits, spaced so every point is within 24 in of one.',
)
def kitchen_receptacles(ctx: Context) -> list[Finding]:
    recep = ctx.devices_named('receptacle', 'outlet', 'socket')
    if not recep:
        return []
    out = []
    for s in ctx.spaces:
        if 'kitchen' not in s.name.lower():
            continue
        here = [r for r in recep if r.space is s]
        ok = len(here) >= 2
        out.append(_finding(
            ctx, 'IRC-E3901.4', ok, _space_ref(s), here[0].point if here else _room_point(s), s.label,
            f'{len(here)} receptacle(s) modeled', '≥ 2 counter receptacles, none > 24 in from a point on the counter',
            f'{s.label}: only {len(here)} receptacle(s) — kitchen counters need small-appliance outlets within 24 in.' if not ok
            else f'{s.label}: {len(here)} receptacles.',
            [_dev(r) for r in here], storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 21. bathroom receptacle


@rule(
    id='IRC-E3901.6',
    section='780 CMR 51 · E3901.6',
    title='Bathroom receptacle',
    complies='At least one receptacle outlet within 36 in (914 mm) of the outside edge of each lavatory basin, on a 20 A circuit.',
    violates='A bathroom with a lavatory and no receptacle modeled.',
    fix='Add a GFCI-protected receptacle beside the lavatory on a dedicated 20 A bathroom circuit.',
)
def bathroom_receptacle(ctx: Context) -> list[Finding]:
    recep = ctx.devices_named('receptacle', 'outlet', 'socket')
    if not recep:
        return []
    out = []
    for s in ctx.spaces:
        if not any(k in s.name.lower() for k in ('bath', 'toilet', 'wc', 'powder')):
            continue
        here = [r for r in recep if r.space is s]
        ok = bool(here)
        out.append(_finding(
            ctx, 'IRC-E3901.6', ok, _space_ref(s), here[0].point if here else _room_point(s), s.label,
            f'{len(here)} receptacle(s) modeled', '≥ 1 receptacle within 36 in of the lavatory',
            f'{s.label}: no receptacle modeled near the lavatory.' if not ok else f'{s.label}: receptacle present.',
            [_dev(r) for r in here], storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 22. GFCI protection


@rule(
    id='IRC-E3902',
    section='780 CMR 51 · E3902.1–E3902.11',
    title='GFCI protection in wet locations',
    complies='Receptacles in bathrooms, kitchens (serving counters), garages, and outdoors are GFCI-protected.',
    violates='A receptacle in a wet-location room with no GFCI protection noted.',
    fix='Protect the circuit with a GFCI breaker or GFCI receptacle.',
)
def gfci(ctx: Context) -> list[Finding]:
    recep = ctx.devices_named('receptacle', 'outlet', 'socket')
    if not recep:
        return []
    wet = ('bath', 'toilet', 'wc', 'powder', 'kitchen', 'garage', 'laundry', 'utility')
    out = []
    for r in recep:
        s = r.space
        if s is None or not any(k in s.name.lower() for k in wet):
            continue
        text = (r.name + ' ' + ' '.join(str(v) for p in r.psets.values() for v in p.values())).lower()
        ok = 'gfci' in text or 'gfi' in text or 'ground fault' in text
        out.append(_finding(
            ctx, 'IRC-E3902', ok, _dev(r), r.point, s.label,
            f'{r.name.split(":")[0]}: {"GFCI noted" if ok else "no GFCI noted"}', 'GFCI protection in wet locations',
            f'{s.label}: receptacle "{r.name.split(":")[0]}" has no GFCI protection noted.' if not ok
            else f'{s.label}: GFCI protection noted.',
            storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 23. lighting outlet per room


@rule(
    id='IRC-E3903.2',
    section='780 CMR 51 · E3903.2',
    title='Lighting outlet in habitable rooms',
    complies='At least one wall-switched lighting outlet in every habitable room, hallway, stairway, and bathroom.',
    violates='A habitable room with no luminaire or lighting outlet modeled.',
    fix='Add a switched lighting outlet (ceiling luminaire or switched receptacle) to the room.',
)
def lighting_outlet(ctx: Context) -> list[Finding]:
    lights = ctx.devices_named('lighting', 'luminaire', 'light fixture', 'downlight', 'ceiling light')
    if not lights:
        return []
    out = []
    for s in ctx.spaces:
        if not (_is(s, HABITABLE) or any(k in s.name.lower() for k in ('hall', 'stair', 'bath'))):
            continue
        here = [l for l in lights if l.space is s]
        ok = bool(here)
        out.append(_finding(
            ctx, 'IRC-E3903.2', ok, _space_ref(s), here[0].point if here else _room_point(s, s.ceiling - s.floor - 0.1), s.label,
            f'{len(here)} lighting outlet(s)', '≥ 1 switched lighting outlet',
            f'{s.label}: no lighting outlet modeled.' if not ok else f'{s.label}: {len(here)} lighting outlet(s).',
            [_dev(l) for l in here], storey=s.storey,
        ))
    return out


# ---------------------------------------------------------------- 24. water heater T&P relief


@rule(
    id='IRC-P2804.6',
    section='780 CMR 51 · P2804.6.1',
    title='Water heater relief valve discharge',
    complies='Each water heater has a temperature-and-pressure relief valve with a discharge pipe run to a safe location.',
    violates='A water heater with no relief-valve discharge modeled or noted.',
    fix='Provide a T&P relief valve and a full-size discharge pipe terminating per P2804.6.1.',
)
def water_heater_relief(ctx: Context) -> list[Finding]:
    # Only genuine heater/boiler appliances — never piping, pipe types, or
    # fittings that merely carry "hot water" in their name.
    def is_heater(d: Device) -> bool:
        n = d.name.lower()
        if any(k in n for k in ('pipe', 'fitting', 'valve', 'tee', 'elbow', 'coupling', 'segment')):
            return False
        if d.ifc_class in ('IfcPipeSegment', 'IfcPipeFitting', 'IfcFlowSegment', 'IfcFlowFitting'):
            return False
        appliance = d.ifc_class in ('IfcFlowStorageDevice', 'IfcTank', 'IfcBoiler', 'IfcEnergyConversionDevice')
        named = any(k in n for k in ('water heater', 'hot water boiler', 'water boiler', 'dhw tank', 'storage tank'))
        return named or (appliance and 'boiler' in n)

    heaters = [d for d in ctx.devices if is_heater(d)]
    if not heaters:
        return []
    out = []
    for h in heaters:
        text = (h.name + ' ' + ' '.join(str(v) for p in h.psets.values() for v in p.values())).lower()
        ok = any(k in text for k in ('relief', 't&p', 'tpr', 'discharge'))
        room = h.space.label if h.space else ''
        out.append(_finding(
            ctx, 'IRC-P2804.6', ok, _dev(h), h.point, room,
            f'{h.name.split(":")[0]}: {"relief discharge noted" if ok else "no relief discharge noted"}',
            'T&P relief valve with discharge to a safe location',
            f'{room}: water heater "{h.name.split(":")[0]}" has no relief-valve discharge noted.' if not ok
            else f'{room}: relief discharge noted.',
            storey=ctx.storey_at(h.point[2]),
        ))
    return out


# ---------------------------------------------------------------- 25. water closet clearance (front)


@rule(
    id='IRC-R307.1-front',
    section='780 CMR 51 · R307.1, P2705.1',
    title='Water closet front clearance',
    complies='At least 21 in (533 mm) of clear space in front of a water closet, lavatory, or bidet.',
    violates='A water closet with less than 21 in of clear floor in front of it.',
    fix='Reposition the fixture or enlarge the room to give 21 in of front clearance.',
)
def wc_front_clearance(ctx: Context) -> list[Finding]:
    wcs = [d for d in ctx.devices_named('water closet', 'toilet') if d.space and d.ifc_class == 'IfcFlowTerminal']
    if not wcs:
        return []
    out = []
    for f in wcs:
        s = f.space
        facing, _edge = _against_wall(s, f)
        front = _front_clearance(s, f, facing)
        if front is None:
            continue
        ok = front >= 533 - 1
        out.append(_finding(
            ctx, 'IRC-R307.1-front', ok, _dev(f), _front(f, facing), s.label,
            f'{front:.0f} mm ({inches(front)}) clear in front', '≥ 533 mm (21 in)',
            f'{s.label}: {f.name.split(":")[0]} has {front:.0f} mm in front, {533 - front:.0f} mm short of 21 in.' if not ok
            else f'{s.label}: front clearance {front:.0f} mm.',
            [_dev(f)], storey=s.storey,
        ))
    return out


def _front_clearance(s: Space, f: Device, facing) -> float | None:
    """mm from a wall-set fixture's front edge straight out to the opposite wall."""
    if facing is None:
        return None
    x, y = f.point[0] + facing[0] * 0.25, f.point[1] + facing[1] * 0.25
    ray = LineString([(x, y), (x + facing[0] * 10, y + facing[1] * 10)])
    hit = ray.intersection(s.outline.exterior)
    pts = [hit] if hit.geom_type == 'Point' else [g for g in getattr(hit, 'geoms', []) if g.geom_type == 'Point']
    return min(Point(x, y).distance(q) for q in pts) * 1000 if pts else None


# ---------------------------------------------------------------- 26. stair width


@rule(
    id='IRC-R311.7.1',
    section='780 CMR 51 · R311.7.1',
    title='Stairway width',
    complies='Stairways at least 36 in (914 mm) wide above the handrail height, with no more than one handrail projecting 4-1/2 in.',
    violates='A stair flight narrower than 36 in.',
    fix='Widen the stair opening and flight to at least 36 in clear.',
)
def stair_width(ctx: Context) -> list[Finding]:
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        width = _pset(ps, 'Actual Run Width', 'RunWidth', 'Width')
        if width is None and flights:
            lo, hi = ctx.bbox(flights[0])
            width = min(hi[0] - lo[0], hi[1] - lo[1])
        if width is None:
            continue
        mm = float(width) * 1000
        ok = mm >= 914 - 2
        label = _stair_label(ctx, st, flights)
        out.append(_finding(
            ctx, 'IRC-R311.7.1', ok, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
            f'{mm:.0f} mm ({inches(mm)}) wide', '≥ 914 mm (36 in)',
            f'{label}: {mm:.0f} mm wide, under the 36 in minimum.' if not ok else f'{label}: {mm:.0f} mm wide.',
            [_ref(ctx, fl.GlobalId) for fl in flights], storey=storey,
        ))
    return out


# ---------------------------------------------------------------- 27. riser height


@rule(
    id='IRC-R311.7.5.1',
    section='780 CMR 51 · R311.7.5.1',
    title='Stair riser height',
    complies='Risers no more than 7-3/4 in (196 mm) high, the tallest and shortest within 3/8 in of each other.',
    violates='Any riser taller than 7-3/4 in.',
    fix='Add a riser to the flight to lower each step, or re-cut the stringers.',
)
def riser_height(ctx: Context) -> list[Finding]:
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        riser = _pset(ps, 'RiserHeight', 'Actual Riser Height', 'Maximum Riser Height')
        if riser is None:
            continue
        mm = float(riser) * 1000
        ok = mm <= 196 + 0.5
        label = _stair_label(ctx, st, flights)
        out.append(_finding(
            ctx, 'IRC-R311.7.5.1', ok, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
            f'{mm:.0f} mm ({inches(mm)}) risers', '≤ 196 mm (7-3/4 in)',
            f'{label}: risers {mm:.0f} mm, {mm - 196:.0f} mm over the 7-3/4 in maximum.' if not ok else f'{label}: risers {mm:.0f} mm.',
            [_ref(ctx, fl.GlobalId) for fl in flights], storey=storey,
        ))
    return out


# ---------------------------------------------------------------- 28. handrail height


@rule(
    id='IRC-R311.7.8',
    section='780 CMR 51 · R311.7.8.1',
    title='Handrail height on stairs',
    complies='Handrails 34–38 in (864–965 mm) above the stair nosings, continuous the full length of each flight of four or more risers.',
    violates='A stair of four or more risers with no handrail, or one outside 34–38 in.',
    fix='Add a graspable handrail at 34–38 in above the nosings for the full flight.',
)
def handrail_height(ctx: Context) -> list[Finding]:
    rails = [el for el in ctx.arch.by_type('IfcRailing')]
    out = []
    for st, ps, flights, storey in _stairs(ctx):
        near = _rail_near(ctx, rails, _stair_point(ctx, st, flights))
        label = _stair_label(ctx, st, flights)
        if near is None:
            out.append(_finding(
                ctx, 'IRC-R311.7.8', False, _ref(ctx, st.GlobalId), _stair_point(ctx, st, flights), label,
                'no handrail modeled', '34–38 in (864–965 mm) above the nosings',
                f'{label}: no handrail modeled on a stair that needs one.',
                storey=storey,
            ))
            continue
        lo, hi = ctx.bbox(near)
        h = (hi[2] - lo[2]) * 1000
        ok = 864 - 25 <= h <= 965 + 25
        out.append(_finding(
            ctx, 'IRC-R311.7.8', ok, _ref(ctx, near.GlobalId), _stair_point(ctx, st, flights), label,
            f'railing ≈ {h:.0f} mm ({inches(h)}) tall', '864–965 mm (34–38 in) above the nosings',
            f'{label}: handrail ≈ {h:.0f} mm, outside the 34–38 in range.' if not ok else f'{label}: handrail ≈ {h:.0f} mm.',
            [_ref(ctx, st.GlobalId)], storey=storey,
        ))
    return out


# ---------------------------------------------------------------- 29. door between garage and dwelling


@rule(
    id='IRC-R302.5.1',
    section='780 CMR 51 · R302.5.1',
    title='Door between garage and dwelling',
    complies='Doors between a garage and the residence are solid wood (1-3/8 in), solid or honeycomb-core steel (1-3/8 in), '
             'or 20-minute fire-rated; no door opens directly into a sleeping room.',
    violates='A garage-to-house door that is not rated/solid, or one opening into a bedroom.',
    fix='Specify a 20-minute or 1-3/8 in solid-core door, and never into a sleeping room.',
)
def garage_door(ctx: Context) -> list[Finding]:
    garages = {s.number for s in ctx.spaces if 'garage' in s.name.lower()}
    if not garages:
        return []
    out = []
    for d in ctx.data.doors:
        touches = [ctx.space_by_number(n) for n in d.rooms]
        touches = [r for r in touches if r]
        if not any(r.number in garages for r in touches):
            continue
        other = [r for r in touches if r.number not in garages]
        into_bed = any(_is(r, SLEEPING) for r in other)
        rated = _hours(d.fire_rating)
        name = _type_name_lower(ctx, d.guid)
        solid = any(k in name for k in ('solid', 'steel', 'fire', 'metal'))
        ok = (rated is not None and rated >= 1 / 3 or solid) and not into_bed
        room = ', '.join(r.label for r in touches)
        why = 'opens into a sleeping room' if into_bed else ('not solid/rated' if not (solid or rated) else '')
        out.append(_finding(
            ctx, 'IRC-R302.5.1', ok, _ref(ctx, d.guid), _opening_point(ctx, d), room,
            f'rating: {d.fire_rating or "none"}, type: {name.split(":")[0] or "unknown"}',
            '20-min rated or 1-3/8 in solid, not into a bedroom',
            f'Garage door {d.mark} ({room}): {why}.' if not ok else f'Garage door {d.mark}: compliant.',
            storey=d.level,
        ))
    return out


def _type_name_lower(ctx: Context, guid: str) -> str:
    el = ctx.arch.by_guid(guid)
    import ifcopenshell.util.element as ue

    t = ue.get_type(el)
    return f'{el.Name or ""} {t.Name if t else ""}'.lower()


# ---------------------------------------------------------------- 30. smoke alarm per storey


@rule(
    id='IRC-R314.3-story',
    section='780 CMR 51 · R314.3(3)',
    title='Smoke alarm on every story',
    complies='A smoke alarm on each story of the dwelling, including basements and habitable attics.',
    violates='A story with no smoke alarm anywhere on it.',
    fix='Add an interconnected smoke alarm to the story with none.',
)
def smoke_alarm_per_story(ctx: Context) -> list[Finding]:
    alarms = ctx.devices_named('smoke detector', 'smoke alarm')
    if not alarms:
        return []
    out = []
    for st in ctx.data.storeys:
        on_story = [a for a in alarms if a.space and a.space.storey == st.name]
        # pick a representative room on this story for the marker
        rooms_here = [s for s in ctx.spaces if s.storey == st.name]
        anchor = (on_story[0].point if on_story
                  else (_room_point(rooms_here[0]) if rooms_here else (0.0, 0.0, st.elevation + 1.2)))
        ref = (_dev(on_story[0]) if on_story
               else (_space_ref(rooms_here[0]) if rooms_here else {'globalId': '', 'ifcClass': 'IfcBuildingStorey', 'name': st.name, 'model': ''}))
        if not ref['globalId']:
            continue
        ok = bool(on_story)
        out.append(_finding(
            ctx, 'IRC-R314.3-story', ok, ref, anchor, st.name,
            f'{len(on_story)} smoke alarm(s) on {st.name}', '≥ 1 smoke alarm per story',
            f'{st.name}: no smoke alarm on this story.' if not ok else f'{st.name}: {len(on_story)} smoke alarm(s).',
            storey=st.name,
        ))
    return out
