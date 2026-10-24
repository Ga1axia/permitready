# Code-check engine — Requirements

Spec for PermitReady's building-code checker. Phase 1 of the Kiro spec
workflow (requirements → design → tasks).

## Problem

Reviewers need to see, per sample building, which elements violate the code
that governs it, and jump to each violation in both the 3D model and the floor
plan. The code enforced in Boston is the Massachusetts State Building Code
(780 CMR); its Residential Volume (780 CMR 51.00, 10th Ed.) adopts the 2021 IRC
with Massachusetts amendments.

## Requirements (EARS-style)

1. **Run for any sample.** WHEN a user selects a sample and runs checks, the
   system SHALL load a pre-generated report for that building, or report that
   none exists. All three samples (duplex, office, clinic) SHALL have a report.
2. **Cite the governing code.** The report SHALL name the code as 780 CMR and
   cite each rule's section as `780 CMR 51 · <section>`.
3. **Selectable, locatable findings.** Each finding SHALL carry a
   `target.globalId` (so the app selects the element in 3D), a model-space
   point, and, when available, a floor-plan sheet position.
4. **Pass / fail per element.** Each rule SHALL return one finding per element
   or room it examined, marked `pass` or `fail`.
5. **Degrade gracefully.** WHERE a sample lacks the elements a rule needs (e.g.
   the office has no MEP devices), that rule SHALL yield no findings rather
   than erroring or reporting false positives.
6. **Stable machine contract.** The JSON SHALL stay `version: 1` with
   `summary`, `rules`, and `findings`, so the app's `fetchCheckReport` keeps
   working across regenerations.
7. **Automated and reproducible.** `bun run check` with no arguments SHALL run
   every sample and write both `<building>.json` and a readable `<building>.md`.

## Non-goals

- Not a certified plan-review tool; thresholds are the 780 CMR ones but the
  output is a review aid, not a legal determination.
- No live in-browser rule evaluation — reports are generated offline and shipped.
