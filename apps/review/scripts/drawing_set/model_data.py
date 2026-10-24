"""Everything the drawing set reads from an IFC model, in one plain structure.

Values come from the model's own property sets (Revit's IFC export for the
duplex and clinic). Revit writes unfilled parameters as their own name
("Fire Rating" = "Fire Rating"); those are treated as empty.
"""

from __future__ import annotations

import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.element as ue
import ifcopenshell.util.placement as up
import numpy as np


@dataclass
class Storey:
    name: str
    elevation: float  # metres
    height: float | None  # floor to floor, metres; None for the top storey


@dataclass
class Room:
    guid: str
    number: str
    name: str
    level: str
    area: float | None
    perimeter: float | None
    height: float | None
    volume: float | None
    category: str
    occupancy_zone: str
    fire_zone: str


@dataclass
class Opening:
    """A door or a window."""

    kind: str  # 'door' | 'window'
    guid: str
    mark: str
    level: str
    type_name: str
    type_mark: str
    width: float | None
    height: float | None
    thickness: float | None = None
    sill: float | None = None
    head: float | None = None
    operation: str = ''
    external: bool | None = None
    fire_rating: str = ''
    rooms: list[str] = field(default_factory=list)  # room numbers on either side
    center: tuple[float, float] | None = None  # plan position, metres
    normal: tuple[float, float] | None = None  # unit vector across the wall


@dataclass
class BuildingData:
    project: str
    file_name: str
    schema: str
    authoring: str
    exported: str
    true_north: tuple[float, float] | None
    storeys: list[Storey]
    rooms: list[Room]
    doors: list[Opening]
    windows: list[Opening]
    generated_marks: tuple[str, ...] = ()

    def rooms_on(self, level: str) -> list[Room]:
        return [r for r in self.rooms if r.level == level]

    def openings_on(self, level: str) -> list[Opening]:
        return [o for o in [*self.doors, *self.windows] if o.level == level]


def _norm(s: str) -> str:
    return re.sub(r'[^a-z0-9]', '', s.lower())


def _clean(key: str, value):
    """Drop Revit's placeholder values (a parameter whose value is its own name)."""
    if value is None:
        return None
    if isinstance(value, str):
        v = value.strip()
        if not v or _norm(v) == _norm(key):
            return None
        return v
    return value


def _prop(psets: dict, *names: str, sets: tuple[str, ...] | None = None):
    for set_name, props in psets.items():
        if sets and set_name not in sets:
            continue
        for name in names:
            if name in props:
                value = _clean(name, props[name])
                if value is not None:
                    return value
    return None


def _num(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _type_name(element) -> str:
    t = ue.get_type(element)
    if t is not None and t.Name:
        return t.Name
    # Revit names instances "Family:Type:Type:ElementId".
    parts = (element.Name or '').split(':')
    return ':'.join(parts[:2]) if len(parts) > 2 else (element.Name or '')


def _storey_name(element) -> str:
    container = ue.get_container(element)
    while container is not None and not container.is_a('IfcBuildingStorey'):
        container = ue.get_aggregate(container)
    return (container.Name or '') if container is not None else ''


def _centres(model, elements) -> dict[str, tuple[float, float]]:
    """Plan centre of each element's body, from its world-coordinate geometry."""
    settings = ifcopenshell.geom.settings()
    settings.set('use-world-coords', True)
    out: dict[str, tuple[float, float]] = {}
    for el in elements:
        try:
            shape = ifcopenshell.geom.create_shape(settings, el)
        except Exception:
            continue
        verts = np.array(shape.geometry.verts).reshape(-1, 3)
        if len(verts):
            lo, hi = verts.min(axis=0), verts.max(axis=0)
            out[el.GlobalId] = (float((lo[0] + hi[0]) / 2), float((lo[1] + hi[1]) / 2))
    return out


def _normal(element) -> tuple[float, float] | None:
    """The opening's local Y axis in plan: across the host wall."""
    if element.ObjectPlacement is None:
        return None
    m = up.get_local_placement(element.ObjectPlacement)
    y = m[:2, 1]
    n = float(np.hypot(*y))
    return (float(y[0] / n), float(y[1] / n)) if n > 1e-9 else None


def load(path: Path) -> BuildingData:
    model = ifcopenshell.open(str(path))

    storeys_raw = sorted(
        ((s.Name or '', float(s.Elevation or 0.0)) for s in model.by_type('IfcBuildingStorey')),
        key=lambda s: s[1],
    )
    storeys = [
        Storey(name, elev, (storeys_raw[i + 1][1] - elev) if i + 1 < len(storeys_raw) else None)
        for i, (name, elev) in enumerate(storeys_raw)
    ]

    rooms: list[Room] = []
    space_number: dict[int, str] = {}
    for sp in model.by_type('IfcSpace'):
        ps = ue.get_psets(sp)
        number = _prop(ps, 'Number') or sp.Name or ''
        space_number[sp.id()] = number
        rooms.append(
            Room(
                guid=sp.GlobalId,
                number=number,
                name=_prop(ps, 'Name', sets=('PSet_Revit_Identity Data',)) or sp.LongName or '',
                level=_storey_name(sp) or _prop(ps, 'Level') or '',
                area=_num(_prop(ps, 'Area', sets=('PSet_Revit_Dimensions',))) or _num(_prop(ps, 'GSA BIM Area')),
                perimeter=_num(_prop(ps, 'Perimeter')),
                height=_num(_prop(ps, 'Unbounded Height')),
                volume=_num(_prop(ps, 'Volume')),
                category=_prop(ps, 'Category Description') or _prop(ps, 'OmniClass Table 13 Category') or '',
                occupancy_zone=_prop(ps, 'OccupancyZoneName') or '',
                fire_zone=_prop(ps, 'FireAlarmZoneName') or '',
            )
        )
    rooms.sort(key=lambda r: (r.level, r.number))

    # Rooms on each side of a door or window, from the model's space boundaries.
    sides: dict[str, set[str]] = defaultdict(set)
    for rel in model.by_type('IfcRelSpaceBoundary'):
        el = rel.RelatedBuildingElement
        if el is not None and el.is_a() in ('IfcDoor', 'IfcWindow') and rel.RelatingSpace is not None:
            sides[el.GlobalId].add(space_number.get(rel.RelatingSpace.id(), rel.RelatingSpace.Name or ''))

    door_els = model.by_type('IfcDoor')
    window_els = model.by_type('IfcWindow')
    centres = _centres(model, [*door_els, *window_els])

    def opening(el, kind: str) -> Opening:
        ps = ue.get_psets(el)
        t = ue.get_type(el)
        common = 'Pset_DoorCommon' if kind == 'door' else 'Pset_WindowCommon'
        external = _prop(ps, 'IsExternal', sets=(common,))
        operation = ''
        if t is not None and hasattr(t, 'OperationType') and t.OperationType not in (None, 'NOTDEFINED'):
            operation = t.OperationType.replace('_', ' ').lower()
        sill = _num(_prop(ps, 'Sill Height', sets=('PSet_Revit_Constraints',)))
        height = _num(getattr(el, 'OverallHeight', None)) or _num(_prop(ps, 'Height', sets=('PSet_Revit_Type_Dimensions',)))
        return Opening(
            kind=kind,
            guid=el.GlobalId,
            mark=str(_prop(ps, 'Mark') or el.Tag or ''),
            level=_storey_name(el) or _prop(ps, 'Level') or '',
            type_name=_type_name(el),
            type_mark=str(_prop(ps, 'Type Mark') or ''),
            width=_num(getattr(el, 'OverallWidth', None)) or _num(_prop(ps, 'Width', sets=('PSet_Revit_Type_Dimensions',))),
            height=height,
            thickness=_num(_prop(ps, 'Thickness', sets=('PSet_Revit_Type_Dimensions',))),
            sill=sill,
            head=_num(_prop(ps, 'Head Height')) or ((sill or 0) + height if height else None),
            operation=operation,
            external=external if isinstance(external, bool) else None,
            fire_rating=str(_prop(ps, 'FireRating', 'Fire Rating') or ''),
            rooms=sorted(sides.get(el.GlobalId, set())),
            center=centres.get(el.GlobalId),
            normal=_normal(el),
        )

    doors = sorted((opening(d, 'door') for d in door_els), key=lambda o: (o.level, o.mark))
    windows = sorted((opening(w, 'window') for w in window_els), key=lambda o: (o.level, o.mark))
    level_order = {s.name: i for i, s in enumerate(storeys)}
    generated = tuple(
        kind
        for kind, items, prefix in (('door', doors, 'D'), ('window', windows, 'W'))
        if _renumber(items, prefix, level_order)
    )

    north = None
    for ctx in model.by_type('IfcGeometricRepresentationContext'):
        if getattr(ctx, 'TrueNorth', None) is not None:
            r = ctx.TrueNorth.DirectionRatios
            north = (float(r[0]), float(r[1]))
            break

    projects = model.by_type('IfcProject')
    header = model.header.file_name
    return BuildingData(
        project=(projects[0].LongName or projects[0].Name or '') if projects else '',
        file_name=path.name,
        schema=model.schema,
        authoring=' '.join(s for s in (header.originating_system, header.preprocessor_version) if s),
        exported=(header.time_stamp or '')[:10],
        true_north=north,
        storeys=storeys,
        generated_marks=generated,
        rooms=rooms,
        doors=doors,
        windows=windows,
    )


def _renumber(items: list[Opening], prefix: str, level_order: dict[str, int]) -> bool:
    """Give doors or windows short sequential marks when the model's own marks
    can't be used as tags (mostly missing, or GUIDs as in ArchiCAD exports).
    Numbered by level, then in reading order on the plan."""
    usable = sum(1 for o in items if o.mark and len(o.mark) <= 8)
    if usable >= 0.9 * len(items):
        return False

    def key(o: Opening):
        x, y = (o.center or (0.0, 0.0, 0.0))[:2]
        return (level_order.get(o.level, len(level_order)), -round(y, 1), round(x, 1))

    items.sort(key=key)
    for i, o in enumerate(items, 1):
        o.mark = f'{prefix}{i:03d}'
    return True
