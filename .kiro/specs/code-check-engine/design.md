# Code-check engine — Design

Phase 2 of the spec. How the requirements are met.

## Pipeline

```
IFC model + discipline models + drawing index
        │  scripts/code_check/context.py  (load once)
        ▼
   Context { spaces, devices, data, sheets }
        │  scripts/code_check/rules.py  (RULES: list[Rule])
        ▼
   Findings  ──►  scripts/check_code.py  ──►  public/checks/<b>.json + .md
                                                     │  fetchCheckReport()
                                                     ▼
                              CodeCheckPanel (UI) → 3D highlight + PDF markers
```

## Modules

- **`context.py`** — loads the architectural IFC plus the discipline models and
  the drawing-set `index.json`; exposes rooms (`Space`), placed `Device`s, and
  `on_sheet(point, storey)` to map a model point to a plan-sheet position.
  Building-agnostic: the same loader serves all three samples.
- **`rules.py`** — each rule is a `@rule(...)`-decorated function returning
  `Finding`s. A rule reads only `Context` and emits `_finding(...)` with a
  selectable target, a point, measured vs. required, and a sheet position.
  `CODE` holds the 780 CMR label; every `section` is `780 CMR 51 · <IRC §>`.
- **`check_code.py`** — the `BUILDINGS` registry (duplex/office/clinic), runs
  every rule per building, numbers findings, and writes the JSON + Markdown.

## Key decisions

- **Reports are static artifacts.** Generating offline and shipping JSON keeps
  the browser free of Python/ifcopenshell and makes load instant (Req 1, 7).
- **Graceful degradation is per-rule.** A rule returns `[]` when its elements
  are absent, so office (no MEP) simply shows fewer findings (Req 5). Device
  matchers must be precise — e.g. water-heater rules match appliances, never
  hot-water *piping* (a bug caught during verification).
- **780 CMR framing is a relabel, not a re-derivation.** MA adopts the IRC
  section structure, so section numbers carry through under the 780 CMR 51
  citation (Req 2).
- **The JSON contract is frozen at `version: 1`.** New rules add entries; they
  never change the envelope the app reads (Req 6).

## Verification

Regenerate all three reports in a throwaway Python venv and assert each is
`version 1`, every finding has a `target.globalId`, and violation counts are
sane (no rule flooding hundreds of false positives).
