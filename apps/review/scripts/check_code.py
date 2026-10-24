#!/usr/bin/env python3
"""Run the code checks on a sample building and write its findings.

  python3 scripts/check_code.py duplex

Output, in public/checks/:
  <building>.json   every rule, and every finding with the element to select,
                    a point in model coordinates and its place on the floor plan
  <building>.md     the same as a readable review report

Reads public/models/<file>.ifc, the discipline models in
public/reference/<building>/models/ (bun run references) and the drawing
set's index.json (bun run drawings). Requires pip install ifcopenshell shapely.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from dataclasses import asdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from code_check import context  # noqa: E402
from code_check.rules import CODE, RULES  # noqa: E402

APP_DIR = Path(__file__).resolve().parent.parent
BUILDINGS = {'duplex': ('Duplex Apartment', 'duplex.ifc')}


def run(building: str) -> None:
    title, arch_file = BUILDINGS[building]
    print(f'[check] loading {building}…')
    ctx = context.load(building, APP_DIR, arch_file)
    print(f'[check] {len(ctx.spaces)} rooms, {len(ctx.devices)} devices from {len({d.model for d in ctx.devices})} models')

    rules, findings = [], []
    for r in RULES:
        results = r.check(ctx)
        fails = sum(1 for f in results if f.status == 'fail')
        print(f'[check] {r.id:<16} {fails} fail / {len(results) - fails} pass  {r.title}')
        rules.append({k: v for k, v in asdict(r).items() if k != 'check'} | {'fail': fails, 'pass': len(results) - fails})
        findings.extend(results)

    for i, f in enumerate(findings, 1):
        f.id = f'{building}-{i:03d}'

    out = APP_DIR / 'public' / 'checks'
    out.mkdir(parents=True, exist_ok=True)
    doc = {
        'version': 1,
        'building': building,
        'title': title,
        'code': CODE,
        'model': arch_file,
        'generated': dt.date.today().isoformat(),
        'coordinates': 'IFC model coordinates in metres, Z up; sheet x/y are 0-1 from the top left of the page',
        'summary': {'rules': len(rules), 'fail': sum(r['fail'] for r in rules), 'pass': sum(r['pass'] for r in rules)},
        'rules': rules,
        'findings': [{'id': f.id, **asdict(f)} for f in findings],
    }
    (out / f'{building}.json').write_text(json.dumps(doc, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    (out / f'{building}.md').write_text(report(doc), encoding='utf-8')
    print(f'[check] public/checks/{building}.json and .md: {doc["summary"]["fail"]} violations')


def report(doc: dict) -> str:
    lines = [
        f'# {doc["title"]}: code review',
        '',
        f'{doc["code"]}, checked against `{doc["model"]}` and its discipline models on {doc["generated"]} by '
        '`scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.',
        '',
        f'**{doc["summary"]["fail"]} violations** across {doc["summary"]["rules"]} rules ({doc["summary"]["pass"]} checks passed).',
        '',
        '| # | Section | Rule | Violations | Passed |',
        '| ---: | --- | --- | ---: | ---: |',
    ]
    for i, r in enumerate(doc['rules'], 1):
        lines.append(f'| {i} | {r["section"]} | {r["title"]} | {r["fail"]} | {r["pass"]} |')
    for i, r in enumerate(doc['rules'], 1):
        lines += ['', f'## {i}. {r["section"]}: {r["title"]}', '',
                  f'- **Complies:** {r["complies"]}', f'- **Violates:** {r["violates"]}', f'- **Fix:** {r["fix"]}', '']
        rows = [f for f in doc['findings'] if f['rule'] == r['id']]
        lines += ['| Finding | Result | Where | Measured | Required | Sheet |', '| --- | --- | --- | --- | --- | --- |']
        for f in sorted(rows, key=lambda f: f['status'] != 'fail'):
            sheet = f'{f["sheet"]["number"]}' if f.get('sheet') else ''
            lines.append(f'| {f["id"]} | {"**FAIL**" if f["status"] == "fail" else "pass"} | {f["room"]} | '
                         f'{f["measured"]} | {f["required"]} | {sheet} |')
    return '\n'.join(lines) + '\n'


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('buildings', nargs='*', help=f'buildings: {", ".join(BUILDINGS)} (default: all)')
    args = parser.parse_args()
    unknown = [b for b in args.buildings if b not in BUILDINGS]
    if unknown:
        parser.error(f'no checks for: {", ".join(unknown)}')
    for b in args.buildings or list(BUILDINGS):
        run(b)


if __name__ == '__main__':
    main()
