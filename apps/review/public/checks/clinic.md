# Medical-Dental Clinic: code review

2021 International Residential Code (IRC), checked against `clinic.ifc` and its discipline models on 2026-10-24 by `scripts/check_code.py`. Each finding names the element to select in the model and where it is on the floor plan.

**11 violations** across 10 rules (131 checks passed).

| # | Section | Rule | Violations | Passed |
| ---: | --- | --- | ---: | ---: |
| 1 | R310.1, R310.2 | Emergency escape and rescue opening in every sleeping room | 0 | 0 |
| 2 | R311.7.5.2 | Stair tread depth | 0 | 3 |
| 3 | R311.7.5.3 | Stair nosing projection | 0 | 3 |
| 4 | R308.4.3 | Safety glazing in hazardous window locations | 0 | 0 |
| 5 | R302.3 | Two-family dwelling separation | 0 | 0 |
| 6 | R314.3 | Smoke alarm locations | 0 | 0 |
| 7 | R315.2.1, R315.3 | Carbon monoxide alarms where there are fuel-burning appliances | 0 | 0 |
| 8 | R303.1 | Habitable room ventilation | 0 | 34 |
| 9 | R303.3, M1505 | Bathroom ventilation | 2 | 20 |
| 10 | R307.1, P2705.1 | Plumbing fixture clearances | 9 | 71 |

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
| clinic-001 | pass | Stair (1AS1 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |
| clinic-002 | pass | Stair (1CS3 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |
| clinic-003 | pass | Stair (1BS2 STAIR) | 280 mm (11.02 in) | ≥ 254 mm (10 in) | A-101 |

## 3. R311.7.5.3: Stair nosing projection

- **Complies:** Where treads are under 11 in deep, a nosing of 3/4 in to 1-1/4 in (19–32 mm) on every tread of a stair with solid risers, uniform within 3/8 in.
- **Violates:** Treads under 11 in with no nosing or one under 3/4 in.
- **Fix:** Specify a 25 mm (1 in) nosing on every tread, or deepen treads to 11 in where no nosing is wanted.

| Finding | Result | Where | Measured | Required | Sheet |
| --- | --- | --- | --- | --- | --- |
| clinic-004 | pass | Stair (1AS1 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| clinic-005 | pass | Stair (1CS3 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |
| clinic-006 | pass | Stair (1BS2 STAIR) | 0 mm (0 in) nosing on 280 mm treads | 19–32 mm (3/4–1-1/4 in) when treads < 279 mm (11 in) | A-101 |

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

## 9. R303.3, M1505: Bathroom ventilation

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

## 10. R307.1, P2705.1: Plumbing fixture clearances

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
