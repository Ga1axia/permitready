# Duplex Apartment: code review

780 CMR — Massachusetts State Building Code, 10th Ed. (Residential Volume, 780 CMR 51.00, adopting the 2021 IRC with Massachusetts amendments), as enforced in Boston, checked against `duplex.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**55 violations** across 30 rules (101 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | 780 CMR 51 · R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 4 | 0 |
| 2 | 780 CMR 51 · R311.7.5.2 | Stair tread depth | 2 | 0 |
| 3 | 780 CMR 51 · R311.7.5.3 | Stair nosing projection | 2 | 0 |
| 4 | 780 CMR 51 · R308.4.3 | Safety glazing in hazardous window locations | 10 | 0 |
| 5 | 780 CMR 51 · R302.3 | Two-family dwelling separation | 4 | 0 |
| 6 | 780 CMR 51 · R314.3 | Smoke alarm locations | 2 | 4 |
| 7 | 780 CMR 51 · R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 2 | 0 |
| 8 | 780 CMR 51 · R303.1 | Habitable room ventilation | 6 | 2 |
| 9 | 780 CMR 51 · R303.3, M1505 | Bathroom ventilation | 4 | 0 |
| 10 | 780 CMR 51 · R307.1, P2705.1 | Plumbing fixture clearances | 8 | 10 |
| 11 | 780 CMR 51 · R305.1 | Minimum ceiling height in habitable rooms | 0 | 8 |
| 12 | 780 CMR 51 · R304.1 | Minimum habitable room area | 0 | 6 |
| 13 | 780 CMR 51 · R304.2 | Minimum habitable room dimension | 0 | 8 |
| 14 | 780 CMR 51 · R303.1 | Natural light in habitable rooms | 0 | 8 |
| 15 | 780 CMR 51 · R311.3 | Floor or landing at exterior doors | 0 | 4 |
| 16 | 780 CMR 51 · R311.2 | Required egress door size | 0 | 2 |
| 17 | 780 CMR 51 · R311.6 | Minimum hallway width | 0 | 2 |
| 18 | 780 CMR 51 · R312.2.1 | Window fall protection | 0 | 0 |
| 19 | 780 CMR 51 · R312.1.1, R312.1.2 | Guards at walking surfaces over 30 in | 0 | 2 |
| 20 | 780 CMR 51 · E3901.4 | Kitchen counter receptacles | 0 | 2 |
| 21 | 780 CMR 51 · E3901.6 | Bathroom receptacle | 0 | 4 |
| 22 | 780 CMR 51 · E3902.1–E3902.11 | GFCI protection in wet locations | 2 | 18 |
| 23 | 780 CMR 51 · E3903.2 | Lighting outlet in habitable rooms | 4 | 11 |
| 24 | 780 CMR 51 · P2804.6.1 | Water heater relief valve discharge | 2 | 0 |
| 25 | 780 CMR 51 · R307.1, P2705.1 | Water closet front clearance | 0 | 4 |
| 26 | 780 CMR 51 · R311.7.1 | Stairway width | 0 | 2 |
| 27 | 780 CMR 51 · R311.7.5.1 | Stair riser height | 0 | 2 |
| 28 | 780 CMR 51 · R311.7.8.1 | Handrail height on stairs | 2 | 0 |
| 29 | 780 CMR 51 · R302.5.1 | Door between garage and dwelling | 0 | 0 |
| 30 | 780 CMR 51 · R314.3(3) | Smoke alarm on every story | 1 | 2 |

## 1. 780 CMR 51 · R310.1, R310.2: Emergency escape and rescue opening in every sleeping room

- **Complies:** Every bedroom has an operable window or exterior door with at least 5.7 sq ft net clear opening (5.0 sq ft at grade floor), at least 24 in clear height and 20 in clear width, sill no more than 44 in above the floor.
- **Violates:** A bedroom whose only windows are fixed glazing, or whose operable window is too small or too high.
- **Fix:** Change one window per bedroom to an egress casement (for example 30 × 54 in rough opening, sill ≤ 44 in).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-001 | **FAIL** | A203 Bedroom 2 | 0 operable openings: 3 of 3 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-002 | **FAIL** | A202 Bedroom 1 | 0 operable openings: 2 of 2 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-003 | **FAIL** | B203 Bedroom 2 | 0 operable openings: 3 of 3 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-004 | **FAIL** | B202 Bedroom 1 | 0 operable openings: 2 of 2 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |

## 2. 780 CMR 51 · R311.7.5.2: Stair tread depth

- **Complies:** Tread depth at least 10 in (254 mm), measured horizontally nosing to nosing; the largest and smallest tread in a flight within 3/8 in.
- **Violates:** Any tread shallower than 10 in.
- **Fix:** Lengthen the run: 15 treads × 254 mm needs 3.81 m of run instead of 3.75 m, or redistribute with one more riser.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-005 | **FAIL** | Unit A stair (A105 Stair) | 250 mm (9.84 in) | ≥ 254 mm (10 in) | A-101 |
| duplex-006 | **FAIL** | Unit B stair (B105 Room) | 250 mm (9.84 in) | ≥ 254 mm (10 in) | A-101 |

## 3. 780 CMR 51 · R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-007 | **FAIL** | Unit A stair (A105 Stair) | 10 mm (0.39 in) nosing on 250 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| duplex-008 | **FAIL** | Unit B stair (B105 Room) | 10 mm (0.39 in) nosing on 250 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |

## 4. 780 CMR 51 · R308.4.3: Safety glazing in hazardous window locations

- **Complies:** Glazing that meets all four conditions (pane over 9 sq ft, bottom edge under 18 in above the floor, top edge over 36 in, walking surface within 36 in) is tempered or laminated safety glazing; any other window may be annealed.
- **Violates:** A large, low pane like this that is specified as ordinary glass.
- **Fix:** Specify tempered (or laminated) glass for these window types, or raise the sill to 18 in.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-009 | **FAIL** | A102 | 125.9 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-101 |
| duplex-010 | **FAIL** | B102, B103 | 17.8 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-101 |
| duplex-011 | **FAIL** | A102, A103 | 17.8 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-101 |
| duplex-012 | **FAIL** | B102 | 125.9 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-101 |
| duplex-013 | **FAIL** | B203 | 72.6 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |
| duplex-014 | **FAIL** | A203 | 72.6 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |
| duplex-015 | **FAIL** | B202 | 72.6 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |
| duplex-016 | **FAIL** | A202 | 72.6 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |
| duplex-017 | **FAIL** | A203 | 17.8 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |
| duplex-018 | **FAIL** | B203 | 17.8 sq ft pane, bottom edge 3.94 in above floor; glass: Glass | tempered or laminated safety glazing | A-102 |

## 5. 780 CMR 51 · R302.3: Two-family dwelling separation

- **Complies:** The wall separating the two dwelling units is fire-resistance rated for 1 hour (1/2 hour where the building is sprinklered per NFPA 13D), continuous to the underside of the roof deck.
- **Violates:** A separation wall with no fire-resistance rating in an unsprinklered two-family dwelling.
- **Fix:** Assign a tested 1-hour assembly (for example UL U905 masonry) to the party wall type and carry it to the roof deck.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-019 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-102 |
| duplex-020 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |
| duplex-021 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |
| duplex-022 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |

## 6. 780 CMR 51 · R314.3: Smoke alarm locations

- **Complies:** A smoke alarm in each sleeping room, outside each separate sleeping area in the immediate vicinity of the bedrooms, and on each story.
- **Violates:** A sleeping area whose hallway has no smoke alarm (or a bedroom or story without one).
- **Fix:** Add an interconnected smoke alarm on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-027 | **FAIL** | A201 Hallway | 0 smoke alarm(s) | 1 smoke alarm (outside sleeping area of A202, A203) | A-102 |
| duplex-028 | **FAIL** | B201 Hallway | 0 smoke alarm(s) | 1 smoke alarm (outside sleeping area of B202, B203) | A-102 |
| duplex-023 | pass | A203 Bedroom 2 | 1 smoke alarm(s) | 1 smoke alarm (sleeping room) | A-102 |
| duplex-024 | pass | A202 Bedroom 1 | 1 smoke alarm(s) | 1 smoke alarm (sleeping room) | A-102 |
| duplex-025 | pass | B203 Bedroom 2 | 1 smoke alarm(s) | 1 smoke alarm (sleeping room) | A-102 |
| duplex-026 | pass | B202 Bedroom 1 | 1 smoke alarm(s) | 1 smoke alarm (sleeping room) | A-102 |

## 7. 780 CMR 51 · R315.2.1, R315.3: Carbon monoxide alarms where there are fuel-burning appliances

- **Complies:** A dwelling unit with a fuel-burning appliance has a CO alarm outside each separate sleeping area in the immediate vicinity of the bedrooms (and in any bedroom that contains such an appliance).
- **Violates:** A unit with a gas-fired appliance and no CO alarm outside its bedrooms.
- **Fix:** Add a CO alarm (or combination smoke/CO alarm) on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-029 | **FAIL** | A201 Hallway | 0 CO alarm(s); fuel-burning: M_Hot Water Boiler - 59-440 kW in A205 Utility | 1 CO alarm outside the sleeping area | A-102 |
| duplex-030 | **FAIL** | B201 Hallway | 0 CO alarm(s); fuel-burning: M_Hot Water Boiler - 59-440 kW in B205 Utility | 1 CO alarm outside the sleeping area | A-102 |

## 8. 780 CMR 51 · R303.1: Habitable room ventilation

- **Complies:** Openable area to the outdoors (operable windows, exterior doors) of at least 4% of each habitable room’s floor area, or a whole-house mechanical ventilation system per M1505.4.
- **Violates:** A habitable room with only fixed glazing and no whole-house mechanical ventilation.
- **Fix:** Make part of the glazing operable, or add a whole-house ventilation system (ERV/HRV or exhaust-only per M1505.4).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-032 | **FAIL** | A103 Kitchen | 0.00 m² openable (0.0 sq ft) for 13.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.52 m² (5.6 sq ft), 4% of floor area | A-101 |
| duplex-033 | **FAIL** | A203 Bedroom 2 | 0.00 m² openable (0.0 sq ft) for 22.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.88 m² (9.5 sq ft), 4% of floor area | A-102 |
| duplex-034 | **FAIL** | A202 Bedroom 1 | 0.00 m² openable (0.0 sq ft) for 22.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.88 m² (9.5 sq ft), 4% of floor area | A-102 |
| duplex-036 | **FAIL** | B103 Kitchen | 0.00 m² openable (0.0 sq ft) for 13.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.52 m² (5.6 sq ft), 4% of floor area | A-101 |
| duplex-037 | **FAIL** | B203 Bedroom 2 | 0.00 m² openable (0.0 sq ft) for 22.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.88 m² (9.5 sq ft), 4% of floor area | A-102 |
| duplex-038 | **FAIL** | B202 Bedroom 1 | 0.00 m² openable (0.0 sq ft) for 22.0 m² floor; no whole-house ventilation in the MEP model | ≥ 0.88 m² (9.5 sq ft), 4% of floor area | A-102 |
| duplex-031 | pass | A102 Living Room | 1.97 m² openable (21.2 sq ft) for 27.7 m² floor; no whole-house ventilation in the MEP model | ≥ 1.11 m² (11.9 sq ft), 4% of floor area | A-101 |
| duplex-035 | pass | B102 Living Room | 1.97 m² openable (21.2 sq ft) for 27.7 m² floor; no whole-house ventilation in the MEP model | ≥ 1.11 m² (11.9 sq ft), 4% of floor area | A-101 |

## 9. 780 CMR 51 · R303.3, M1505: Bathroom ventilation

- **Complies:** Each bathroom has a window of at least 3 sq ft, half of it openable, or a mechanical exhaust to the outdoors (50 cfm intermittent or 20 cfm continuous).
- **Violates:** A bathroom with no window and no exhaust fan or exhaust duct.
- **Fix:** Add a ceiling exhaust fan ducted to the outdoors (50 cfm intermittent).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-039 | **FAIL** | A104 Bathroom 1 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| duplex-040 | **FAIL** | A204 Bathroom 2 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| duplex-041 | **FAIL** | B104 Bathroom 1 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| duplex-042 | **FAIL** | B204 Bathroom 2 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |

## 10. 780 CMR 51 · R307.1, P2705.1: Plumbing fixture clearances

- **Complies:** Water closets and lavatories at least 15 in (381 mm) from their centre to a side wall or obstruction, and at least 30 in (762 mm) centre to centre from an adjacent fixture.
- **Violates:** Fixtures set closer than 30 in apart, or less than 15 in from a side wall.
- **Fix:** Respace the fixtures to 30 in centres, or replace the pair of lavatories with one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-043 | **FAIL** | A104 Bathroom 1 | 601 mm (23.66 in) centre to centre, Water Closet - Flush Tank and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| duplex-044 | **FAIL** | A104 Bathroom 1 | 220 mm (8.66 in) centre to side wall, Water Closet - Flush Tank | ≥ 381 mm (15 in) | A-101 |
| duplex-046 | **FAIL** | B104 Bathroom 1 | 601 mm (23.66 in) centre to centre, Water Closet - Flush Tank and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| duplex-047 | **FAIL** | B104 Bathroom 1 | 220 mm (8.66 in) centre to side wall, Water Closet - Flush Tank | ≥ 381 mm (15 in) | A-101 |
| duplex-049 | **FAIL** | A204 Bathroom 2 | 751 mm (29.57 in) centre to centre, Water Closet - Flush Tank and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| duplex-051 | **FAIL** | A204 Bathroom 2 | 650 mm (25.59 in) centre to centre, Lavatory - Oval and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| duplex-055 | **FAIL** | B204 Bathroom 2 | 650 mm (25.59 in) centre to centre, Lavatory - Oval and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| duplex-057 | **FAIL** | B204 Bathroom 2 | 750 mm (29.53 in) centre to centre, Lavatory - Oval and Water Closet - Flush Tank | ≥ 762 mm (30 in) | A-102 |
| duplex-045 | pass | A104 Bathroom 1 | 821 mm (32.32 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| duplex-048 | pass | B104 Bathroom 1 | 821 mm (32.32 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| duplex-050 | pass | A204 Bathroom 2 | 1401 mm (55.16 in) centre to centre, Water Closet - Flush Tank and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| duplex-052 | pass | A204 Bathroom 2 | 1054 mm (41.50 in) centre to side wall, Water Closet - Flush Tank | ≥ 381 mm (15 in) | A-102 |
| duplex-053 | pass | A204 Bathroom 2 | 1300 mm (51.17 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| duplex-054 | pass | A204 Bathroom 2 | 650 mm (25.58 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| duplex-056 | pass | B204 Bathroom 2 | 1400 mm (55.12 in) centre to centre, Lavatory - Oval and Water Closet - Flush Tank | ≥ 762 mm (30 in) | A-102 |
| duplex-058 | pass | B204 Bathroom 2 | 650 mm (25.59 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| duplex-059 | pass | B204 Bathroom 2 | 1300 mm (51.18 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| duplex-060 | pass | B204 Bathroom 2 | 1070 mm (42.13 in) centre to side wall, Water Closet - Flush Tank | ≥ 381 mm (15 in) | A-102 |

## 11. 780 CMR 51 · R305.1: Minimum ceiling height in habitable rooms

- **Complies:** Habitable rooms, hallways and portions of basements with habitable space have a ceiling height of at least 7 ft (2134 mm); bathrooms and toilet rooms at least 6 ft 8 in (2032 mm).
- **Violates:** A habitable room with a finished ceiling under 7 ft.
- **Fix:** Raise the ceiling or reclassify the low space as non-habitable (storage) on the plans.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-061 | pass | A102 Living Room | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-101 |
| duplex-062 | pass | A103 Kitchen | 2587 mm (101.85 in) | ≥ 2134 mm (7 ft) | A-101 |
| duplex-063 | pass | A203 Bedroom 2 | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-102 |
| duplex-064 | pass | A202 Bedroom 1 | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-102 |
| duplex-065 | pass | B102 Living Room | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-101 |
| duplex-066 | pass | B103 Kitchen | 2587 mm (101.85 in) | ≥ 2134 mm (7 ft) | A-101 |
| duplex-067 | pass | B203 Bedroom 2 | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-102 |
| duplex-068 | pass | B202 Bedroom 1 | 2581 mm (101.61 in) | ≥ 2134 mm (7 ft) | A-102 |

## 12. 780 CMR 51 · R304.1: Minimum habitable room area

- **Complies:** Every habitable room has at least 70 sq ft (6.5 m²) of floor area (kitchens are exempt from the 70 sq ft minimum).
- **Violates:** A habitable room — other than a kitchen — smaller than 70 sq ft.
- **Fix:** Combine the undersized room with an adjacent space, or reclassify it as an alcove/closet.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-069 | pass | A102 Living Room | 27.7 m² (297.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| duplex-070 | pass | A203 Bedroom 2 | 22.0 m² (237.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| duplex-071 | pass | A202 Bedroom 1 | 22.0 m² (237.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| duplex-072 | pass | B102 Living Room | 27.7 m² (297.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| duplex-073 | pass | B203 Bedroom 2 | 22.0 m² (237.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| duplex-074 | pass | B202 Bedroom 1 | 22.0 m² (237.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |

## 13. 780 CMR 51 · R304.2: Minimum habitable room dimension

- **Complies:** Habitable rooms are at least 7 ft (2134 mm) in any horizontal direction.
- **Violates:** A habitable room with a least-width under 7 ft.
- **Fix:** Widen the room, or merge the narrow strip into the adjoining space.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-075 | pass | A102 Living Room | 4783 mm (188.31 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| duplex-076 | pass | A103 Kitchen | 2230 mm (87.80 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| duplex-077 | pass | A203 Bedroom 2 | 3708 mm (145.98 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| duplex-078 | pass | A202 Bedroom 1 | 3708 mm (145.98 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| duplex-079 | pass | B102 Living Room | 4783 mm (188.31 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| duplex-080 | pass | B103 Kitchen | 2230 mm (87.80 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| duplex-081 | pass | B203 Bedroom 2 | 3708 mm (145.98 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| duplex-082 | pass | B202 Bedroom 1 | 3708 mm (145.98 in) least width | ≥ 2134 mm (7 ft) | A-102 |

## 14. 780 CMR 51 · R303.1: Natural light in habitable rooms

- **Complies:** Glazing area opening to the outdoors of at least 8% of each habitable room’s floor area (artificial light at 6 fc is an accepted alternative).
- **Violates:** A habitable room whose total glazing is under 8% of its floor area.
- **Fix:** Enlarge or add a window, or document compliant artificial lighting for the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-083 | pass | A102 Living Room | 13.35 m² glazing (143.7 sq ft) for 27.7 m² floor | ≥ 2.21 m² (23.8 sq ft), 8% of floor | A-101 |
| duplex-084 | pass | A103 Kitchen | 1.65 m² glazing (17.8 sq ft) for 13.0 m² floor | ≥ 1.04 m² (11.2 sq ft), 8% of floor | A-101 |
| duplex-085 | pass | A203 Bedroom 2 | 9.02 m² glazing (97.1 sq ft) for 22.0 m² floor | ≥ 1.76 m² (19.0 sq ft), 8% of floor | A-102 |
| duplex-086 | pass | A202 Bedroom 1 | 7.37 m² glazing (79.3 sq ft) for 22.0 m² floor | ≥ 1.76 m² (19.0 sq ft), 8% of floor | A-102 |
| duplex-087 | pass | B102 Living Room | 13.35 m² glazing (143.7 sq ft) for 27.7 m² floor | ≥ 2.21 m² (23.8 sq ft), 8% of floor | A-101 |
| duplex-088 | pass | B103 Kitchen | 1.65 m² glazing (17.8 sq ft) for 13.0 m² floor | ≥ 1.04 m² (11.2 sq ft), 8% of floor | A-101 |
| duplex-089 | pass | B203 Bedroom 2 | 9.02 m² glazing (97.1 sq ft) for 22.0 m² floor | ≥ 1.76 m² (19.0 sq ft), 8% of floor | A-102 |
| duplex-090 | pass | B202 Bedroom 1 | 7.37 m² glazing (79.3 sq ft) for 22.0 m² floor | ≥ 1.76 m² (19.0 sq ft), 8% of floor | A-102 |

## 15. 780 CMR 51 · R311.3: Floor or landing at exterior doors

- **Complies:** A landing or floor on each side of every required egress door, no more than 1-1/2 in (38 mm) lower than the threshold, at least as wide as the door and 36 in (914 mm) deep in the direction of travel.
- **Violates:** An exterior egress door that opens into a room too shallow to hold a 36 in landing.
- **Fix:** Provide a 36 in deep landing at the door, or relocate the door to a space that can hold one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-091 | pass | A101 Foyer | 2183 mm (85.94 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| duplex-092 | pass | A102 Living Room | 4783 mm (188.31 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| duplex-093 | pass | B101 Foyer | 2183 mm (85.94 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| duplex-094 | pass | B102 Living Room | 4783 mm (188.31 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |

## 16. 780 CMR 51 · R311.2: Required egress door size

- **Complies:** At least one side-hinged egress door per dwelling, at least 32 in (813 mm) clear width and 78 in (1981 mm) clear height.
- **Violates:** A unit whose widest exterior door is under 32 in clear.
- **Fix:** Widen the main entry door to a 36 in leaf (≈ 34 in clear), or designate a compliant door as the egress door.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-095 | pass | Unit A | widest egress door 1250 mm (49.21 in) leaf | ≥ 813 mm (32 in) clear | A-101 |
| duplex-096 | pass | Unit B | widest egress door 1250 mm (49.21 in) leaf | ≥ 813 mm (32 in) clear | A-101 |

## 17. 780 CMR 51 · R311.6: Minimum hallway width

- **Complies:** Hallways at least 3 ft (914 mm) wide.
- **Violates:** A corridor or hallway narrower than 36 in.
- **Fix:** Widen the hall to 36 in clear between finished wall faces.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-097 | pass | A201 Hallway | 1965 mm (77.36 in) clear width | ≥ 914 mm (36 in) | A-102 |
| duplex-098 | pass | B201 Hallway | 1965 mm (77.36 in) clear width | ≥ 914 mm (36 in) | A-102 |

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
| duplex-099 | pass | Unit A stair (A105 Stair) | a railing is present, guard ≈ 2957 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |
| duplex-100 | pass | Unit B stair (B105 Room) | a railing is present, guard ≈ 2957 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |

## 20. 780 CMR 51 · E3901.4: Kitchen counter receptacles

- **Complies:** A receptacle outlet serving each kitchen counter space, so no point along the counter wall line is more than 24 in (610 mm) from one (two or more outlets at a typical kitchen).
- **Violates:** A kitchen with fewer than two small-appliance receptacles modeled.
- **Fix:** Add counter-top receptacles on 20 A small-appliance branch circuits, spaced so every point is within 24 in of one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-101 | pass | A103 Kitchen | 7 receptacle(s) modeled | ≥ 2 counter receptacles, none > 24 in from a point on the counter | A-101 |
| duplex-102 | pass | B103 Kitchen | 7 receptacle(s) modeled | ≥ 2 counter receptacles, none > 24 in from a point on the counter | A-101 |

## 21. 780 CMR 51 · E3901.6: Bathroom receptacle

- **Complies:** At least one receptacle outlet within 36 in (914 mm) of the outside edge of each lavatory basin, on a 20 A circuit.
- **Violates:** A bathroom with a lavatory and no receptacle modeled.
- **Fix:** Add a GFCI-protected receptacle beside the lavatory on a dedicated 20 A bathroom circuit.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-103 | pass | A104 Bathroom 1 | 2 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| duplex-104 | pass | A204 Bathroom 2 | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| duplex-105 | pass | B104 Bathroom 1 | 2 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| duplex-106 | pass | B204 Bathroom 2 | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |

## 22. 780 CMR 51 · E3902.1–E3902.11: GFCI protection in wet locations

- **Complies:** Receptacles in bathrooms, kitchens (serving counters), garages, and outdoors are GFCI-protected.
- **Violates:** A receptacle in a wet-location room with no GFCI protection noted.
- **Fix:** Protect the circuit with a GFCI breaker or GFCI receptacle.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-123 | **FAIL** | A103 Kitchen | M_Telephone Outlet: no GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-124 | **FAIL** | B103 Kitchen | M_Telephone Outlet: no GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-107 | pass | A204 Bathroom 2 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| duplex-108 | pass | B204 Bathroom 2 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| duplex-109 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-110 | pass | B104 Bathroom 1 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-111 | pass | B104 Bathroom 1 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-112 | pass | A104 Bathroom 1 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-113 | pass | A104 Bathroom 1 | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-114 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-115 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-116 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-117 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-118 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-119 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-120 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-121 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-122 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-125 | pass | A103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| duplex-126 | pass | B103 Kitchen | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |

## 23. 780 CMR 51 · E3903.2: Lighting outlet in habitable rooms

- **Complies:** At least one wall-switched lighting outlet in every habitable room, hallway, stairway, and bathroom.
- **Violates:** A habitable room with no luminaire or lighting outlet modeled.
- **Fix:** Add a switched lighting outlet (ceiling luminaire or switched receptacle) to the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-128 | **FAIL** | A103 Kitchen | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-132 | **FAIL** | A203 Bedroom 2 | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-135 | **FAIL** | B103 Kitchen | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-139 | **FAIL** | B203 Bedroom 2 | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-127 | pass | A102 Living Room | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-129 | pass | A104 Bathroom 1 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-130 | pass | A201 Hallway | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-131 | pass | A204 Bathroom 2 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-133 | pass | A202 Bedroom 1 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-134 | pass | B102 Living Room | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-136 | pass | B104 Bathroom 1 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| duplex-137 | pass | B201 Hallway | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-138 | pass | B204 Bathroom 2 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-140 | pass | B202 Bedroom 1 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| duplex-141 | pass | A105 Stair | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |

## 24. 780 CMR 51 · P2804.6.1: Water heater relief valve discharge

- **Complies:** Each water heater has a temperature-and-pressure relief valve with a discharge pipe run to a safe location.
- **Violates:** A water heater with no relief-valve discharge modeled or noted.
- **Fix:** Provide a T&P relief valve and a full-size discharge pipe terminating per P2804.6.1.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-142 | **FAIL** | A205 Utility | M_Hot Water Boiler - 59-440 kW: no relief discharge noted | T&P relief valve with discharge to a safe location | A-102 |
| duplex-143 | **FAIL** | B205 Utility | M_Hot Water Boiler - 59-440 kW: no relief discharge noted | T&P relief valve with discharge to a safe location | A-102 |

## 25. 780 CMR 51 · R307.1, P2705.1: Water closet front clearance

- **Complies:** At least 21 in (533 mm) of clear space in front of a water closet, lavatory, or bidet.
- **Violates:** A water closet with less than 21 in of clear floor in front of it.
- **Fix:** Reposition the fixture or enlarge the room to give 21 in of front clearance.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-144 | pass | A104 Bathroom 1 | 1206 mm (47.48 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| duplex-145 | pass | B104 Bathroom 1 | 1206 mm (47.48 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| duplex-146 | pass | A204 Bathroom 2 | 1275 mm (50.20 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| duplex-147 | pass | B204 Bathroom 2 | 1274 mm (50.16 in) clear in front | ≥ 533 mm (21 in) | A-102 |

## 26. 780 CMR 51 · R311.7.1: Stairway width

- **Complies:** Stairways at least 36 in (914 mm) wide above the handrail height, with no more than one handrail projecting 4-1/2 in.
- **Violates:** A stair flight narrower than 36 in.
- **Fix:** Widen the stair opening and flight to at least 36 in clear.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-148 | pass | Unit A stair (A105 Stair) | 1000 mm (39.37 in) wide | ≥ 914 mm (36 in) | A-101 |
| duplex-149 | pass | Unit B stair (B105 Room) | 1000 mm (39.37 in) wide | ≥ 914 mm (36 in) | A-101 |

## 27. 780 CMR 51 · R311.7.5.1: Stair riser height

- **Complies:** Risers no more than 7-3/4 in (196 mm) high, the tallest and shortest within 3/8 in of each other.
- **Violates:** Any riser taller than 7-3/4 in.
- **Fix:** Add a riser to the flight to lower each step, or re-cut the stringers.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-150 | pass | Unit A stair (A105 Stair) | 194 mm (7.63 in) risers | ≤ 196 mm (7-3/4 in) | A-101 |
| duplex-151 | pass | Unit B stair (B105 Room) | 194 mm (7.63 in) risers | ≤ 196 mm (7-3/4 in) | A-101 |

## 28. 780 CMR 51 · R311.7.8.1: Handrail height on stairs

- **Complies:** Handrails 34–38 in (864–965 mm) above the stair nosings, continuous the full length of each flight of four or more risers.
- **Violates:** A stair of four or more risers with no handrail, or one outside 34–38 in.
- **Fix:** Add a graspable handrail at 34–38 in above the nosings for the full flight.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-152 | **FAIL** | Unit A stair (A105 Stair) | railing ≈ 2957 mm (116.41 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |
| duplex-153 | **FAIL** | Unit B stair (B105 Room) | railing ≈ 2957 mm (116.41 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |

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
| duplex-156 | **FAIL** | Roof | 0 smoke alarm(s) on Roof | ≥ 1 smoke alarm per story |  |
| duplex-154 | pass | Level 1 | 2 smoke alarm(s) on Level 1 | ≥ 1 smoke alarm per story | A-101 |
| duplex-155 | pass | Level 2 | 4 smoke alarm(s) on Level 2 | ≥ 1 smoke alarm per story | A-102 |
