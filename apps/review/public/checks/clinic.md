# Medical-Dental Clinic: code review

780 CMR — Massachusetts State Building Code, 10th Ed. (Residential Volume, 780 CMR 51.00, adopting the 2021 IRC with Massachusetts amendments), as enforced in Boston, checked against `clinic.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**57 violations** across 30 rules (401 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | 780 CMR 51 · R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 0 | 0 |
| 2 | 780 CMR 51 · R311.7.5.2 | Stair tread depth | 0 | 3 |
| 3 | 780 CMR 51 · R311.7.5.3 | Stair nosing projection | 0 | 3 |
| 4 | 780 CMR 51 · R308.4.3 | Safety glazing in hazardous window locations | 0 | 0 |
| 5 | 780 CMR 51 · R302.3 | Two-family dwelling separation | 0 | 0 |
| 6 | 780 CMR 51 · R314.3 | Smoke alarm locations | 0 | 0 |
| 7 | 780 CMR 51 · R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 0 | 0 |
| 8 | 780 CMR 51 · R303.1 | Habitable room ventilation | 0 | 34 |
| 9 | 780 CMR 51 · R303.3, M1505 | Bathroom ventilation | 2 | 20 |
| 10 | 780 CMR 51 · R307.1, P2705.1 | Plumbing fixture clearances | 9 | 71 |
| 11 | 780 CMR 51 · R305.1 | Minimum ceiling height in habitable rooms | 0 | 34 |
| 12 | 780 CMR 51 · R304.1 | Minimum habitable room area | 0 | 33 |
| 13 | 780 CMR 51 · R304.2 | Minimum habitable room dimension | 0 | 34 |
| 14 | 780 CMR 51 · R303.1 | Natural light in habitable rooms | 34 | 0 |
| 15 | 780 CMR 51 · R311.3 | Floor or landing at exterior doors | 1 | 11 |
| 16 | 780 CMR 51 · R311.2 | Required egress door size | 0 | 1 |
| 17 | 780 CMR 51 · R311.6 | Minimum hallway width | 0 | 40 |
| 18 | 780 CMR 51 · R312.2.1 | Window fall protection | 0 | 0 |
| 19 | 780 CMR 51 · R312.1.1, R312.1.2 | Guards at walking surfaces over 30 in | 0 | 3 |
| 20 | 780 CMR 51 · E3901.4 | Kitchen counter receptacles | 0 | 1 |
| 21 | 780 CMR 51 · E3901.6 | Bathroom receptacle | 1 | 21 |
| 22 | 780 CMR 51 · E3902.1–E3902.11 | GFCI protection in wet locations | 0 | 28 |
| 23 | 780 CMR 51 · E3903.2 | Lighting outlet in habitable rooms | 6 | 34 |
| 24 | 780 CMR 51 · P2804.6.1 | Water heater relief valve discharge | 1 | 0 |
| 25 | 780 CMR 51 · R307.1, P2705.1 | Water closet front clearance | 0 | 24 |
| 26 | 780 CMR 51 · R311.7.1 | Stairway width | 0 | 3 |
| 27 | 780 CMR 51 · R311.7.5.1 | Stair riser height | 0 | 3 |
| 28 | 780 CMR 51 · R311.7.8.1 | Handrail height on stairs | 3 | 0 |
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
| clinic-001 | pass | Stair (1AS1 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |
| clinic-002 | pass | Stair (1CS3 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |
| clinic-003 | pass | Stair (1BS2 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |

## 3. 780 CMR 51 · R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-004 | pass | Stair (1AS1 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| clinic-005 | pass | Stair (1CS3 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| clinic-006 | pass | Stair (1BS2 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |

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
| clinic-007 | pass | 2D18 TECH. OFFICE | 0.00 m² openable (0.0 sq ft) for 82.1 m² floor | ≥ 3.28 m² (35.3 sq ft), 4% of floor area | A-102 |
| clinic-008 | pass | 2A11 DENTAL WAITING | 0.00 m² openable (0.0 sq ft) for 31.8 m² floor | ≥ 1.27 m² (13.7 sq ft), 4% of floor area | A-102 |
| clinic-009 | pass | 2D11 CMDR OFFICE | 0.00 m² openable (0.0 sq ft) for 14.5 m² floor | ≥ 0.58 m² (6.2 sq ft), 4% of floor area | A-102 |
| clinic-010 | pass | 1A07 TRICARE OFFICE | 0.00 m² openable (0.0 sq ft) for 8.0 m² floor | ≥ 0.32 m² (3.4 sq ft), 4% of floor area | A-101 |
| clinic-011 | pass | 2B01 OFFICE | 0.00 m² openable (0.0 sq ft) for 8.6 m² floor | ≥ 0.34 m² (3.7 sq ft), 4% of floor area | A-102 |
| clinic-012 | pass | 2C14 GEN. DENT. DTR #10 | 0.00 m² openable (0.0 sq ft) for 11.0 m² floor | ≥ 0.44 m² (4.8 sq ft), 4% of floor area | A-102 |
| clinic-013 | pass | 1E29 HK. SUPV. OFFICE | 0.00 m² openable (0.0 sq ft) for 9.9 m² floor | ≥ 0.40 m² (4.3 sq ft), 4% of floor area | A-101 |
| clinic-014 | pass | 2A02 SUPER OFFICE | 0.00 m² openable (0.0 sq ft) for 10.0 m² floor | ≥ 0.40 m² (4.3 sq ft), 4% of floor area | A-102 |
| clinic-015 | pass | 2C04 GEN. DENT. DTR #7 | 0.00 m² openable (0.0 sq ft) for 10.3 m² floor | ≥ 0.41 m² (4.4 sq ft), 4% of floor area | A-102 |
| clinic-016 | pass | 2C02 GEN. DENT. DTR #6 | 0.00 m² openable (0.0 sq ft) for 11.0 m² floor | ≥ 0.44 m² (4.7 sq ft), 4% of floor area | A-102 |
| clinic-017 | pass | 2A09 GEN. DENT. DTR #5 | 0.00 m² openable (0.0 sq ft) for 10.5 m² floor | ≥ 0.42 m² (4.5 sq ft), 4% of floor area | A-102 |
| clinic-018 | pass | 2A08 GEN. DENT. DTR #4 | 0.00 m² openable (0.0 sq ft) for 10.8 m² floor | ≥ 0.43 m² (4.7 sq ft), 4% of floor area | A-102 |
| clinic-019 | pass | 1A03 TRICARE OFFICE | 0.00 m² openable (0.0 sq ft) for 8.2 m² floor | ≥ 0.33 m² (3.5 sq ft), 4% of floor area | A-101 |
| clinic-020 | pass | 1A05 TRICARE OFFICE | 0.00 m² openable (0.0 sq ft) for 8.3 m² floor | ≥ 0.33 m² (3.6 sq ft), 4% of floor area | A-101 |
| clinic-021 | pass | 1A06 TRICARE OFFICE | 0.00 m² openable (0.0 sq ft) for 9.3 m² floor | ≥ 0.37 m² (4.0 sq ft), 4% of floor area | A-101 |
| clinic-022 | pass | 2A03 SEC. OFFICE | 0.00 m² openable (0.0 sq ft) for 14.8 m² floor | ≥ 0.59 m² (6.4 sq ft), 4% of floor area | A-102 |
| clinic-023 | pass | 2D09 ADMIN OFFICE | 0.00 m² openable (0.0 sq ft) for 13.3 m² floor | ≥ 0.53 m² (5.7 sq ft), 4% of floor area | A-102 |
| clinic-024 | pass | 2B19 OFFICE | 0.00 m² openable (0.0 sq ft) for 8.1 m² floor | ≥ 0.33 m² (3.5 sq ft), 4% of floor area | A-102 |
| clinic-025 | pass | 2C09 GEN. DENT. DTR #9 | 0.00 m² openable (0.0 sq ft) for 10.5 m² floor | ≥ 0.42 m² (4.5 sq ft), 4% of floor area | A-102 |
| clinic-026 | pass | 1E05 CHIEF LOG OFFICE | 0.00 m² openable (0.0 sq ft) for 9.2 m² floor | ≥ 0.37 m² (3.9 sq ft), 4% of floor area | A-101 |
| clinic-027 | pass | 1E28 FAC. MGR. OFFICE | 0.00 m² openable (0.0 sq ft) for 8.6 m² floor | ≥ 0.35 m² (3.7 sq ft), 4% of floor area | A-101 |
| clinic-028 | pass | 2A10 DENTAL WAITING | 0.00 m² openable (0.0 sq ft) for 7.3 m² floor | ≥ 0.29 m² (3.1 sq ft), 4% of floor area | A-102 |
| clinic-029 | pass | 2D17 CREDENTIALS MGR | 0.00 m² openable (0.0 sq ft) for 8.7 m² floor | ≥ 0.35 m² (3.7 sq ft), 4% of floor area | A-102 |
| clinic-030 | pass | 2D19 READINESS NCOIC OFFICE | 0.00 m² openable (0.0 sq ft) for 10.0 m² floor | ≥ 0.40 m² (4.3 sq ft), 4% of floor area | A-102 |
| clinic-031 | pass | 2B8 OFFICE / EXAM | 0.00 m² openable (0.0 sq ft) for 11.7 m² floor | ≥ 0.47 m² (5.1 sq ft), 4% of floor area | A-102 |
| clinic-032 | pass | 2B17 CL. UTL. / KITCHENET | 0.00 m² openable (0.0 sq ft) for 8.3 m² floor | ≥ 0.33 m² (3.6 sq ft), 4% of floor area | A-102 |
| clinic-033 | pass | 1A04 TRICARE OFFICE | 0.00 m² openable (0.0 sq ft) for 8.6 m² floor | ≥ 0.34 m² (3.7 sq ft), 4% of floor area | A-101 |
| clinic-034 | pass | 1A08 PHARM. OFFICE | 0.00 m² openable (0.0 sq ft) for 9.5 m² floor | ≥ 0.38 m² (4.1 sq ft), 4% of floor area | A-101 |
| clinic-035 | pass | 2A04 DENTAL SURGEON OFFICE | 0.00 m² openable (0.0 sq ft) for 14.9 m² floor | ≥ 0.60 m² (6.4 sq ft), 4% of floor area | A-102 |
| clinic-036 | pass | 2B7 TECH OFFICE | 0.00 m² openable (0.0 sq ft) for 9.2 m² floor | ≥ 0.37 m² (4.0 sq ft), 4% of floor area | A-102 |
| clinic-037 | pass | 2C06 GEN. DENT. DTR #8 | 0.00 m² openable (0.0 sq ft) for 10.9 m² floor | ≥ 0.44 m² (4.7 sq ft), 4% of floor area | A-102 |
| clinic-038 | pass | 1C15 PES ADMIN. OFFICE | 0.00 m² openable (0.0 sq ft) for 14.6 m² floor | ≥ 0.58 m² (6.3 sq ft), 4% of floor area | A-101 |
| clinic-039 | pass | 1B06 LAB OFFICE | 0.00 m² openable (0.0 sq ft) for 9.4 m² floor | ≥ 0.37 m² (4.0 sq ft), 4% of floor area | A-101 |
| clinic-040 | pass | 2B9 TECH OFFICE | 0.00 m² openable (0.0 sq ft) for 9.2 m² floor | ≥ 0.37 m² (3.9 sq ft), 4% of floor area | A-102 |

## 9. 780 CMR 51 · R303.3, M1505: Bathroom ventilation

- **Complies:** Each bathroom has a window of at least 3 sq ft, half of it openable, or a mechanical exhaust to the outdoors (50 cfm intermittent or 20 cfm continuous).
- **Violates:** A bathroom with no window and no exhaust fan or exhaust duct.
- **Fix:** Add a ceiling exhaust fan ducted to the outdoors (50 cfm intermittent).

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-050 | **FAIL** | 1A13 STAFF TOILET | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-060 | **FAIL** | 1D26 TOILET | 0 window(s), 0 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-041 | pass | 2C07 M. STAFF TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-042 | pass | 2C08 W. STAFF TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-043 | pass | 1D18 TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-044 | pass | 1B02 SPECIMEN TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-045 | pass | 1A12 M. TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-046 | pass | 1A09 W. TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-047 | pass | 2D13 TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-048 | pass | 2C23 M. TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-049 | pass | 1C12 TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-051 | pass | 1B11 STAFF TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-052 | pass | 2C24 W. TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-053 | pass | 2B22 M. TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-054 | pass | 1E10 M. TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-055 | pass | 1E12 ISOLATION TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-056 | pass | 2B5 W. TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-057 | pass | 1D14 SPECIMEN TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-058 | pass | 1B05 PAT. / STAFF TOILET | 0 window(s), 2 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-059 | pass | 1E09 W. TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |
| clinic-061 | pass | 2B6 STAFF TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-102 |
| clinic-062 | pass | 1D04 TOILET | 0 window(s), 1 exhaust device(s) | 3 sq ft window, half openable, or exhaust fan to outdoors | A-101 |

## 10. 780 CMR 51 · R307.1, P2705.1: Plumbing fixture clearances

- **Complies:** Water closets and lavatories at least 15 in (381 mm) from their centre to a side wall or obstruction, and at least 30 in (762 mm) centre to centre from an adjacent fixture.
- **Violates:** Fixtures set closer than 30 in apart, or less than 15 in from a side wall.
- **Fix:** Respace the fixtures to 30 in centres, or replace the pair of lavatories with one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-070 | **FAIL** | 1E12 ISOLATION TOILET | 336 mm (13.23 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-072 | **FAIL** | 1B02 SPECIMEN TOILET | 720 mm (28.35 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-105 | **FAIL** | 1D22 TEAM INTERACTION | 216 mm (8.50 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-117 | **FAIL** | 1D06 SCOPE WASH / DECON. | 311 mm (12.24 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-119 | **FAIL** | 1A10 LOUNGE | 370 mm (14.57 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-121 | **FAIL** | 1B19 RADIOGRAPHIC ROOM | 293 mm (11.54 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-122 | **FAIL** | 2B22 M. TOILET | 760 mm (29.92 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| clinic-126 | **FAIL** | 2D13 TOILET | 317 mm (12.47 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-141 | **FAIL** | 2C16 CERAMIC LAB | 347 mm (13.68 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-063 | pass | 1E10 M. TOILET | 924 mm (36.38 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-064 | pass | 1E10 M. TOILET | 471 mm (18.54 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-065 | pass | 1E10 M. TOILET | 1267 mm (49.88 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-066 | pass | 1E09 W. TOILET | 948 mm (37.32 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-067 | pass | 1E09 W. TOILET | 471 mm (18.54 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-068 | pass | 1E09 W. TOILET | 1243 mm (48.94 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-069 | pass | 1E12 ISOLATION TOILET | 1100 mm (43.31 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-071 | pass | 1E12 ISOLATION TOILET | 396 mm (15.59 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-073 | pass | 1B02 SPECIMEN TOILET | 436 mm (17.16 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-074 | pass | 1B02 SPECIMEN TOILET | 450 mm (17.72 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-075 | pass | 1B05 PAT. / STAFF TOILET | 930 mm (36.61 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-076 | pass | 1B05 PAT. / STAFF TOILET | 421 mm (16.57 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-077 | pass | 1B05 PAT. / STAFF TOILET | 439 mm (17.28 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-078 | pass | 1C12 TOILET | 1200 mm (47.24 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-079 | pass | 1C12 TOILET | 440 mm (17.32 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-080 | pass | 1C12 TOILET | 423 mm (16.65 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-081 | pass | 1D04 TOILET | 1100 mm (43.31 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-082 | pass | 1D04 TOILET | 470 mm (18.50 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-083 | pass | 1D04 TOILET | 396 mm (15.59 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-084 | pass | 1D14 SPECIMEN TOILET | 1100 mm (43.31 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-085 | pass | 1D14 SPECIMEN TOILET | 398 mm (15.67 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-086 | pass | 1D14 SPECIMEN TOILET | 434 mm (17.09 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-087 | pass | 1D18 TOILET | 426 mm (16.77 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-088 | pass | 1D18 TOILET | 423 mm (16.65 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-089 | pass | 1A09 W. TOILET | 1100 mm (43.31 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Water Closet - Flush Valve - Wall Mounted | ≥ 762 mm (30 in) | A-101 |
| clinic-090 | pass | 1A09 W. TOILET | 986 mm (38.82 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-091 | pass | 1A09 W. TOILET | 570 mm (22.44 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-092 | pass | 1A09 W. TOILET | 513 mm (20.20 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-093 | pass | 1A12 M. TOILET | 425 mm (16.73 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-094 | pass | 1A12 M. TOILET | 466 mm (18.35 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-095 | pass | 1A13 STAFF TOILET | 883 mm (34.76 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-096 | pass | 1A13 STAFF TOILET | 411 mm (16.18 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-097 | pass | 1A13 STAFF TOILET | 478 mm (18.82 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-098 | pass | 1B11 STAFF TOILET | 1048 mm (41.26 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-099 | pass | 1B11 STAFF TOILET | 412 mm (16.22 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-100 | pass | 1B11 STAFF TOILET | 412 mm (16.22 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-101 | pass | 1D26 TOILET | 1000 mm (39.37 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-101 |
| clinic-102 | pass | 1D26 TOILET | 426 mm (16.77 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-101 |
| clinic-103 | pass | 1D26 TOILET | 1206 mm (47.48 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-104 | pass | 1E01 HK EQUIP. STORAGE | 466 mm (18.35 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-106 | pass | 1E11 STAFF LOUNGE | 1236 mm (48.66 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-107 | pass | 1E24 RECEIVING / STORAGE | 4105 mm (161.63 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-108 | pass | 1B04 LAB | 5357 mm (210.91 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-109 | pass | 1B04 LAB | 752 mm (29.61 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-110 | pass | 1B03 BLOOD DRAW | 1686 mm (66.38 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-111 | pass | 1C16 ECG TEST | 813 mm (32.01 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-112 | pass | 1C09 FUNDUS CAMERA ROOM | 906 mm (35.67 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-113 | pass | 1C04 FITTING / DISP. | 426 mm (16.77 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-114 | pass | 1C10 OPT. EXAM / OFF. | 3350 mm (131.90 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-115 | pass | 1C07 OPT. EXAM / OFF. | 3390 mm (133.46 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-116 | pass | 1D05 TRMT RM. DIRTY PROC. | 1234 mm (48.58 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-118 | pass | 1D12 SPECIMEN COLL. LAB | 1936 mm (76.22 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-120 | pass | 1D40 IMMUNIZ'N ROOM | 1378 mm (54.25 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-101 |
| clinic-123 | pass | 2B22 M. TOILET | 433 mm (17.05 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-124 | pass | 2B22 M. TOILET | 1193 mm (46.97 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-125 | pass | 2D13 TOILET | 398 mm (15.67 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-127 | pass | 2C23 M. TOILET | 523 mm (20.60 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-128 | pass | 2C23 M. TOILET | 470 mm (18.50 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-129 | pass | 2C24 W. TOILET | 1900 mm (74.80 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Water Closet - Flush Valve - Wall Mounted | ≥ 762 mm (30 in) | A-102 |
| clinic-130 | pass | 2C24 W. TOILET | 457 mm (17.98 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-131 | pass | 2C24 W. TOILET | 475 mm (18.72 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-132 | pass | 2C24 W. TOILET | 470 mm (18.50 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-133 | pass | 2C08 W. STAFF TOILET | 447 mm (17.58 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-134 | pass | 2C07 M. STAFF TOILET | 447 mm (17.58 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-135 | pass | 2B6 STAFF TOILET | 900 mm (35.43 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| clinic-136 | pass | 2B6 STAFF TOILET | 431 mm (16.95 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-137 | pass | 2B6 STAFF TOILET | 1331 mm (52.38 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-138 | pass | 2B5 W. TOILET | 885 mm (34.84 in) centre to centre, Water Closet - Flush Valve - Wall Mounted and Lavatory - Oval | ≥ 762 mm (30 in) | A-102 |
| clinic-139 | pass | 2B5 W. TOILET | 456 mm (17.97 in) centre to side wall, Water Closet - Flush Valve - Wall Mounted | ≥ 381 mm (15 in) | A-102 |
| clinic-140 | pass | 2B5 W. TOILET | 1331 mm (52.38 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |
| clinic-142 | pass | 2C22 LOUNGE | 436 mm (17.17 in) centre to side wall, Lavatory - Oval | ≥ 381 mm (15 in) | A-102 |

## 11. 780 CMR 51 · R305.1: Minimum ceiling height in habitable rooms

- **Complies:** Habitable rooms, hallways and portions of basements with habitable space have a ceiling height of at least 7 ft (2134 mm); bathrooms and toilet rooms at least 6 ft 8 in (2032 mm).
- **Violates:** A habitable room with a finished ceiling under 7 ft.
- **Fix:** Raise the ceiling or reclassify the low space as non-habitable (storage) on the plans.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-143 | pass | 2D18 TECH. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-144 | pass | 2A11 DENTAL WAITING | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-145 | pass | 2D11 CMDR OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-146 | pass | 1A07 TRICARE OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-147 | pass | 2B01 OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-148 | pass | 2C14 GEN. DENT. DTR #10 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-149 | pass | 1E29 HK. SUPV. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-150 | pass | 2A02 SUPER OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-151 | pass | 2C04 GEN. DENT. DTR #7 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-152 | pass | 2C02 GEN. DENT. DTR #6 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-153 | pass | 2A09 GEN. DENT. DTR #5 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-154 | pass | 2A08 GEN. DENT. DTR #4 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-155 | pass | 1A03 TRICARE OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-156 | pass | 1A05 TRICARE OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-157 | pass | 1A06 TRICARE OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-158 | pass | 2A03 SEC. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-159 | pass | 2D09 ADMIN OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-160 | pass | 2B19 OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-161 | pass | 2C09 GEN. DENT. DTR #9 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-162 | pass | 1E05 CHIEF LOG OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-163 | pass | 1E28 FAC. MGR. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-164 | pass | 2A10 DENTAL WAITING | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-165 | pass | 2D17 CREDENTIALS MGR | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-166 | pass | 2D19 READINESS NCOIC OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-167 | pass | 2B8 OFFICE / EXAM | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-168 | pass | 2B17 CL. UTL. / KITCHENET | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-169 | pass | 1A04 TRICARE OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-170 | pass | 1A08 PHARM. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-171 | pass | 2A04 DENTAL SURGEON OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-172 | pass | 2B7 TECH OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-173 | pass | 2C06 GEN. DENT. DTR #8 | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |
| clinic-174 | pass | 1C15 PES ADMIN. OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-175 | pass | 1B06 LAB OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-101 |
| clinic-176 | pass | 2B9 TECH OFFICE | 2800 mm (110.24 in) | ≥ 2134 mm (7 ft) | A-102 |

## 12. 780 CMR 51 · R304.1: Minimum habitable room area

- **Complies:** Every habitable room has at least 70 sq ft (6.5 m²) of floor area (kitchens are exempt from the 70 sq ft minimum).
- **Violates:** A habitable room — other than a kitchen — smaller than 70 sq ft.
- **Fix:** Combine the undersized room with an adjacent space, or reclassify it as an alcove/closet.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-177 | pass | 2D18 TECH. OFFICE | 82.1 m² (883.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-178 | pass | 2A11 DENTAL WAITING | 31.8 m² (341.8 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-179 | pass | 2D11 CMDR OFFICE | 14.5 m² (155.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-180 | pass | 1A07 TRICARE OFFICE | 8.0 m² (85.8 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-181 | pass | 2B01 OFFICE | 8.6 m² (92.5 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-182 | pass | 2C14 GEN. DENT. DTR #10 | 11.0 m² (118.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-183 | pass | 1E29 HK. SUPV. OFFICE | 9.9 m² (107.1 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-184 | pass | 2A02 SUPER OFFICE | 10.0 m² (107.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-185 | pass | 2C04 GEN. DENT. DTR #7 | 10.3 m² (111.1 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-186 | pass | 2C02 GEN. DENT. DTR #6 | 11.0 m² (118.2 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-187 | pass | 2A09 GEN. DENT. DTR #5 | 10.5 m² (112.5 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-188 | pass | 2A08 GEN. DENT. DTR #4 | 10.8 m² (116.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-189 | pass | 1A03 TRICARE OFFICE | 8.2 m² (87.8 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-190 | pass | 1A05 TRICARE OFFICE | 8.3 m² (89.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-191 | pass | 1A06 TRICARE OFFICE | 9.3 m² (100.4 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-192 | pass | 2A03 SEC. OFFICE | 14.8 m² (159.1 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-193 | pass | 2D09 ADMIN OFFICE | 13.3 m² (143.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-194 | pass | 2B19 OFFICE | 8.1 m² (87.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-195 | pass | 2C09 GEN. DENT. DTR #9 | 10.5 m² (112.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-196 | pass | 1E05 CHIEF LOG OFFICE | 9.2 m² (98.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-197 | pass | 1E28 FAC. MGR. OFFICE | 8.6 m² (92.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-198 | pass | 2A10 DENTAL WAITING | 7.3 m² (78.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-199 | pass | 2D17 CREDENTIALS MGR | 8.7 m² (93.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-200 | pass | 2D19 READINESS NCOIC OFFICE | 10.0 m² (107.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-201 | pass | 2B8 OFFICE / EXAM | 11.7 m² (126.3 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-202 | pass | 1A04 TRICARE OFFICE | 8.6 m² (92.5 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-203 | pass | 1A08 PHARM. OFFICE | 9.5 m² (102.4 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-204 | pass | 2A04 DENTAL SURGEON OFFICE | 14.9 m² (160.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-205 | pass | 2B7 TECH OFFICE | 9.2 m² (99.4 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-206 | pass | 2C06 GEN. DENT. DTR #8 | 10.9 m² (117.6 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |
| clinic-207 | pass | 1C15 PES ADMIN. OFFICE | 14.6 m² (156.9 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-208 | pass | 1B06 LAB OFFICE | 9.4 m² (100.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-101 |
| clinic-209 | pass | 2B9 TECH OFFICE | 9.2 m² (98.7 sq ft) | ≥ 6.5 m² (70 sq ft) | A-102 |

## 13. 780 CMR 51 · R304.2: Minimum habitable room dimension

- **Complies:** Habitable rooms are at least 7 ft (2134 mm) in any horizontal direction.
- **Violates:** A habitable room with a least-width under 7 ft.
- **Fix:** Widen the room, or merge the narrow strip into the adjoining space.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-210 | pass | 2D18 TECH. OFFICE | 5616 mm (221.10 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-211 | pass | 2A11 DENTAL WAITING | 4191 mm (165 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-212 | pass | 2D11 CMDR OFFICE | 3653 mm (143.84 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-213 | pass | 1A07 TRICARE OFFICE | 2929 mm (115.31 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-214 | pass | 2B01 OFFICE | 2632 mm (103.62 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-215 | pass | 2C14 GEN. DENT. DTR #10 | 3320 mm (130.71 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-216 | pass | 1E29 HK. SUPV. OFFICE | 2439 mm (96.02 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-217 | pass | 2A02 SUPER OFFICE | 2472 mm (97.32 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-218 | pass | 2C04 GEN. DENT. DTR #7 | 3286 mm (129.37 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-219 | pass | 2C02 GEN. DENT. DTR #6 | 3286 mm (129.37 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-220 | pass | 2A09 GEN. DENT. DTR #5 | 3252 mm (128.03 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-221 | pass | 2A08 GEN. DENT. DTR #4 | 3286 mm (129.37 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-222 | pass | 1A03 TRICARE OFFICE | 2786 mm (109.69 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-223 | pass | 1A05 TRICARE OFFICE | 2886 mm (113.62 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-224 | pass | 1A06 TRICARE OFFICE | 3029 mm (119.25 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-225 | pass | 2A03 SEC. OFFICE | 3470 mm (136.61 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-226 | pass | 2D09 ADMIN OFFICE | 3400 mm (133.86 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-227 | pass | 2B19 OFFICE | 2372 mm (93.39 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-228 | pass | 2C09 GEN. DENT. DTR #9 | 3286 mm (129.37 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-229 | pass | 1E05 CHIEF LOG OFFICE | 2866 mm (112.83 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-230 | pass | 1E28 FAC. MGR. OFFICE | 2893 mm (113.90 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-231 | pass | 2A10 DENTAL WAITING | 2685 mm (105.71 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-232 | pass | 2D17 CREDENTIALS MGR | 2406 mm (94.72 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-233 | pass | 2D19 READINESS NCOIC OFFICE | 2791 mm (109.88 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-234 | pass | 2B8 OFFICE / EXAM | 2526 mm (99.45 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-235 | pass | 2B17 CL. UTL. / KITCHENET | 2406 mm (94.72 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-236 | pass | 1A04 TRICARE OFFICE | 2836 mm (111.65 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-237 | pass | 1A08 PHARM. OFFICE | 2744 mm (108.03 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-238 | pass | 2A04 DENTAL SURGEON OFFICE | 3506 mm (138.03 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-239 | pass | 2B7 TECH OFFICE | 2736 mm (107.72 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-240 | pass | 2C06 GEN. DENT. DTR #8 | 3286 mm (129.37 in) least width | ≥ 2134 mm (7 ft) | A-102 |
| clinic-241 | pass | 1C15 PES ADMIN. OFFICE | 3466 mm (136.46 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-242 | pass | 1B06 LAB OFFICE | 2503 mm (98.54 in) least width | ≥ 2134 mm (7 ft) | A-101 |
| clinic-243 | pass | 2B9 TECH OFFICE | 2716 mm (106.93 in) least width | ≥ 2134 mm (7 ft) | A-102 |

## 14. 780 CMR 51 · R303.1: Natural light in habitable rooms

- **Complies:** Glazing area opening to the outdoors of at least 8% of each habitable room’s floor area (artificial light at 6 fc is an accepted alternative).
- **Violates:** A habitable room whose total glazing is under 8% of its floor area.
- **Fix:** Enlarge or add a window, or document compliant artificial lighting for the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-244 | **FAIL** | 2D18 TECH. OFFICE | 0.00 m² glazing (0.0 sq ft) for 82.1 m² floor | ≥ 6.57 m² (70.7 sq ft), 8% of floor | A-102 |
| clinic-245 | **FAIL** | 2A11 DENTAL WAITING | 0.00 m² glazing (0.0 sq ft) for 31.8 m² floor | ≥ 2.54 m² (27.3 sq ft), 8% of floor | A-102 |
| clinic-246 | **FAIL** | 2D11 CMDR OFFICE | 0.00 m² glazing (0.0 sq ft) for 14.5 m² floor | ≥ 1.16 m² (12.5 sq ft), 8% of floor | A-102 |
| clinic-247 | **FAIL** | 1A07 TRICARE OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.0 m² floor | ≥ 0.64 m² (6.9 sq ft), 8% of floor | A-101 |
| clinic-248 | **FAIL** | 2B01 OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.6 m² floor | ≥ 0.69 m² (7.4 sq ft), 8% of floor | A-102 |
| clinic-249 | **FAIL** | 2C14 GEN. DENT. DTR #10 | 0.00 m² glazing (0.0 sq ft) for 11.0 m² floor | ≥ 0.88 m² (9.5 sq ft), 8% of floor | A-102 |
| clinic-250 | **FAIL** | 1E29 HK. SUPV. OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.9 m² floor | ≥ 0.80 m² (8.6 sq ft), 8% of floor | A-101 |
| clinic-251 | **FAIL** | 2A02 SUPER OFFICE | 0.00 m² glazing (0.0 sq ft) for 10.0 m² floor | ≥ 0.80 m² (8.6 sq ft), 8% of floor | A-102 |
| clinic-252 | **FAIL** | 2C04 GEN. DENT. DTR #7 | 0.00 m² glazing (0.0 sq ft) for 10.3 m² floor | ≥ 0.83 m² (8.9 sq ft), 8% of floor | A-102 |
| clinic-253 | **FAIL** | 2C02 GEN. DENT. DTR #6 | 0.00 m² glazing (0.0 sq ft) for 11.0 m² floor | ≥ 0.88 m² (9.5 sq ft), 8% of floor | A-102 |
| clinic-254 | **FAIL** | 2A09 GEN. DENT. DTR #5 | 0.00 m² glazing (0.0 sq ft) for 10.5 m² floor | ≥ 0.84 m² (9.0 sq ft), 8% of floor | A-102 |
| clinic-255 | **FAIL** | 2A08 GEN. DENT. DTR #4 | 0.00 m² glazing (0.0 sq ft) for 10.8 m² floor | ≥ 0.86 m² (9.3 sq ft), 8% of floor | A-102 |
| clinic-256 | **FAIL** | 1A03 TRICARE OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.2 m² floor | ≥ 0.65 m² (7.0 sq ft), 8% of floor | A-101 |
| clinic-257 | **FAIL** | 1A05 TRICARE OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.3 m² floor | ≥ 0.66 m² (7.1 sq ft), 8% of floor | A-101 |
| clinic-258 | **FAIL** | 1A06 TRICARE OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.3 m² floor | ≥ 0.75 m² (8.0 sq ft), 8% of floor | A-101 |
| clinic-259 | **FAIL** | 2A03 SEC. OFFICE | 0.00 m² glazing (0.0 sq ft) for 14.8 m² floor | ≥ 1.18 m² (12.7 sq ft), 8% of floor | A-102 |
| clinic-260 | **FAIL** | 2D09 ADMIN OFFICE | 0.00 m² glazing (0.0 sq ft) for 13.3 m² floor | ≥ 1.07 m² (11.5 sq ft), 8% of floor | A-102 |
| clinic-261 | **FAIL** | 2B19 OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.1 m² floor | ≥ 0.65 m² (7.0 sq ft), 8% of floor | A-102 |
| clinic-262 | **FAIL** | 2C09 GEN. DENT. DTR #9 | 0.00 m² glazing (0.0 sq ft) for 10.5 m² floor | ≥ 0.84 m² (9.0 sq ft), 8% of floor | A-102 |
| clinic-263 | **FAIL** | 1E05 CHIEF LOG OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.2 m² floor | ≥ 0.73 m² (7.9 sq ft), 8% of floor | A-101 |
| clinic-264 | **FAIL** | 1E28 FAC. MGR. OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.6 m² floor | ≥ 0.69 m² (7.4 sq ft), 8% of floor | A-101 |
| clinic-265 | **FAIL** | 2A10 DENTAL WAITING | 0.00 m² glazing (0.0 sq ft) for 7.3 m² floor | ≥ 0.58 m² (6.3 sq ft), 8% of floor | A-102 |
| clinic-266 | **FAIL** | 2D17 CREDENTIALS MGR | 0.00 m² glazing (0.0 sq ft) for 8.7 m² floor | ≥ 0.70 m² (7.5 sq ft), 8% of floor | A-102 |
| clinic-267 | **FAIL** | 2D19 READINESS NCOIC OFFICE | 0.00 m² glazing (0.0 sq ft) for 10.0 m² floor | ≥ 0.80 m² (8.6 sq ft), 8% of floor | A-102 |
| clinic-268 | **FAIL** | 2B8 OFFICE / EXAM | 0.00 m² glazing (0.0 sq ft) for 11.7 m² floor | ≥ 0.94 m² (10.1 sq ft), 8% of floor | A-102 |
| clinic-269 | **FAIL** | 2B17 CL. UTL. / KITCHENET | 0.00 m² glazing (0.0 sq ft) for 8.3 m² floor | ≥ 0.66 m² (7.1 sq ft), 8% of floor | A-102 |
| clinic-270 | **FAIL** | 1A04 TRICARE OFFICE | 0.00 m² glazing (0.0 sq ft) for 8.6 m² floor | ≥ 0.69 m² (7.4 sq ft), 8% of floor | A-101 |
| clinic-271 | **FAIL** | 1A08 PHARM. OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.5 m² floor | ≥ 0.76 m² (8.2 sq ft), 8% of floor | A-101 |
| clinic-272 | **FAIL** | 2A04 DENTAL SURGEON OFFICE | 0.00 m² glazing (0.0 sq ft) for 14.9 m² floor | ≥ 1.19 m² (12.9 sq ft), 8% of floor | A-102 |
| clinic-273 | **FAIL** | 2B7 TECH OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.2 m² floor | ≥ 0.74 m² (8.0 sq ft), 8% of floor | A-102 |
| clinic-274 | **FAIL** | 2C06 GEN. DENT. DTR #8 | 0.00 m² glazing (0.0 sq ft) for 10.9 m² floor | ≥ 0.87 m² (9.4 sq ft), 8% of floor | A-102 |
| clinic-275 | **FAIL** | 1C15 PES ADMIN. OFFICE | 0.00 m² glazing (0.0 sq ft) for 14.6 m² floor | ≥ 1.17 m² (12.6 sq ft), 8% of floor | A-101 |
| clinic-276 | **FAIL** | 1B06 LAB OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.4 m² floor | ≥ 0.75 m² (8.1 sq ft), 8% of floor | A-101 |
| clinic-277 | **FAIL** | 2B9 TECH OFFICE | 0.00 m² glazing (0.0 sq ft) for 9.2 m² floor | ≥ 0.73 m² (7.9 sq ft), 8% of floor | A-102 |

## 15. 780 CMR 51 · R311.3: Floor or landing at exterior doors

- **Complies:** A landing or floor on each side of every required egress door, no more than 1-1/2 in (38 mm) lower than the threshold, at least as wide as the door and 36 in (914 mm) deep in the direction of travel.
- **Violates:** An exterior egress door that opens into a room too shallow to hold a 36 in landing.
- **Fix:** Provide a 36 in deep landing at the door, or relocate the door to a space that can hold one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-282 | **FAIL** | 1E15-A GAS STORAGE | 609 mm (23.98 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-278 | pass | 1AC3 CORRIDOR | 2936 mm (115.59 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-279 | pass | 1AC5 CORRIDOR | 1322 mm (52.05 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-280 | pass | 1CC3 CORRIDOR | 2658 mm (104.65 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-281 | pass | 1E15 CENTRAL MECH. RM. | 4783 mm (188.31 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-283 | pass | 1E17 HAZ. STOR. | 2729 mm (107.44 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-284 | pass | 1E20 TRASH | 2583 mm (101.69 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-285 | pass | 1E21 FLAMABLE STORAGE | 1508 mm (59.35 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-286 | pass | 1E24 RECEIVING / STORAGE | 10276 mm (404.57 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-287 | pass | 1EC1 CORRIDOR | 1693 mm (66.65 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-288 | pass | 1EC4 CORRIDOR | 2145 mm (84.45 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-101 |
| clinic-289 | pass | 2D05 MAIN MECHANICAL ROOM | 13563 mm (533.98 in) clear in front of the door | ≥ 914 mm (36 in) landing depth | A-102 |

## 16. 780 CMR 51 · R311.2: Required egress door size

- **Complies:** At least one side-hinged egress door per dwelling, at least 32 in (813 mm) clear width and 78 in (1981 mm) clear height.
- **Violates:** A unit whose widest exterior door is under 32 in clear.
- **Fix:** Widen the main entry door to a 36 in leaf (≈ 34 in clear), or designate a compliant door as the egress door.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-290 | pass | Building entry | widest egress door 2702 mm (106.38 in) leaf | ≥ 813 mm (32 in) clear | A-101 |

## 17. 780 CMR 51 · R311.6: Minimum hallway width

- **Complies:** Hallways at least 3 ft (914 mm) wide.
- **Violates:** A corridor or hallway narrower than 36 in.
- **Fix:** Widen the hall to 36 in clear between finished wall faces.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-291 | pass | 1EC1 CORRIDOR | 1693 mm (66.65 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-292 | pass | 2AC3 CORRIDOR | 2777 mm (109.33 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-293 | pass | 1BC2 CORRIDOR | 2710 mm (106.69 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-294 | pass | 1CC1 CORRIDOR | 5373 mm (211.54 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-295 | pass | 1DC3 CORRIDOR | 2811 mm (110.67 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-296 | pass | 1BC4 CORRIDOR | 5370 mm (211.42 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-297 | pass | 2BC3 CORRIDOR | 1969 mm (77.54 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-298 | pass | 2BC5 CORRIDOR | 3283 mm (129.27 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-299 | pass | 2AC1 CORRIDOR | 5846 mm (230.16 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-300 | pass | 1CC3 CORRIDOR | 2658 mm (104.65 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-301 | pass | 1DC7 CORRIDOR | 2690 mm (105.91 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-302 | pass | 2BC2 CORRIDOR | 3000 mm (118.11 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-303 | pass | 2CC3 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-304 | pass | 1AC5 CORRIDOR | 1322 mm (52.05 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-305 | pass | 2DC2 CORRIDOR | 1875 mm (73.82 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-306 | pass | 1AC3 CORRIDOR | 2936 mm (115.59 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-307 | pass | 1DC6 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-308 | pass | 2CC2 CORRIDOR | 1772 mm (69.76 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-309 | pass | 2AC4 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-310 | pass | 1DC4 CORRIDOR | 1693 mm (66.65 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-311 | pass | 2CC1 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-312 | pass | 2CC4 CORRIDOR | 2370 mm (93.31 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-313 | pass | 2BC4 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-314 | pass | 1AC2 CORRIDOR | 4846 mm (190.79 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-315 | pass | 2AC2 CORRIDOR | 3601 mm (141.77 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-316 | pass | 2CC5 CORRIDOR | 1738 mm (68.43 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-317 | pass | 2DC1 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-318 | pass | 1EC4 CORRIDOR | 2145 mm (84.45 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-319 | pass | 1AC4 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-320 | pass | 1DC2 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-321 | pass | 1DC8 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-322 | pass | 1BC1 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-323 | pass | 1CC2 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-324 | pass | 1BC3 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-325 | pass | 2BC1 CORRIDOR | 3000 mm (118.11 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-326 | pass | 2BC6 CORRIDOR | 2709 mm (106.65 in) clear width | ≥ 914 mm (36 in) | A-102 |
| clinic-327 | pass | 1EC3 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-328 | pass | 1DC5 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-329 | pass | 1EC2 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-101 |
| clinic-330 | pass | 2AC5 CORRIDOR | 1710 mm (67.32 in) clear width | ≥ 914 mm (36 in) | A-102 |

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
| clinic-331 | pass | Stair (1AS1 STAIR) | a railing is present, guard ≈ 5684 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |
| clinic-332 | pass | Stair (1CS3 STAIR) | a railing is present, guard ≈ 5670 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |
| clinic-333 | pass | Stair (1BS2 STAIR) | a railing is present, guard ≈ 5698 mm | guard ≥ 914 mm (36 in) at open edges > 30 in | A-101 |

## 20. 780 CMR 51 · E3901.4: Kitchen counter receptacles

- **Complies:** A receptacle outlet serving each kitchen counter space, so no point along the counter wall line is more than 24 in (610 mm) from one (two or more outlets at a typical kitchen).
- **Violates:** A kitchen with fewer than two small-appliance receptacles modeled.
- **Fix:** Add counter-top receptacles on 20 A small-appliance branch circuits, spaced so every point is within 24 in of one.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-334 | pass | 2B17 CL. UTL. / KITCHENET | 6 receptacle(s) modeled | ≥ 2 counter receptacles, none > 24 in from a point on the counter | A-102 |

## 21. 780 CMR 51 · E3901.6: Bathroom receptacle

- **Complies:** At least one receptacle outlet within 36 in (914 mm) of the outside edge of each lavatory basin, on a 20 A circuit.
- **Violates:** A bathroom with a lavatory and no receptacle modeled.
- **Fix:** Add a GFCI-protected receptacle beside the lavatory on a dedicated 20 A bathroom circuit.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-346 | **FAIL** | 2C24 W. TOILET | 0 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-335 | pass | 2C07 M. STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-336 | pass | 2C08 W. STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-337 | pass | 1D18 TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-338 | pass | 1B02 SPECIMEN TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-339 | pass | 1A12 M. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-340 | pass | 1A09 W. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-341 | pass | 2D13 TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-342 | pass | 2C23 M. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-343 | pass | 1C12 TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-344 | pass | 1A13 STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-345 | pass | 1B11 STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-347 | pass | 2B22 M. TOILET | 2 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-348 | pass | 1E10 M. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-349 | pass | 1E12 ISOLATION TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-350 | pass | 2B5 W. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-351 | pass | 1D14 SPECIMEN TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-352 | pass | 1B05 PAT. / STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-353 | pass | 1E09 W. TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-354 | pass | 1D26 TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |
| clinic-355 | pass | 2B6 STAFF TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-102 |
| clinic-356 | pass | 1D04 TOILET | 1 receptacle(s) modeled | ≥ 1 receptacle within 36 in of the lavatory | A-101 |

## 22. 780 CMR 51 · E3902.1–E3902.11: GFCI protection in wet locations

- **Complies:** Receptacles in bathrooms, kitchens (serving counters), garages, and outdoors are GFCI-protected.
- **Violates:** A receptacle in a wet-location room with no GFCI protection noted.
- **Fix:** Protect the circuit with a GFCI breaker or GFCI receptacle.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-357 | pass | 1C12 TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-358 | pass | 1D04 TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-359 | pass | 1A09 W. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-360 | pass | 1B02 SPECIMEN TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-361 | pass | 1B05 PAT. / STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-362 | pass | 1B11 STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-363 | pass | 1A12 M. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-364 | pass | 1E10 M. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-365 | pass | 1E09 W. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-366 | pass | 1E12 ISOLATION TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-367 | pass | 1D26 TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-368 | pass | 1D14 SPECIMEN TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-369 | pass | 1D18 TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-370 | pass | 1A13 STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-101 |
| clinic-371 | pass | 2B22 M. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-372 | pass | 2B22 M. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-373 | pass | 2B5 W. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-374 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-375 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-376 | pass | 2B6 STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-377 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-378 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-379 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-380 | pass | 2B17 CL. UTL. / KITCHENET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-381 | pass | 2D13 TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-382 | pass | 2C08 W. STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-383 | pass | 2C07 M. STAFF TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |
| clinic-384 | pass | 2C23 M. TOILET | M_Duplex Receptacle: GFCI noted | GFCI protection in wet locations | A-102 |

## 23. 780 CMR 51 · E3903.2: Lighting outlet in habitable rooms

- **Complies:** At least one wall-switched lighting outlet in every habitable room, hallway, stairway, and bathroom.
- **Violates:** A habitable room with no luminaire or lighting outlet modeled.
- **Fix:** Add a switched lighting outlet (ceiling luminaire or switched receptacle) to the room.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-387 | **FAIL** | 1CS3 STAIR | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-392 | **FAIL** | 1E29 HK. SUPV. OFFICE | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-394 | **FAIL** | 2CS3 STAIR | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-402 | **FAIL** | 1BS2 STAIR | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-409 | **FAIL** | 1AS1 STAIR | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-419 | **FAIL** | 2BS2 STAIR | 0 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-385 | pass | 2D18 TECH. OFFICE | 18 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-386 | pass | 2A11 DENTAL WAITING | 2 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-388 | pass | 2D11 CMDR OFFICE | 5 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-389 | pass | 1A07 TRICARE OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-390 | pass | 2B01 OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-391 | pass | 2C14 GEN. DENT. DTR #10 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-393 | pass | 2A02 SUPER OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-395 | pass | 2C04 GEN. DENT. DTR #7 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-396 | pass | 2C02 GEN. DENT. DTR #6 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-397 | pass | 2A09 GEN. DENT. DTR #5 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-398 | pass | 2A08 GEN. DENT. DTR #4 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-399 | pass | 1A03 TRICARE OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-400 | pass | 1A05 TRICARE OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-401 | pass | 1A06 TRICARE OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-403 | pass | 2A03 SEC. OFFICE | 4 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-404 | pass | 2D09 ADMIN OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-405 | pass | 2B19 OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-406 | pass | 2C09 GEN. DENT. DTR #9 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-407 | pass | 1E05 CHIEF LOG OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-408 | pass | 1E28 FAC. MGR. OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-410 | pass | 2A10 DENTAL WAITING | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-411 | pass | 2D17 CREDENTIALS MGR | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-412 | pass | 2D19 READINESS NCOIC OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-413 | pass | 2B8 OFFICE / EXAM | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-414 | pass | 2B17 CL. UTL. / KITCHENET | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-415 | pass | 1A04 TRICARE OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-416 | pass | 1A08 PHARM. OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-417 | pass | 2A04 DENTAL SURGEON OFFICE | 4 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-418 | pass | 2B7 TECH OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-420 | pass | 2C06 GEN. DENT. DTR #8 | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-421 | pass | 1C15 PES ADMIN. OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-422 | pass | 1B06 LAB OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-101 |
| clinic-423 | pass | 2B9 TECH OFFICE | 1 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |
| clinic-424 | pass | 2AS1 STAIR | 8 lighting outlet(s) | ≥ 1 switched lighting outlet | A-102 |

## 24. 780 CMR 51 · P2804.6.1: Water heater relief valve discharge

- **Complies:** Each water heater has a temperature-and-pressure relief valve with a discharge pipe run to a safe location.
- **Violates:** A water heater with no relief-valve discharge modeled or noted.
- **Fix:** Provide a T&P relief valve and a full-size discharge pipe terminating per P2804.6.1.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-425 | **FAIL** | 2D05 MAIN MECHANICAL ROOM | M_Water Heater: no relief discharge noted | T&P relief valve with discharge to a safe location | A-102 |

## 25. 780 CMR 51 · R307.1, P2705.1: Water closet front clearance

- **Complies:** At least 21 in (533 mm) of clear space in front of a water closet, lavatory, or bidet.
- **Violates:** A water closet with less than 21 in of clear floor in front of it.
- **Fix:** Reposition the fixture or enlarge the room to give 21 in of front clearance.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-426 | pass | 1E10 M. TOILET | 1421 mm (55.94 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-427 | pass | 1E09 W. TOILET | 1421 mm (55.94 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-428 | pass | 1E12 ISOLATION TOILET | 2289 mm (90.12 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-429 | pass | 1B02 SPECIMEN TOILET | 2590 mm (101.97 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-430 | pass | 1B05 PAT. / STAFF TOILET | 2106 mm (82.91 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-431 | pass | 1C12 TOILET | 2396 mm (94.33 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-432 | pass | 1D04 TOILET | 2080 mm (81.89 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-433 | pass | 1D14 SPECIMEN TOILET | 1916 mm (75.43 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-434 | pass | 1D18 TOILET | 3013 mm (118.64 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-435 | pass | 1A09 W. TOILET | 3106 mm (122.28 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-436 | pass | 1A09 W. TOILET | 3013 mm (118.62 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-437 | pass | 1A12 M. TOILET | 3106 mm (122.28 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-438 | pass | 1A13 STAFF TOILET | 1972 mm (77.64 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-439 | pass | 1B11 STAFF TOILET | 2106 mm (82.91 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-440 | pass | 1D26 TOILET | 1426 mm (56.14 in) clear in front | ≥ 533 mm (21 in) | A-101 |
| clinic-441 | pass | 2B22 M. TOILET | 1584 mm (62.36 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-442 | pass | 2D13 TOILET | 1856 mm (73.05 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-443 | pass | 2C23 M. TOILET | 1186 mm (46.69 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-444 | pass | 2C24 W. TOILET | 2750 mm (108.27 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-445 | pass | 2C24 W. TOILET | 2750 mm (108.27 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-446 | pass | 2C08 W. STAFF TOILET | 1296 mm (51.02 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-447 | pass | 2C07 M. STAFF TOILET | 2160 mm (85.04 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-448 | pass | 2B6 STAFF TOILET | 1596 mm (62.83 in) clear in front | ≥ 533 mm (21 in) | A-102 |
| clinic-449 | pass | 2B5 W. TOILET | 1296 mm (51.02 in) clear in front | ≥ 533 mm (21 in) | A-102 |

## 26. 780 CMR 51 · R311.7.1: Stairway width

- **Complies:** Stairways at least 36 in (914 mm) wide above the handrail height, with no more than one handrail projecting 4-1/2 in.
- **Violates:** A stair flight narrower than 36 in.
- **Fix:** Widen the stair opening and flight to at least 36 in clear.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-450 | pass | Stair (1AS1 STAIR) | 1000 mm (39.37 in) wide | ≥ 914 mm (36 in) | A-101 |
| clinic-451 | pass | Stair (1CS3 STAIR) | 1000 mm (39.37 in) wide | ≥ 914 mm (36 in) | A-101 |
| clinic-452 | pass | Stair (1BS2 STAIR) | 1000 mm (39.37 in) wide | ≥ 914 mm (36 in) | A-101 |

## 27. 780 CMR 51 · R311.7.5.1: Stair riser height

- **Complies:** Risers no more than 7-3/4 in (196 mm) high, the tallest and shortest within 3/8 in of each other.
- **Violates:** Any riser taller than 7-3/4 in.
- **Fix:** Add a riser to the flight to lower each step, or re-cut the stringers.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-453 | pass | Stair (1AS1 STAIR) | 176 mm (6.92 in) risers | ≤ 196 mm (7-3/4 in) | A-101 |
| clinic-454 | pass | Stair (1CS3 STAIR) | 176 mm (6.92 in) risers | ≤ 196 mm (7-3/4 in) | A-101 |
| clinic-455 | pass | Stair (1BS2 STAIR) | 176 mm (6.92 in) risers | ≤ 196 mm (7-3/4 in) | A-101 |

## 28. 780 CMR 51 · R311.7.8.1: Handrail height on stairs

- **Complies:** Handrails 34–38 in (864–965 mm) above the stair nosings, continuous the full length of each flight of four or more risers.
- **Violates:** A stair of four or more risers with no handrail, or one outside 34–38 in.
- **Fix:** Add a graspable handrail at 34–38 in above the nosings for the full flight.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-456 | **FAIL** | Stair (1AS1 STAIR) | railing ≈ 5684 mm (223.78 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |
| clinic-457 | **FAIL** | Stair (1CS3 STAIR) | railing ≈ 5670 mm (223.23 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |
| clinic-458 | **FAIL** | Stair (1BS2 STAIR) | railing ≈ 5698 mm (224.34 in) tall | 864–965 mm (34–38 in) above the nosings | A-101 |

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
