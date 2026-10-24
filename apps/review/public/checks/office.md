# Office Building: code review

780 CMR — Massachusetts State Building Code, 10th Ed. (Residential Volume, 780 CMR 51.00, adopting the 2021 IRC with Massachusetts amendments), as enforced in Boston, checked against `kit-office.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**10 violations** across 30 rules (31 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | 780 CMR 51 · R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 0 | 0 |
| 2 | 780 CMR 51 · R311.7.5.2 | Stair tread depth | 0 | 0 |
| 3 | 780 CMR 51 · R311.7.5.3 | Stair nosing projection | 0 | 0 |
| 4 | 780 CMR 51 · R308.4.3 | Safety glazing in hazardous window locations | 0 | 0 |
| 5 | 780 CMR 51 · R302.3 | Two-family dwelling separation | 0 | 0 |
| 6 | 780 CMR 51 · R314.3 | Smoke alarm locations | 0 | 0 |
| 7 | 780 CMR 51 · R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 0 | 0 |
| 8 | 780 CMR 51 · R303.1 | Habitable room ventilation | 2 | 3 |
| 9 | 780 CMR 51 · R303.3, M1505 | Bathroom ventilation | 0 | 8 |
| 10 | 780 CMR 51 · R307.1, P2705.1 | Plumbing fixture clearances | 0 | 0 |
| 11 | 780 CMR 51 · R305.1 | Minimum ceiling height in habitable rooms | 2 | 3 |
| 12 | 780 CMR 51 · R304.1 | Minimum habitable room area | 0 | 5 |
| 13 | 780 CMR 51 · R304.2 | Minimum habitable room dimension | 0 | 5 |
| 14 | 780 CMR 51 · R303.1 | Natural light in habitable rooms | 2 | 3 |
| 15 | 780 CMR 51 · R311.3 | Floor or landing at exterior doors | 0 | 0 |
| 16 | 780 CMR 51 · R311.2 | Required egress door size | 0 | 0 |
| 17 | 780 CMR 51 · R311.6 | Minimum hallway width | 0 | 0 |
| 18 | 780 CMR 51 · R312.2.1 | Window fall protection | 0 | 0 |
| 19 | 780 CMR 51 · R312.1.1, R312.1.2 | Guards at walking surfaces over 30 in | 0 | 4 |
| 20 | 780 CMR 51 · E3901.4 | Kitchen counter receptacles | 0 | 0 |
| 21 | 780 CMR 51 · E3901.6 | Bathroom receptacle | 0 | 0 |
| 22 | 780 CMR 51 · E3902.1–E3902.11 | GFCI protection in wet locations | 0 | 0 |
| 23 | 780 CMR 51 · E3903.2 | Lighting outlet in habitable rooms | 0 | 0 |
| 24 | 780 CMR 51 · P2804.6.1 | Water heater relief valve discharge | 0 | 0 |
| 25 | 780 CMR 51 · R307.1, P2705.1 | Water closet front clearance | 0 | 0 |
| 26 | 780 CMR 51 · R311.7.1 | Stairway width | 0 | 0 |
| 27 | 780 CMR 51 · R311.7.5.1 | Stair riser height | 0 | 0 |
| 28 | 780 CMR 51 · R311.7.8.1 | Handrail height on stairs | 4 | 0 |
| 29 | 780 CMR 51 · R302.5.1 | Door between garage and dwelling | 0 | 0 |
| 30 | 780 CMR 51 · R314.3(3) | Smoke alarm on every story | 0 | 0 |

## 1. 780 CMR 51 · R310.1, R310.2: Emergency escape and rescue opening in every sleeping room

- **Complies:** Every bedroom has an operable window or exterior door with at least 5.7 sq ft net clear opening (5.0 sq ft at grade floor), at least 24 in clear height and 20 in clear width, sill no more than 44 in above the floor.
- **Violates:** A bedroom whose only windows are fixed glazing, or whose operable window is too small or too high.
- **Fix:** Change one window per bedroom to an egress casement (for example 30 × 54 in rough opening, sill ≤ 44 in).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 2. 780 CMR 51 · R311.7.5.2: Stair tread depth

- **Complies:** Tread depth at least 10 in (254 mm), measured horizontally nosing to nosing; the largest and smallest tread in a flight within 3/8 in.
- **Violates:** Any tread shallower than 10 in.
- **Fix:** Lengthen the run: 15 treads × 254 mm needs 3.81 m of run instead of 3.75 m, or redistribute with one more riser.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 3. 780 CMR 51 · R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 4. 780 CMR 51 · R308.4.3: Safety glazing in hazardous window locations

- **Complies:** Glazing that meets all four conditions (pane over 9 sq ft, bottom edge under 18 in above the floor, top edge over 36 in, walking surface within 36 in) is tempered or laminated safety glazing; any other window may be annealed.
- **Violates:** A large, low pane like this that is specified as ordinary glass.
- **Fix:** Specify tempered (or laminated) glass for these window types, or raise the sill to 18 in.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 5. 780 CMR 51 · R302.3: Two-family dwelling separation

- **Complies:** The wall separating the two dwelling units is fire-resistance rated for 1 hour (1/2 hour where the building is sprinklered per NFPA 13D), continuous to the underside of the roof deck.
- **Violates:** A separation wall with no fire-resistance rating in an unsprinklered two-family dwelling.
- **Fix:** Assign a tested 1-hour assembly (for example UL U905 masonry) to the party wall type and carry it to the roof deck.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 6. 780 CMR 51 · R314.3: Smoke alarm locations

- **Complies:** A smoke alarm in each sleeping room, outside each separate sleeping area in the immediate vicinity of the bedrooms, and on each story.
- **Violates:** A sleeping area whose hallway has no smoke alarm (or a bedroom or story without one).
- **Fix:** Add an interconnected smoke alarm on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 7. 780 CMR 51 · R315.2.1, R315.3: Carbon monoxide alarms where there are fuel-burning appliances

- **Complies:** A dwelling unit with a fuel-burning appliance has a CO alarm outside each separate sleeping area in the immediate vicinity of the bedrooms (and in any bedroom that contains such an appliance).
- **Violates:** A unit with a gas-fired appliance and no CO alarm outside its bedrooms.
- **Fix:** Add a CO alarm (or combination smoke/CO alarm) on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 8. 780 CMR 51 · R303.1: Habitable room ventilation

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

## 9. 780 CMR 51 · R303.3, M1505: Bathroom ventilation

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

## 10. 780 CMR 51 · R307.1, P2705.1: Plumbing fixture clearances

- **Complies:** Water closets and lavatories at least 15 in (381 mm) from their centre to a side wall or obstruction, and at least 30 in (762 mm) centre to centre from an adjacent fixture.
- **Violates:** Fixtures set closer than 30 in apart, or less than 15 in from a side wall.
- **Fix:** Respace the fixtures to 30 in centres, or replace the pair of lavatories with one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 11. 780 CMR 51 · R305.1: Minimum ceiling height in habitable rooms

- **Complies:** Habitable rooms, hallways and portions of basements with habitable space have a ceiling height of at least 7 ft (2134 mm); bathrooms and toilet rooms at least 6 ft 8 in (2032 mm).
- **Violates:** A habitable room with a finished ceiling under 7 ft.
- **Fix:** Raise the ceiling or reclassify the low space as non-habitable (storage) on the plans.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-017 | **FAIL** | 403 Dachboden-2 | 1640 mm (64.57 in) | ≥ 2134 mm (7 ft) | A-105 |
| office-018 | **FAIL** | 402 Dachboden-1 | 1640 mm (64.57 in) | ≥ 2134 mm (7 ft) | A-105 |
| office-014 | pass | 105 Buero Studenten I | 2700 mm (106.30 in) | ≥ 2134 mm (7 ft) | A-102 |
| office-015 | pass | 106 Buero Studenten II | 2700 mm (106.30 in) | ≥ 2134 mm (7 ft) | A-102 |
| office-016 | pass | 114 Buero Studenten III | 2700 mm (106.30 in) | ≥ 2134 mm (7 ft) | A-102 |

## 12. 780 CMR 51 · R304.1: Minimum habitable room area

- **Complies:** Every habitable room has at least 70 sq ft (6.5 m²) of floor area (kitchens are exempt from the 70 sq ft minimum).
- **Violates:** A habitable room — other than a kitchen — smaller than 70 sq ft.
- **Fix:** Combine the undersized room with an adjacent space, or reclassify it as an alcove/closet.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-019 | pass | 105 Buero Studenten I | 39.2 m² (421.5 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| office-020 | pass | 106 Buero Studenten II | 37.8 m² (407.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| office-021 | pass | 114 Buero Studenten III | 38.7 m² (416.8 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| office-022 | pass | 403 Dachboden-2 | 201.8 m² (2171.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-105 |
| office-023 | pass | 402 Dachboden-1 | 201.8 m² (2171.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-105 |

## 13. 780 CMR 51 · R304.2: Minimum habitable room dimension

- **Complies:** Habitable rooms are at least 7 ft (2134 mm) in any horizontal direction.
- **Violates:** A habitable room with a least-width under 7 ft.
- **Fix:** Widen the room, or merge the narrow strip into the adjoining space.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-024 | pass | 105 Buero Studenten I | 4400 mm (173.23 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| office-025 | pass | 106 Buero Studenten II | 4400 mm (173.23 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| office-026 | pass | 114 Buero Studenten III | 4400 mm (173.23 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| office-027 | pass | 403 Dachboden-2 | 11400 mm (448.82 in) least width | ≥ 2134 mm (7 ft) | A-105 |
| office-028 | pass | 402 Dachboden-1 | 11400 mm (448.82 in) least width | ≥ 2134 mm (7 ft) | A-105 |

## 14. 780 CMR 51 · R303.1: Natural light in habitable rooms

- **Complies:** Glazing area opening to the outdoors of at least 8% of each habitable room’s floor area (artificial light at 6 fc is an accepted alternative).
- **Violates:** A habitable room whose total glazing is under 8% of its floor area.
- **Fix:** Enlarge or add a window, or document compliant artificial lighting for the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-032 | **FAIL** | 403 Dachboden-2 | 0.00 m² glazing (0.0 sq ft) for 201.8 m² floor | ≥ 16.14 m² (173.8 sq ft), 8% of floor | A-105 |
| office-033 | **FAIL** | 402 Dachboden-1 | 0.00 m² glazing (0.0 sq ft) for 201.8 m² floor | ≥ 16.14 m² (173.8 sq ft), 8% of floor | A-105 |
| office-029 | pass | 105 Buero Studenten I | 9.00 m² glazing (96.9 sq ft) for 39.2 m² floor | ≥ 3.13 m² (33.7 sq ft), 8% of floor | A-102 |
| office-030 | pass | 106 Buero Studenten II | 9.00 m² glazing (96.9 sq ft) for 37.8 m² floor | ≥ 3.03 m² (32.6 sq ft), 8% of floor | A-102 |
| office-031 | pass | 114 Buero Studenten III | 9.00 m² glazing (96.9 sq ft) for 38.7 m² floor | ≥ 3.10 m² (33.3 sq ft), 8% of floor | A-102 |

## 15. 780 CMR 51 · R311.3: Floor or landing at exterior doors

- **Complies:** A landing or floor on each side of every required egress door, no more than 1-1/2 in (38 mm) lower than the threshold, at least as wide as the door and 36 in (914 mm) deep in the direction of travel.
- **Violates:** An exterior egress door that opens into a room too shallow to hold a 36 in landing.
- **Fix:** Provide a 36 in deep landing at the door, or relocate the door to a space that can hold one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 16. 780 CMR 51 · R311.2: Required egress door size

- **Complies:** At least one side-hinged egress door per dwelling, at least 32 in (813 mm) clear width and 78 in (1981 mm) clear height.
- **Violates:** A unit whose widest exterior door is under 32 in clear.
- **Fix:** Widen the main entry door to a 36 in leaf (≈ 34 in clear), or designate a compliant door as the egress door.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 17. 780 CMR 51 · R311.6: Minimum hallway width

- **Complies:** Hallways at least 3 ft (914 mm) wide.
- **Violates:** A corridor or hallway narrower than 36 in.
- **Fix:** Widen the hall to 36 in clear between finished wall faces.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 18. 780 CMR 51 · R312.2.1: Window fall protection

- **Complies:** Where the sill of an operable window is less than 24 in (610 mm) above the finished floor and more than 72 in (1829 mm) above the exterior grade, the window limits its opening to 4 in or has a fall-prevention device.
- **Violates:** A low operable window on an upper storey with no opening limiter noted.
- **Fix:** Specify opening-control devices or window guards on low sills above the ground floor.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 19. 780 CMR 51 · R312.1.1, R312.1.2: Guards at walking surfaces over 30 in

- **Complies:** Guards at least 36 in (914 mm) high along open-sided walking surfaces, including stairs and landings, more than 30 in (762 mm) above the floor or grade below.
- **Violates:** A raised floor edge, stair or landing over 30 in up with no guard element modeled.
- **Fix:** Add a 36 in guard (with ≤ 4 in sphere-rule infill) along the open edges.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-034 | pass | Stair (117 Flur EG Eingang) | a railing is present, guard ≈ 800 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |
| office-035 | pass | Stair (117 Flur EG Eingang) | a railing is present, guard ≈ 800 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-102 |
| office-036 | pass | Stair (117 Flur EG Eingang) | a railing is present, guard ≈ 800 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-103 |
| office-037 | pass | Stair (117 Flur EG Eingang) | a railing is present, guard ≈ 800 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-104 |

## 20. 780 CMR 51 · E3901.4: Kitchen counter receptacles

- **Complies:** A receptacle outlet serving each kitchen counter space, so no point along the counter wall line is more than 24 in (610 mm) from one (two or more outlets at a typical kitchen).
- **Violates:** A kitchen with fewer than two small-appliance receptacles modeled.
- **Fix:** Add counter-top receptacles on 20 A small-appliance branch circuits, spaced so every point is within 24 in of one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 21. 780 CMR 51 · E3901.6: Bathroom receptacle

- **Complies:** At least one receptacle outlet within 36 in (914 mm) of the outside edge of each lavatory basin, on a 20 A circuit.
- **Violates:** A bathroom with a lavatory and no receptacle modeled.
- **Fix:** Add a GFCI-protected receptacle beside the lavatory on a dedicated 20 A bathroom circuit.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 22. 780 CMR 51 · E3902.1–E3902.11: GFCI protection in wet locations

- **Complies:** Receptacles in bathrooms, kitchens (serving counters), garages, and outdoors are GFCI-protected.
- **Violates:** A receptacle in a wet-location room with no GFCI protection noted.
- **Fix:** Protect the circuit with a GFCI breaker or GFCI receptacle.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 23. 780 CMR 51 · E3903.2: Lighting outlet in habitable rooms

- **Complies:** At least one wall-switched lighting outlet in every habitable room, hallway, stairway, and bathroom.
- **Violates:** A habitable room with no luminaire or lighting outlet modeled.
- **Fix:** Add a switched lighting outlet (ceiling luminaire or switched receptacle) to the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 24. 780 CMR 51 · P2804.6.1: Water heater relief valve discharge

- **Complies:** Each water heater has a temperature-and-pressure relief valve with a discharge pipe run to a safe location.
- **Violates:** A water heater with no relief-valve discharge modeled or noted.
- **Fix:** Provide a T&P relief valve and a full-size discharge pipe terminating per P2804.6.1.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 25. 780 CMR 51 · R307.1, P2705.1: Water closet front clearance

- **Complies:** At least 21 in (533 mm) of clear space in front of a water closet, lavatory, or bidet.
- **Violates:** A water closet with less than 21 in of clear floor in front of it.
- **Fix:** Reposition the fixture or enlarge the room to give 21 in of front clearance.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 26. 780 CMR 51 · R311.7.1: Stairway width

- **Complies:** Stairways at least 36 in (914 mm) wide above the handrail height, with no more than one handrail projecting 4-1/2 in.
- **Violates:** A stair flight narrower than 36 in.
- **Fix:** Widen the stair opening and flight to at least 36 in clear.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 27. 780 CMR 51 · R311.7.5.1: Stair riser height

- **Complies:** Risers no more than 7-3/4 in (196 mm) high, the tallest and shortest within 3/8 in of each other.
- **Violates:** Any riser taller than 7-3/4 in.
- **Fix:** Add a riser to the flight to lower each step, or re-cut the stringers.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 28. 780 CMR 51 · R311.7.8.1: Handrail height on stairs

- **Complies:** Handrails 34–38 in (864–965 mm) above the stair nosings, continuous the full length of each flight of four or more risers.
- **Violates:** A stair of four or more risers with no handrail, or one outside 34–38 in.
- **Fix:** Add a graspable handrail at 34–38 in above the nosings for the full flight.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| office-038 | **FAIL** | Stair (117 Flur EG Eingang) | railing ≈ 800 mm (31.50 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |
| office-039 | **FAIL** | Stair (117 Flur EG Eingang) | railing ≈ 800 mm (31.50 in) tall | 864–965 mm (34–38 in) above the nosings | A-102 |
| office-040 | **FAIL** | Stair (117 Flur EG Eingang) | railing ≈ 800 mm (31.50 in) tall | 864–965 mm (34–38 in) above the nosings | A-103 |
| office-041 | **FAIL** | Stair (117 Flur EG Eingang) | railing ≈ 800 mm (31.50 in) tall | 864–965 mm (34–38 in) above the nosings | A-104 |

## 29. 780 CMR 51 · R302.5.1: Door between garage and dwelling

- **Complies:** Doors between a garage and the residence are solid wood (1-3/8 in), solid or honeycomb-core steel (1-3/8 in), or 20-minute fire-rated; no door opens directly into a sleeping room.
- **Violates:** A garage-to-house door that is not rated/solid, or one opening into a bedroom.
- **Fix:** Specify a 20-minute or 1-3/8 in solid-core door, and never into a sleeping room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |

## 30. 780 CMR 51 · R314.3(3): Smoke alarm on every story

- **Complies:** A smoke alarm on each story of the dwelling, including basements and habitable attics.
- **Violates:** A story with no smoke alarm anywhere on it.
- **Fix:** Add an interconnected smoke alarm to the story with none.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
