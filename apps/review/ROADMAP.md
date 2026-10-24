# Code Review 3D: Phased Rollout

## What we are building

A browser-based 3D viewer that loads a building model, checks it against code,
and shows every failure on the building itself: the measured value, the
required value, the code section, and a suggested fix.

- **Who uses it:** plan reviewers at building departments, and designers who
  want to check a model before they submit it.
- **The one job:** turn a code-check report into something a reviewer can see
  in 10 seconds and trust in 60.
- **What it is not:** a general AI that reads any PDF and checks every rule. It
  runs exact, geometric rules on 3D models (IFC), one rule family at a time,
  and every result shows how it was measured.
- **First rule family:** egress (door widths, corridor widths, stairs, travel
  distance to an exit). It is geometric, it reads well in 3D, and all three
  sample models have the doors, stairs and rooms it needs.

## How the rollout works

The phases run strictly one at a time. A phase starts only after the one
before it passes its gate, and every phase ends in something people can see
on screen.

Phase 2 builds the whole visual experience on hand-written sample findings,
so the demo exists before the rule engine does. Phases 3 and 4 then replace
the sample data with real measurements and real checks without changing what
people see.

```
1. See the building ──gate──▶ 2. See the problems ──gate──▶ 3. Measure the building
        (built)                  (demo ready here)
──gate──▶ 4. Real checks replace the samples ──gate──▶ 5. See the fix ──gate──▶ 6. Pilot
```

| Phase | What you see | Gate to the next phase | Status |
| --- | --- | --- | --- |
| 1. See the building | Spin, slice and click through all three models | A new user finds a 2nd-floor door unaided | Built |
| 2. See the problems | Red elements, dimension tags, exit paths (sample data) | Top 5 clinic issues explained in under 2 minutes | Next |
| 3. Measure the building | Real widths, stairs, rooms and the escape network | Measurements match a manual check | |
| 4. Real checks replace the samples | Same visuals, driven by the rule engine | Hand check agrees, no unexplained flags | |
| 5. See the fix | Ghost fixes, recheck to green, export the letter | Clinic review to letter in under 30 minutes | |
| 6. Pilot on real models | Users' own projects, measured against today's process | A pilot user keeps using it | |

Pseudocode below is TypeScript-flavored and names the files each phase adds.
It describes intent, not final signatures.

---

## Phase 1: See the building (built)

**What you see:** pick the office, the duplex or the clinic and it opens in 3D.
You can spin it, show one floor at a time, cut the walls away, and click any
door or wall to see what it is.

What was built:

1. A gallery of the three sample models, plus **Open IFC** and drag-and-drop
   for your own file. IFC is converted in the browser by
   `@pascal-app/ifc-converter`.
2. Pascal's `<Viewer>` with orbit, pan and zoom, and a camera that frames the
   building from a three-quarter view once its geometry settles.
3. A floor picker: pick a floor and everything above it is hidden.
4. Wall modes: Full, Cutaway, Plan (walls cut low) and X-ray.
5. An element list by floor and kind, with search. Clicking an element
   isolates its floor and frames it from above.
6. An inspector with measurements (ft-in or metres), IFC class, GlobalId and
   property sets.
7. A 2D drawing set per sample building (cover, floor plans, room, door and
   window schedules), generated from the model and linked to it element by
   element, shown in a PDF pane beside the 3D view: a click on either side
   selects the same room, door or window. See `public/reference/README.md`.

```ts
// components/ReviewApp.tsx: open a model
async function openSample(sample: Sample) {
  const graph = await loadModelFromUrl(sample.file, onProgress) // one conversion per model, cached
  setGraph(graph) // ModelViewer pushes it into Pascal's scene store
}

// components/ModelViewer.tsx: frame an element
function focusElement(id: string) {
  isolateFloor(levelOf(nodes, id))     // hide floors above
  camera.rotateTo(azimuth, LOOK_DOWN)  // look down into the room
  camera.fitToSphere(bounds(id).expandBy(1.5))
}
```

**Gate passed when:** all three models open and spin smoothly on a normal
laptop, and someone new to the tool finds a specific door on the second floor
without help.

**Still open from Phase 1:** a free section plane you can drag through the
building (today the Cutaway and Plan wall modes do this job), and testing
the office model end to end.

---

## Phase 2: See the problems

**What you see:** the building turns into a map of problems. Failing doors and
stairs glow red, dimension tags float beside them ("30 in, needs 32 in"), and
an animated line shows the walk from the farthest room to the nearest exit,
with its distance. An issue list sits beside the model; clicking an issue
flies the camera to it.

The findings in this phase are hand-written sample data, about 10 per model,
in exactly the format the rule engine will produce later. This gets the demo
working first and fixes the contract between the engine and the viewer.

The drawing set from Phase 1 is linked by GlobalId too, so every finding can
also be marked on its plan and schedule row, beside the 3D view.

Steps:

1. Define one findings format: element, rule, measured value, required value,
   status, code section, and the 3D points to draw.
2. Hand-write a findings file for each sample model, keyed by IFC GlobalId so
   it survives re-conversion. Every finding shows a "Sample finding" badge.
3. Color elements by status: red for fail, amber for needs review, a quiet
   tone for pass, gray for not checked.
4. Draw the overlays: dimension lines with tags, stair rise and run callouts,
   clearance boxes in front of doors, and the exit path as an animated line.
5. Add an issue list with filters for floor, rule and status. Clicking a row
   flies the camera to the element and opens its detail card.
6. Add a summary bar with counts per floor, and a floor heatmap shaded by how
   many issues each floor has.

New files:

| File | Job |
| --- | --- |
| `lib/findings.ts` | The `Finding` type and helpers (group by floor, count by status) |
| `public/findings/<model>.json` | Hand-written sample findings |
| `components/FindingsLayer.tsx` | Inside the Canvas: element tinting and 3D overlays |
| `components/IssueList.tsx` | The list, filters and summary bar |

```ts
// lib/findings.ts
type Status = 'fail' | 'review' | 'pass'

type Finding = {
  id: string
  globalId: string            // IFC GlobalId; mapped to a Pascal node id on load
  ruleId: string              // 'door-clear-width'
  title: string               // 'Door narrower than required'
  measured: number            // metres
  required: number            // metres
  comparison: '>=' | '<='
  status: Status
  codeRef: string             // 'IBC 1010.1.1' (edition shown on screen)
  overlay:
    | { kind: 'dimension'; from: Vec3; to: Vec3 }
    | { kind: 'path'; points: Vec3[] }
    | { kind: 'clearance'; min: Vec3; max: Vec3 }
  isSample: boolean           // true for all of Phase 2
}

// components/FindingsLayer.tsx (inside <Viewer>)
function FindingsLayer({ findings }: { findings: Finding[] }) {
  const nodeIdFor = useGlobalIdIndex()          // GlobalId -> Pascal node id
  // Pascal draws host-owned highlights without touching the user's selection.
  useEffect(() => {
    useViewer.getState().setExternalSelectedIds(
      findings.filter((f) => f.status === 'fail').map((f) => nodeIdFor(f.globalId)),
    )
  }, [findings])
  return findings.map((f) => <Overlay key={f.id} finding={f} label={tagText(f, unit)} />)
}

function Overlay({ finding, label }) {
  switch (finding.overlay.kind) {
    case 'dimension': return <DimensionLine {...finding.overlay} label={label} />
    case 'path':      return <AnimatedPath points={finding.overlay.points} label={label} />
    case 'clearance': return <TranslucentBox {...finding.overlay} />
  }
}

// components/IssueList.tsx
function onIssueClick(f: Finding) {
  const id = nodeIdFor(f.globalId)
  selectNode(nodes, id)            // the same path the element list uses today
  openDetailCard(f)                // measured, required, code section, "Sample finding" badge
}
```

**Gate to Phase 3:** in a timed test, a person who hasn't seen the tool before
finds and explains the top 5 issues in the clinic in under 2 minutes. This
version is also the investor and customer demo.

---

## Phase 3: Measure the building

**What you see:** click any door, stair, corridor or room and its real
measurements appear on the model: clear width, rise and run, ceiling height,
area. A "connections" view draws lines between rooms through their doors, so
you can see the building's escape network.

Pascal's converter already gives us door widths and heights, wall geometry,
room outlines (zones) and floor heights in the browser. This phase reads
measurements from that scene graph, and reads the raw IFC (through web-ifc)
only for values the converter drops, such as stair riser and tread.

Steps:

1. Build a `BuildingData` model from the Pascal scene graph: doors, rooms,
   walls, stairs and floors, all in metres.
2. Derive clear width from the door's overall width minus its frame, using
   `Pset_DoorCommon` values when the model provides them.
3. Read stair riser, tread and width from the IFC stair flights.
4. Build the room graph: rooms are nodes, doors are links, exterior doors are
   exits.
5. Show the measurements as on-model dimension tags (reusing the Phase 2
   overlays) and the room graph as an optional layer.
6. When a model lacks data a check needs, such as rooms that were never
   modeled, show a gray "missing data" badge instead of guessing.

New files: `lib/measure.ts`, `lib/room-graph.ts`, `components/NetworkLayer.tsx`.

```ts
// lib/measure.ts
function measureBuilding(nodes: NodeMap, ifc: IfcApi): BuildingData {
  const data: BuildingData = { doors: [], rooms: [], stairs: [], gaps: [] }

  for (const door of nodesOfKind(nodes, 'door')) {
    data.doors.push({
      id: door.id,
      globalId: meta(door).globalId,
      floor: levelOf(nodes, door.id),
      overallWidth: door.width,
      clearWidth: door.width - frameAllowance(door),   // Pset_DoorCommon when present
      height: door.height,
      connects: roomsEitherSide(door, nodes),           // zone polygons on each side of the host wall
      isExterior: roomsEitherSide(door, nodes).length < 2,
    })
  }
  for (const zone of nodesOfKind(nodes, 'zone')) {
    data.rooms.push({ id: zone.id, name: zone.name, area: polygonArea(zone.polygon), outline: zone.polygon })
  }
  for (const flight of ifc.byType('IfcStairFlight')) {
    data.stairs.push({ globalId: flight.GlobalId, riser: flight.RiserHeight, tread: flight.TreadLength, width: flightWidth(flight) })
  }

  if (data.rooms.length === 0) data.gaps.push('No rooms modeled: travel-distance checks unavailable')
  data.graph = buildRoomGraph(data.rooms, data.doors)   // lib/room-graph.ts
  return data
}
```

**Gate to Phase 4:** element counts and 20 spot-checked measurements per model
match a manual check, and every missing-data case is flagged rather than
guessed.

---

## Phase 4: Real checks replace the samples

**What you see:** the same red doors, tags, exit paths and issue list as
Phase 2, but the "Sample finding" badges are gone. Every finding now comes from
a real check, and its detail card shows how it was computed.

Steps:

1. Write each rule as a small data file: what it measures, the limit, which
   elements it applies to, and its code section and edition.
2. Start with about 8 egress rules: door clear width, corridor width, stair
   riser, stair tread, stair width, headroom, exits per floor, and exit access
   travel distance.
3. Run every rule against the Phase 3 data and output findings in the Phase 2
   format, so the viewer doesn't change.
4. For travel distance, run a shortest-path search on the room graph and
   return the path's 3D points for the animated line.
5. Give each rule a tiny test model that must pass and one that must fail.
6. Add "How this was checked" to the detail card: inputs, formula, code
   section.

New files: `rules/egress/*.yaml`, `lib/rule-engine.ts`, `lib/rule-engine.test.ts`.

```yaml
# rules/egress/door-clear-width.yaml: a rule is data, not code
id: door-clear-width
appliesTo: doors
when: door.isEgress
measure: door.clearWidth
require: ">= 32 in"
codeRef: IBC 1010.1.1
edition: 2021          # set per jurisdiction
fixHint: widenDoor
```

```ts
// lib/rule-engine.ts
function runChecks(data: BuildingData, rules: Rule[]): Finding[] {
  const findings: Finding[] = []
  for (const rule of rules) {
    for (const el of select(data, rule.appliesTo, rule.when)) {
      const value = evaluate(rule.measure, el)
      if (value === undefined) {
        findings.push(finding(el, rule, { status: 'review', note: 'missing data' }))
        continue
      }
      const ok = compare(value, rule.require)
      findings.push(finding(el, rule, { measured: value, status: ok ? 'pass' : 'fail', overlay: overlayFor(rule, el) }))
    }
  }
  return findings
}

function checkTravelDistance(data: BuildingData, limit: number): Finding[] {
  return data.rooms.map((room) => {
    const path = shortestPath(data.graph, farthestPoint(room), ANY_EXIT)
    return finding(room, 'travel-distance', {
      measured: path.length,
      status: path.length <= limit ? 'pass' : 'fail',
      overlay: { kind: 'path', points: path.points3d },
    })
  })
}

// The Phase 2 viewer call stays the same; only the data source changes:
<FindingsLayer findings={runChecks(measureBuilding(nodes, ifc), loadRules('egress'))} />
```

**Gate to Phase 5:** on all three models, results match a hand check by
someone who knows the code, with no unexplained false positives.

---

## Phase 5: See the fix

**What you see:** click **Show fix** on a failing door and a translucent ghost
of the corrected door appears in place, 36 in wide instead of 30. Click
**Recheck** and it turns from red to green. When the reviewer is done, the
tool produces a comment letter with a 3D snapshot of each issue.

Steps:

1. For each rule's fix hint, generate a proposed change: widen a door, adjust
   a stair riser, or mark where a second exit is needed.
2. Draw the fix as a ghost overlay beside the original, with a before/after
   toggle.
3. Rerun only the affected checks on the proposed change and animate the
   color change. The original model is never modified.
4. Let the reviewer accept, reject or edit each finding, and add their own
   comment.
5. Export a PDF comment letter with a snapshot per issue, plus a BCF file
   (the open standard for model issues) so designers can open each issue in
   Revit or ArchiCAD.

New files: `lib/fixes.ts`, `components/FixPreview.tsx`, `lib/export-letter.ts`, `lib/export-bcf.ts`.

```ts
// lib/fixes.ts
function proposeFix(f: Finding, data: BuildingData): Fix {
  switch (f.fixHint) {
    case 'widenDoor':   return { nodeId: f.nodeId, patch: { width: f.required + frameAllowance } }
    case 'adjustStair': return { nodeId: f.nodeId, patch: { riser: f.required } }
    case 'addExit':     return { marker: bestWallForExit(f, data) }   // a marker, not geometry
  }
}

// components/FixPreview.tsx
function showFix(f: Finding) {
  const fix = proposeFix(f, data)
  renderGhost(applyVirtual(fix, nodes))                  // translucent copy; scene store untouched
  const after = runChecks(applyVirtual(fix, data), rulesFor(f))
  animateStatus(f.nodeId, f.status, after.status)        // red -> green
}

// lib/export-letter.ts + lib/export-bcf.ts
async function exportReview(findings: Finding[], notes: ReviewerNotes) {
  const kept = findings.filter((f) => notes.decision(f) !== 'rejected')
  for (const f of kept) f.snapshot = await captureView(viewFor(f))
  return { pdf: commentLetter(project, kept, notes), bcf: bcfZip(kept.map(bcfTopic)) }
}
```

**Gate to Phase 6:** a full review of the clinic, from opening the model to the
exported letter, takes under 30 minutes, and the BCF file opens correctly in
at least one BIM tool.

---

## Phase 6: Pilot on real models

**What you see:** a pilot user opens their own project and gets the same 3D
review they saw in the demo. A dashboard shows, per project, how long the
review took, how many findings the reviewer kept, and which rules they asked
for next.

Steps:

1. Put the tool in front of 2–3 plan reviewers or design firms using their own
   IFC models.
2. Track review time against their current process, findings kept versus
   rejected, and how often data is missing.
3. Collect requests for the next rule family and rank them by how often they
   come up.
4. Add the next rule family (likely accessibility clearances or room
   dimensions) with the same rule format and the same visual layer.

```ts
// lib/pilot-metrics.ts
on('model-opened',    (p) => log(p.id, 'opened', now()))
on('review-exported', (p) => log(p.id, 'exported', now()))
on('finding-decided', (f) => log(f.ruleId, f.decision))
on('rule-requested',  (text) => requests.add(text))

function pilotReport() {
  return {
    reviewMinutes: median(byProject((p) => p.exported - p.opened)),
    keptRate:      shareBy(decisions, 'ruleId', (d) => d === 'kept'),   // low = a noisy rule to fix or drop
    missingData:   share(findings, (f) => f.note === 'missing data'),
    nextRules:     rankByCount(requests),
  }
}
```

**Gate to a paid rollout:** at least one pilot user wants to keep using the
tool, every rule keeps most of its findings, and the next rule family is
chosen from real requests.

---

## Risks and open questions

- **Model quality varies.** Real submissions often lack room objects or label
  doors inconsistently. Phase 3 reports what is missing instead of guessing.
- **Pascal's IFC converter is early alpha.** Some elements land in the wrong
  place (curtain-wall pieces in the clinic) and stairs come in as plain
  meshes. Fixes there are worth contributing upstream.
- **Code text is copyrighted.** The IBC belongs to the ICC. We can cite
  section numbers and thresholds; showing the full text needs a license.
- **Code editions differ by jurisdiction.** Every rule carries an edition, and
  the demo states on screen which edition it uses.
- **Liability.** The tool flags issues for a reviewer to confirm; it never
  approves or rejects a design.
- **Most small projects still submit 2D PDFs.** Early customers are larger
  commercial and public projects and BIM-heavy firms.

Open questions:

- [ ] Which jurisdiction and code edition is the demo based on?
- [ ] Is the first buyer a building department, or a design firm checking its own work?
- [ ] Do we add a fourth, larger model (the Esplanades apartments) for performance testing?
