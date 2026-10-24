# Code-check engine — Tasks

Phase 3 of the spec. Checkbox tasks trace back to the requirements (Req n).

- [x] Context loader shared across all three samples (Req 1, 5) — `context.py`
- [x] Rule framework: `@rule` decorator, `Finding` with selectable target + point + sheet (Req 3, 4) — `rules.py`
- [x] First 10 rules (egress, stairs, glazing, separation, alarms, ventilation, fixtures) (Req 4)
- [x] Add 20 further rules (room size, ceiling height, daylight, landings, egress door, hallway width, fall protection, guards, stair width/riser/handrail, garage door, per-story alarm, electrical, plumbing) (Req 4)
- [x] Tie all rules to Boston's code: `CODE` = 780 CMR, sections `780 CMR 51 · …` (Req 2)
- [x] Register office + clinic in `BUILDINGS`; generate their reports (Req 1, 7)
- [x] Graceful degradation: device matchers precise; fix water-heater-vs-pipe false positive (Req 5)
- [x] Verify: all three reports `version 1`, selectable targets, sane counts (Req 6)
- [ ] Future: surface per-rule severity (fail / review / pass) distinctly in the UI legend
- [ ] Future: let a user-dropped IFC run a reduced rule set in-browser (Req 1 relaxation)

## Status

Shipped: 30 rules across 3 samples, tied to 780 CMR, reports regenerate via
`bun run check`. Open items are enhancements, not blockers.
