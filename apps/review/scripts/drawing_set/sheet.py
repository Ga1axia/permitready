"""Sheet frame, title block and drawing furniture shared by every sheet."""

from __future__ import annotations

import datetime as dt
import math
import re
import textwrap
from dataclasses import dataclass, field

SVG_NS = 'http://www.w3.org/2000/svg'

# Landscape paper sizes in millimetres.
PAPER = {'A0': (1189, 841), 'A1': (841, 594), 'A2': (594, 420), 'A3': (420, 297)}
MARGIN = 10.0
TITLE_W = {'A0': 190.0, 'A1': 170.0, 'A2': 150.0, 'A3': 130.0}

INK = '#111827'
SOFT = '#374151'
QUIET = '#6b7280'
RULE = '#9ca3af'


@dataclass(frozen=True)
class Project:
    id: str
    title: str
    category: str
    paper: str
    scale: int
    credit: str
    license: str
    source_file: str


@dataclass
class Sheet:
    number: str
    title: str
    kind: str  # 'cover' | 'plan' | 'schedule'
    scale: str  # '1:50' or 'NTS'
    body: str  # SVG fragment for the drawing area
    head: str = ''  # extra <defs>/<style> for this sheet
    sections: list[tuple[str, list[tuple[str, str]]]] = field(default_factory=list)  # title-block data rows
    north: tuple[float, float] | None = None
    show_scale_bar: bool = False
    # Hotspots for the app's PDF pane: (GlobalId, x, y, w, h in sheet mm, label).
    # Listed in drawing order, so later entries sit on top of earlier ones.
    links: list[tuple[str, float, float, float, float, str]] = field(default_factory=list)
    storey: str | None = None  # the storey a plan sheet shows
    # Plan sheets: model plan metres to sheet mm, sheet = (x0 + s·x, y0 − s·y).
    transform: tuple[float, float, float] | None = None  # (s, x0, y0)


def esc(text: object) -> str:
    return str(text).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def text(x: float, y: float, s: object, size: float, *, weight: str = 'normal', fill: str = INK, anchor: str = 'start', extra: str = '') -> str:
    # Sizes go inline: IfcConvert's stylesheet sets `text { font-size }`, and
    # CSS beats presentation attributes.
    return (
        f'<text x="{x:.2f}" y="{y:.2f}" style="font-size:{size}px;font-weight:{weight};'
        f'font-family:Helvetica,Arial,sans-serif" fill="{fill}" text-anchor="{anchor}"{extra}>{esc(s)}</text>'
    )


def drawing_area(paper: str) -> tuple[float, float, float, float]:
    """x, y, width, height of the space left of the title block."""
    W, H = PAPER[paper]
    return (MARGIN + 10, MARGIN + 10, W - 2 * MARGIN - TITLE_W[paper] - 20, H - 2 * MARGIN - 20)


def scale_bar(x: float, y: float, scale: int) -> str:
    steps = [0, 1, 2, 5] if scale <= 50 else [0, 2, 5, 10]
    mm_per_m = 1000.0 / scale
    out = []
    for i in range(len(steps) - 1):
        x0 = x + steps[i] * mm_per_m
        w = (steps[i + 1] - steps[i]) * mm_per_m
        fill = INK if i % 2 == 0 else '#ffffff'
        out.append(f'<rect x="{x0:.2f}" y="{y:.2f}" width="{w:.2f}" height="2" fill="{fill}" stroke="{INK}" stroke-width="0.2"/>')
    for s in steps:
        out.append(text(x + s * mm_per_m, y + 5.5, s, 2.6, anchor='middle'))
    out.append(text(x + steps[-1] * mm_per_m + 3, y + 5.5, 'm', 2.6))
    return '\n'.join(out)


def north_arrow(cx: float, cy: float, r: float, north: tuple[float, float]) -> str:
    """North arrow; `north` is the model's true-north direction in plan."""
    angle = math.degrees(math.atan2(north[0], north[1]))  # clockwise from sheet up
    return (
        f'<g transform="translate({cx:.2f} {cy:.2f}) rotate({angle:.2f})">'
        f'<circle r="{r}" fill="none" stroke="{INK}" stroke-width="0.3"/>'
        f'<path d="M0 {-r * 0.85} L{r * 0.38} {r * 0.55} L0 {r * 0.25} Z" fill="{INK}"/>'
        f'<path d="M0 {-r * 0.85} L{-r * 0.38} {r * 0.55} L0 {r * 0.25} Z" fill="#ffffff" stroke="{INK}" stroke-width="0.3"/>'
        f'</g>' + text(cx, cy - r - 2, 'N', 3.2, weight='bold', anchor='middle')
    )


def title_block(project: Project, sheet: Sheet, total_sheets: int) -> str:
    W, H = PAPER[project.paper]
    tw = TITLE_W[project.paper]
    x0 = W - MARGIN - tw
    pad = 6.0
    tx = x0 + pad
    inner = tw - 2 * pad
    parts = [f'<line x1="{x0}" y1="{MARGIN}" x2="{x0}" y2="{H - MARGIN}" stroke="{INK}" stroke-width="0.5"/>']
    y = MARGIN + 8

    def line(s: str, size: float = 2.8, weight: str = 'normal', gap: float = 1.5, fill: str = INK) -> None:
        nonlocal y
        y += size
        parts.append(text(tx, y, s, size, weight=weight, fill=fill))
        y += size * 0.4 + gap

    def para(s: str, size: float = 2.5, fill: str = SOFT) -> None:
        nonlocal y
        for chunk in textwrap.wrap(s, max(20, int(inner / (size * 0.5)))):
            line(chunk, size, gap=0.2, fill=fill)
        y += 1.8

    def rule() -> None:
        nonlocal y
        parts.append(f'<line x1="{x0}" y1="{y + 1:.1f}" x2="{W - MARGIN}" y2="{y + 1:.1f}" stroke="{RULE}" stroke-width="0.25"/>')
        y += 5

    def label(s: str) -> None:
        line(s.upper(), 2.2, 'bold', gap=1.2, fill=QUIET)

    def rows(data: list[tuple[str, str]]) -> None:
        nonlocal y
        for k, v in data:
            y += 2.6
            parts.append(text(tx, y, k, 2.5, fill=SOFT))
            parts.append(text(tx + inner, y, v, 2.5, weight='bold', anchor='end'))
            y += 1.6

    label('Code Review 3D · sample model')
    line(project.title, 6.0, 'bold', gap=0.4)
    line(project.category, 3.0, fill=SOFT, gap=2)
    rule()

    label('Sheet')
    for chunk in textwrap.wrap(sheet.title, max(12, int(inner / 2.5))):
        line(chunk, 4.6, 'bold', gap=0.6)
    y += 2
    rule()

    # Sheet number and scale side by side.
    half = inner / 2
    y += 2.2
    parts.append(text(tx, y, 'SHEET NO.', 2.2, weight='bold', fill=QUIET))
    parts.append(text(tx + half, y, 'SCALE', 2.2, weight='bold', fill=QUIET))
    y += 7.5
    parts.append(text(tx, y, sheet.number, 6.0, weight='bold'))
    scale_text = f'{sheet.scale} at {project.paper}' if sheet.scale != 'NTS' else 'Not to scale'
    parts.append(text(tx + half, y, scale_text, 4.0, weight='bold'))
    y += 4
    parts.append(text(tx, y, f'of {total_sheets} sheets', 2.4, fill=QUIET))
    y += 4
    if sheet.show_scale_bar:
        parts.append(scale_bar(tx, y, project.scale))
        if sheet.north:
            parts.append(north_arrow(tx + inner - 7, y + 1, 5.5, sheet.north))
        y += 12
    rule()

    for heading, data in sheet.sections:
        label(heading)
        rows(data)
        y += 2
        rule()

    label('Source')
    para(f'{project.credit}. License: {project.license}.')
    para(f'Changes: drawings generated from the 3D model ({project.source_file}); the model itself is unchanged.')
    rule()
    label('Notes')
    para('Generated automatically from the IFC model for review demos. Not a construction document. Check the scale bar before measuring from a print.')

    by = H - MARGIN - 8
    parts.append(f'<line x1="{x0}" y1="{by - 8}" x2="{W - MARGIN}" y2="{by - 8}" stroke="{RULE}" stroke-width="0.25"/>')
    parts.append(text(tx, by - 1, f'Generated {dt.date.today().isoformat()} with IfcOpenShell', 2.3, fill=QUIET))
    parts.append(text(tx, by + 3.5, 'apps/review/scripts/make_drawings.py', 2.3, fill=QUIET))
    return '\n'.join(parts)


def render(project: Project, sheet: Sheet, total_sheets: int) -> str:
    W, H = PAPER[project.paper]
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="{SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}">
<title>{esc(project.title)}: {esc(sheet.title)} ({esc(sheet.number)})</title>
{sheet.head}
<rect x="0" y="0" width="{W}" height="{H}" fill="#ffffff"/>
{sheet.body}
<g class="sheet">
<rect x="{MARGIN}" y="{MARGIN}" width="{W - 2 * MARGIN}" height="{H - 2 * MARGIN}" fill="none" stroke="{INK}" stroke-width="0.7"/>
{title_block(project, sheet, total_sheets)}
</g>
</svg>
"""


def slug(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def fmt_m(v: float | None, digits: int = 2) -> str:
    return '' if v is None else f'{v:.{digits}f}'


def fmt_mm(v: float | None) -> str:
    return '' if v is None else f'{round(v * 1000):d}'
