# Duplex Apartment: code review

2021 International Residential Code (IRC), checked against `duplex.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**44 violations** across 10 rules (16 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 4 | 0 |
| 2 | R311.7.5.2 | Stair tread depth | 2 | 0 |
| 3 | R311.7.5.3 | Stair nosing projection | 2 | 0 |
| 4 | R308.4.3 | Safety glazing in hazardous window locations | 10 | 0 |
| 5 | R302.3 | Two-family dwelling separation | 4 | 0 |
| 6 | R314.3 | Smoke alarm locations | 2 | 4 |
| 7 | R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 2 | 0 |
| 8 | R303.1 | Habitable room ventilation | 6 | 2 |
| 9 | R303.3, M1505 | Bathroom ventilation | 4 | 0 |
| 10 | R307.1, P2705.1 | Plumbing fixture clearances | 8 | 10 |

## 1. R310.1, R310.2: Emergency escape and rescue opening in every sleeping room

- **Complies:** Every bedroom has an operable window or exterior door with at least 5.7 sq ft net clear opening (5.0 sq ft at grade floor), at least 24 in clear height and 20 in clear width, sill no more than 44 in above the floor.
- **Violates:** A bedroom whose only windows are fixed glazing, or whose operable window is too small or too high.
- **Fix:** Change one window per bedroom to an egress casement (for example 30 × 54 in rough opening, sill ≤ 44 in).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-001 | **FAIL** | A203 Bedroom 2 | 0 operable openings: 3 of 3 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-002 | **FAIL** | A202 Bedroom 1 | 0 operable openings: 2 of 2 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-003 | **FAIL** | B203 Bedroom 2 | 0 operable openings: 3 of 3 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |
| duplex-004 | **FAIL** | B202 Bedroom 1 | 0 operable openings: 2 of 2 windows are fixed glazing, no exterior door | ≥ 1 operable opening, ≥ 5.7 sq ft net clear, ≥ 24 in high, ≥ 20 in wide, sill ≤ 44 in | A-102 |

## 2. R311.7.5.2: Stair tread depth

- **Complies:** Tread depth at least 10 in (254 mm), measured horizontally nosing to nosing; the largest and smallest tread in a flight within 3/8 in.
- **Violates:** Any tread shallower than 10 in.
- **Fix:** Lengthen the run: 15 treads × 254 mm needs 3.81 m of run instead of 3.75 m, or redistribute with one more riser.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-005 | **FAIL** | Unit A stair (A105 Stair) | 250 mm (9.84 in) | ≥ 254 mm (10 in) | A-101 |
| duplex-006 | **FAIL** | Unit B stair (B105 Room) | 250 mm (9.84 in) | ≥ 254 mm (10 in) | A-101 |

## 3. R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-007 | **FAIL** | Unit A stair (A105 Stair) | 10 mm (0.39 in) nosing on 250 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| duplex-008 | **FAIL** | Unit B stair (B105 Room) | 10 mm (0.39 in) nosing on 250 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |

## 4. R308.4.3: Safety glazing in hazardous window locations

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

## 5. R302.3: Two-family dwelling separation

- **Complies:** The wall separating the two dwelling units is fire-resistance rated for 1 hour (1/2 hour where the building is sprinklered per NFPA 13D), continuous to the underside of the roof deck.
- **Violates:** A separation wall with no fire-resistance rating in an unsprinklered two-family dwelling.
- **Fix:** Assign a tested 1-hour assembly (for example UL U905 masonry) to the party wall type and carry it to the roof deck.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-019 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-102 |
| duplex-020 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |
| duplex-021 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |
| duplex-022 | **FAIL** | Between units A and B | fire rating: none; no sprinklers in any model | 1-hour fire-resistance rating | A-101 |

## 6. R314.3: Smoke alarm locations

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

## 7. R315.2.1, R315.3: Carbon monoxide alarms where there are fuel-burning appliances

- **Complies:** A dwelling unit with a fuel-burning appliance has a CO alarm outside each separate sleeping area in the immediate vicinity of the bedrooms (and in any bedroom that contains such an appliance).
- **Violates:** A unit with a gas-fired appliance and no CO alarm outside its bedrooms.
- **Fix:** Add a CO alarm (or combination smoke/CO alarm) on the hallway ceiling outside the bedrooms.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-029 | **FAIL** | A201 Hallway | 0 CO alarm(s); fuel-burning: M_Hot Water Boiler - 59-440 kW in A205 Utility | 1 CO alarm outside the sleeping area | A-102 |
| duplex-030 | **FAIL** | B201 Hallway | 0 CO alarm(s); fuel-burning: M_Hot Water Boiler - 59-440 kW in B205 Utility | 1 CO alarm outside the sleeping area | A-102 |

## 8. R303.1: Habitable room ventilation

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

## 9. R303.3, M1505: Bathroom ventilation

- **Complies:** Each bathroom has a window of at least 3 sq ft, half of it openable, or a mechanical exhaust to the outdoors (50 cfm intermittent or 20 cfm continuous).
- **Violates:** A bathroom with no window and no exhaust fan or exhaust duct.
- **Fix:** Add a ceiling exhaust fan ducted to the outdoors (50 cfm intermittent).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| duplex-039 | **FAIL** | A104 Bathroom 1 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| duplex-040 | **FAIL** | A204 Bathroom 2 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| duplex-041 | **FAIL** | B104 Bathroom 1 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| duplex-042 | **FAIL** | B204 Bathroom 2 | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |

## 10. R307.1, P2705.1: Plumbing fixture clearances

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
