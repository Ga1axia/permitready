"""What the rules read: the architectural model the app opens, the other
discipline models published with it, rooms with their outlines, devices placed
in rooms, and the drawing-set sheets a point can be pinned to."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.element as ue
import ifcopenshell.util.placement as up
import ifcopenshell.util.unit as uu
import numpy as np
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union

from drawing_set import model_data

MM_PER_IN = 25.4


def inches(mm: float) -> str:
    return f'{mm / MM_PER_IN:.2f} in'.replace('.00 in', ' in')


def sq_ft(m2: float) -> str:
    return f'{m2 * 10.7639:.1f} sq ft'


@dataclass
class Space:
    guid: str
    number: str
    name: str
    storey: str
    outline: Polygon  # plan outline, model metres
    floor: float  # z of the floor, metres
    ceiling: float

    @property
    def label(self) -> str:
        return f'{self.number} {self.name}'.strip()

    @property
    def unit(self) -> str:
        """Dwelling unit, from the room number prefix (A101 → A)."""
        m = re.match(r'([A-Za-z]+)\d', self.number)
        return m.group(1).upper() if m else ''

    def contains(self, p: tuple[float, float, float], tol: float = 0.05) -> bool:
        return self.floor - 0.1 <= p[2] <= self.ceiling + 0.1 and self.outline.buffer(tol).contains(Point(p[0], p[1]))


@dataclass
class Device:
    """An element from any discipline model, with where it sits."""

    guid: str
    model: str
    ifc_class: str
    name: str
    point: tuple[float, float, float]
    psets: dict
    x_axis: tuple[float, float]  # the element's local X direction in plan
    space: Space | None = None


@dataclass
class Context:
    building: str
    arch_path: Path
    arch: ifcopenshell.file
    data: model_data.BuildingData
    spaces: list[Space]
    devices: list[Device]  # every distribution element in every model
    sheets: list[dict] = field(default_factory=list)  # plan sheets from drawings/index.json
    _bbox: dict[str, tuple[np.ndarray, np.ndarray]] = field(default_factory=dict)

    # ------------------------------------------------------------ lookups

    def space(self, guid: str) -> Space | None:
        return next((s for s in self.spaces if s.guid == guid), None)

    def space_by_number(self, number: str) -> Space | None:
        return next((s for s in self.spaces if s.number == number), None)

    def space_at(self, p: tuple[float, float, float]) -> Space | None:
        hits = [s for s in self.spaces if s.contains(p)]
        return min(hits, key=lambda s: s.outline.area) if hits else None

    def devices_named(self, *words: str) -> list[Device]:
        low = [w.lower() for w in words]
        return [d for d in self.devices if any(w in d.name.lower() for w in low)]

    def bbox(self, element) -> tuple[np.ndarray, np.ndarray]:
        """World-space bounding box of an element's geometry."""
        if element.GlobalId not in self._bbox:
            shape = ifcopenshell.geom.create_shape(_settings(), element)
            v = np.array(shape.geometry.verts).reshape(-1, 3)
            self._bbox[element.GlobalId] = (v.min(0), v.max(0))
        return self._bbox[element.GlobalId]

    def centre(self, element) -> tuple[float, float, float]:
        lo, hi = self.bbox(element)
        return tuple(round(float(c), 3) for c in (lo + hi) / 2)

    def storey_at(self, z: float) -> str:
        storeys = sorted(self.data.storeys, key=lambda s: s.elevation)
        name = storeys[0].name if storeys else ''
        for s in storeys:
            if z >= s.elevation - 0.05:
                name = s.name
        return name

    def on_sheet(self, p: tuple[float, float, float], storey: str) -> dict | None:
        """The plan sheet showing `storey`, and where p falls on its page (0-1, top left)."""
        sheet = next((s for s in self.sheets if s.get('storey') == storey and s.get('transform')), None)
        if sheet is None:
            return None
        t = sheet['transform']
        u = (t['x0'] + t['s'] * p[0]) / t['width']
        v = (t['y0'] - t['s'] * p[1]) / t['height']
        return {'number': sheet['number'], 'page': sheet['page'], 'x': round(u, 5), 'y': round(v, 5)}


# ---------------------------------------------------------------- loading

_SETTINGS = None


def _settings():
    global _SETTINGS
    if _SETTINGS is None:
        _SETTINGS = ifcopenshell.geom.settings()
        _SETTINGS.set(_SETTINGS.USE_WORLD_COORDS, True)
    return _SETTINGS


def _outline(element) -> tuple[Polygon, float, float]:
    shape = ifcopenshell.geom.create_shape(_settings(), element)
    v = np.array(shape.geometry.verts).reshape(-1, 3)
    f = np.array(shape.geometry.faces).reshape(-1, 3)
    z0, z1 = float(v[:, 2].min()), float(v[:, 2].max())
    tris = [Polygon(v[t][:, :2]) for t in f if np.allclose(v[t][:, 2], z0, atol=0.02)]
    return unary_union([t for t in tris if t.area > 1e-6]).buffer(0), z0, z1


def _devices(path: Path, model: ifcopenshell.file) -> list[Device]:
    out = []
    scale = uu.calculate_unit_scale(model)  # discipline models may be in feet
    for el in model.by_type('IfcDistributionElement'):
        if el.ObjectPlacement is None or el.is_a('IfcDistributionPort'):
            continue
        m = up.get_local_placement(el.ObjectPlacement)
        x = m[:2, 0]
        n = float(np.hypot(*x)) or 1.0
        psets = ue.get_psets(el)
        t = ue.get_type(el)
        if t is not None:
            psets = {**ue.get_psets(t), **psets}
        out.append(
            Device(
                guid=el.GlobalId,
                model=path.name,
                ifc_class=el.is_a(),
                name=el.Name or (t.Name if t else '') or '',
                point=tuple(round(float(c) * scale, 3) for c in m[:3, 3]),
                psets=psets,
                x_axis=(float(x[0]) / n, float(x[1]) / n),
            )
        )
    return out


def _stamp(model: ifcopenshell.file) -> float:
    import datetime as dt

    try:
        return dt.datetime.fromisoformat(model.header.file_name.time_stamp[:19]).timestamp()
    except ValueError:
        return 0.0


def _kind(name: str) -> str:
    """Family and type of a Revit element name ('M_Smoke Detector:Smoke Detector:610280' → first two parts)."""
    return ':'.join(name.split(':')[:2])


def load(building: str, app_dir: Path, arch_file: str) -> Context:
    arch_path = app_dir / 'public' / 'models' / arch_file
    if not arch_path.exists():
        raise SystemExit(f'{arch_path} not found: run bun run samples')
    arch = ifcopenshell.open(str(arch_path))
    data = model_data.load(arch_path)

    rooms = {r.guid: r for r in data.rooms}
    spaces = []
    for sp in arch.by_type('IfcSpace'):
        try:
            outline, z0, z1 = _outline(sp)
        except Exception:
            continue
        r = rooms.get(sp.GlobalId)
        spaces.append(
            Space(
                guid=sp.GlobalId,
                number=r.number if r else (sp.Name or ''),
                name=r.name if r else (sp.LongName or ''),
                storey=r.level if r else '',
                outline=outline,
                floor=z0,
                ceiling=z1,
            )
        )

    # The architectural model plus every discipline model published with it
    # (bun run references). The models are revisions from different dates and
    # repeat each other's devices, sometimes moved. Each kind of device comes
    # from one model only: the one closest in date to the architectural model
    # that has that kind, so all devices belong to the same revision.
    models_dir = app_dir / 'public' / 'reference' / building / 'models'
    loaded = [(arch_path, arch)] + [(p, ifcopenshell.open(str(p))) for p in sorted(models_dir.glob('*.ifc'))]
    arch_time = _stamp(arch)
    loaded.sort(key=lambda pm: (pm[0] != arch_path, abs(_stamp(pm[1]) - arch_time)))
    devices: dict[str, Device] = {}
    owner: dict[str, str] = {}  # device kind → the model that supplies it
    for path, model in loaded:
        for d in _devices(path, model):
            kind = _kind(d.name)
            if owner.setdefault(kind, d.model) == d.model:
                devices.setdefault(d.guid, d)

    ctx = Context(building, arch_path, arch, data, spaces, list(devices.values()))
    for d in ctx.devices:
        d.space = ctx.space_at(d.point)

    index = app_dir / 'public' / 'reference' / building / 'drawings' / 'index.json'
    if index.exists():
        ctx.sheets = [s for s in json.loads(index.read_text())['sheets'] if s['kind'] == 'plan']
    return ctx
