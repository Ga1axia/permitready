# Office Building: code review

2021 International Residential Code (IRC), checked against `kit-office.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**2 violations** across 10 rules (11 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 0 | 0 |
| 2 | R311.7.5.2 | Stair tread depth | 0 | 0 |
| 3 | R311.7.5.3 | Stair nosing projection | 0 | 0 |
| 4 | R308.4.3 | Safety glazing in hazardous window locations | 0 | 0 |
| 5 | R302.3 | Two-family dwelling separation | 0 | 0 |
| 6 | R314.3 | Smoke alarm locations | 0 | 0 |
| 7 | R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 0 | 0 |
| 8 | R303.1 | Habitable room ventilation | 2 | 3 |
| 9 | R303.3, M1505 | Bathroom ventilation | 0 | 8 |
| 10 | R307.1, P2705.1 | Plumbing fixture clearances | 0 | 0 |

## 1. R310.1, R310.2: Emergency escape and rescue opening in every sleeping room

- **Complies:** Every bedroom has an operable window or exterior door with at least 5.7 sq ft net clear opening (5.0 sq ft at grade floor), at least 24 in clear height and 20 in clear width, sill no more than 44 in above the floor.
- **Violates:** A bedroom whose only windows are fixed glazing, or whose operable window is too small or too high.
- **Fix:** Change one window per bedroom to an egress casement (for example 30 × 54 in rough opening, sill ≤ 44 in).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 2. R311.7.5.2: Stair tread depth

- **Complies:** Tread depth at least 10 in (254 mm), measured horizontally nosing to nosing; the largest and smallest tread in a flight within 3/8 in.
- **Violates:** Any tread shallower than 10 in.
- **Fix:** Lengthen the run: 15 treads × 254 mm needs 3.81 m of run instead of 3.75 m, or redistribute with one more riser.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 3. R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 4. R308.4.3: Safety glazing in hazardous window locations

- **Complies:** Glazing that meets all four conditions (pane over 9 sq ft, bottom edge under 18 in above the floor, top edge over 36 in, walking surface within 36 in) is tempered or laminated safety glazing; any other window may be annealed.
- **Violates:** A large, low pane like this that is specified as ordinary glass.
- **Fix:** Specify tempered (or laminated) glass for these window types, or raise the sill to 18 in.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 5. R302.3: Two-family dwelling separation

- **Complies:** The wall separating the two dwelling units is fire-resistance rated for 1 hour (1/2 hour where the building is sprinklered per NFPA 13D), continuous to the underside of the roof deck.
- **Violates:** A separation wall with no fire-resistance rating in an unsprinklered two-family dwelling.
- **Fix:** Assign a tested 1-hour assembly (for example UL U905 masonry) to the party wall type and carry it to the roof deck.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 6. R314.3: Smoke alarm locations

- **Complies:** A smoke alarm in each sleeping room, outside each separate sleeping area in the immediate vicinity of the bedrooms, and on each story.
- **Violates:** A sleeping area whose hallway has no smoke alarm (or a bedroom or story without one).
- **Fix:** Add an interconnected smoke alarm on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 7. R315.2.1, R315.3: Carbon monoxide alarms where there are fuel-burning appliances

- **Complies:** A dwelling unit with a fuel-burning appliance has a CO alarm outside each separate sleeping area in the immediate vicinity of the bedrooms (and in any bedroom that contains such an appliance).
- **Violates:** A unit with a gas-fired appliance and no CO alarm outside its bedrooms.
- **Fix:** Add a CO alarm (or combination smoke/CO alarm) on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 8. R303.1: Habitable room ventilation

- **Complies:** Openable area to the outdoors (operable windows, exterior doors) of at least 4% of each habitable room’s floor area, or a whole-house mechanical ventilation system per M1505.4.
- **Violates:** A habitable room with only fixed glazing and no whole-house mechanical ventilation.
- **Fix:** Make part of the glazing operable, or add a whole-house ventilation system (ERV/HRV or exhaust-only per M1505.4).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-004 | **FAIL** | 403 Dachboden-2 | 0.00 m² openable (0.0 sq ft) for 201.8 m² floor; no whole-house ventilation in the MEP model | ≥ 8.07 m² (86.9 sq ft), 4% of floor area | A-105 |
| office-005 | **FAIL** | 402 Dachboden-1 | 0.00 m² openable (0.0 sq ft) for 201.8 m² floor; no whole-house ventilation in the MEP model | ≥ 8.07 m² (86.9 sq ft), 4% of floor area | A-105 |
| office-001 | pass | 105 Buero Studenten I | 9.00 m² openable (96.9 sq ft) for 39.2 m² floor; no whole-house ventilation in the MEP model | ≥ 1.57 m² (16.9 sq ft), 4% of floor area | A-102 |
| office-002 | pass | 106 Buero Studenten II | 9.00 m² openable (96.9 sq ft) for 37.8 m² floor; no whole-house ventilation in the MEP model | ≥ 1.51 m² (16.3 sq ft), 4% of floor area | A-102 |
| office-003 | pass | 114 Buero Studenten III | 9.00 m² openable (96.9 sq ft) for 38.7 m² floor; no whole-house ventilation in the MEP model | ≥ 1.55 m² (16.7 sq ft), 4% of floor area | A-102 |

## 9. R303.3, M1505: Bathroom ventilation

- **Complies:** Each bathroom has a window of at least 3 sq ft, half of it openable, or a mechanical exhaust to the outdoors (50 cfm intermittent or 20 cfm continuous).
- **Violates:** A bathroom with no window and no exhaust fan or exhaust duct.
- **Fix:** Add a ceiling exhaust fan ducted to the outdoors (50 cfm intermittent).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-006 | pass | 008 WC Herren | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| office-007 | pass | 009 WC Damen | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| office-008 | pass | 113 WC Damen | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| office-009 | pass | 112 WC Herren | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| office-010 | pass | 214 WC Damen | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-103 |
| office-011 | pass | 213 WC Herren | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-103 |
| office-012 | pass | 313 WC Herren | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-104 |
| office-013 | pass | 314 WC Damen | 2 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-104 |

## 10. R307.1, P2705.1: Plumbing fixture clearances

- **Complies:** Water closets and lavatories at least 15 in (381 mm) from their centre to a side wall or obstruction, and at least 30 in (762 mm) centre to centre from an adjacent fixture.
- **Violates:** Fixtures set closer than 30 in apart, or less than 15 in from a side wall.
- **Fix:** Respace the fixtures to 30 in centres, or replace the pair of lavatories with one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
