"""Ten checks from the 2021 International Residential Code (IRC), written
against what a Revit-exported residential model carries.

Each rule lists what complies and what violates in plain terms, then reports
every element or room it examined. A finding is anchored on an element in
the architectural model (so the app can select it) and on a point (so the
3D view and the floor plan can mark the exact spot)."""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from shapely.geometry import LineString, Point

from .context import MM_PER_IN, Context, Device, Space, inches, sq_ft

CODE = '2021 International Residential Code (IRC)'


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
    section='R310.1, R310.2',
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
    section='R311.7.5.2',
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
    section='R311.7.5.3',
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
    section='R308.4.3',
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
    section='R302.3',
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
    section='R314.3',
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
    section='R315.2.1, R315.3',
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
    section='R303.1',
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
    section='R303.3, M1505',
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
    section='R307.1, P2705.1',
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
