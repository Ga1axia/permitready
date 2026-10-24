'use client'

import { useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  type CheckFinding,
  type CheckReport,
  type CheckRule,
  fetchCheckReport,
} from '@/lib/code-check'
import { planSheetForStorey, useDrawingSet } from '@/lib/drawing-sets'
import { buildGlobalIdIndex } from '@/lib/global-id-index'
import { levelOf } from '@/lib/node-info'
import { useReview } from '@/lib/review-store'
import { applyViolationHighlight, clearViolationHighlight } from '@/lib/violation-highlight'

// ─── helpers ───────────────────────────────────────────────────────────────

type Status = 'idle' | 'loading' | 'done' | 'error'

function statusBadge(fail: number) {
  if (fail === 0)
    return (
      <span className="flex items-center gap-1 rounded-full bg-pass/15 px-2 py-0.5 font-medium text-[10px] text-pass">
        <CheckCircle className="size-3" />
        Compliant
      </span>
    )
  return (
    <span className="flex items-center gap-1 rounded-full bg-fail/15 px-2 py-0.5 font-medium text-[10px] text-fail">
      <XCircle className="size-3" />
      {fail} violation{fail !== 1 ? 's' : ''}
    </span>
  )
}

// ─── code viewer ───────────────────────────────────────────────────────────

function CodeRef({ report }: { report: CheckReport }) {
  return (
    <div className="rounded-lg border border-rule bg-paper px-3 py-2.5">
      <p className="font-medium text-ink text-xs">{report.code}</p>
      <p className="mt-1 text-[11px] text-ink-faint leading-relaxed">
        Checked against <span className="font-mono text-ink-soft">{report.model}</span> on{' '}
        {report.generated}.
      </p>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-panel px-2 py-1.5">
          <dt className="text-[10px] text-ink-faint uppercase tracking-[0.06em]">Rules</dt>
          <dd className="font-mono font-semibold text-ink text-sm">{report.summary.rules}</dd>
        </div>
        <div className="rounded-md bg-fail/10 px-2 py-1.5">
          <dt className="text-[10px] text-fail/80 uppercase tracking-[0.06em]">Violations</dt>
          <dd className="font-mono font-semibold text-fail text-sm">{report.summary.fail}</dd>
        </div>
        <div className="rounded-md bg-pass/10 px-2 py-1.5">
          <dt className="text-[10px] text-pass/80 uppercase tracking-[0.06em]">Passed</dt>
          <dd className="font-mono font-semibold text-pass text-sm">{report.summary.pass}</dd>
        </div>
      </dl>
    </div>
  )
}

// ─── single finding row ────────────────────────────────────────────────────

function FindingRow({
  finding,
  onSelect,
}: {
  finding: CheckFinding
  onSelect: (finding: CheckFinding) => void
}) {
  const isFail = finding.status === 'fail'
  return (
    <button
      className={[
        'group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-paper',
        isFail ? 'hover:bg-fail/5' : '',
      ].join(' ')}
      onClick={() => onSelect(finding)}
      type="button"
      title="Select in model"
    >
      {isFail ? (
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-fail" />
      ) : (
        <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-pass" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[11px] text-ink leading-snug">{finding.room}</p>
        <p className="mt-0.5 text-[10px] text-ink-soft leading-relaxed line-clamp-2">
          {isFail ? finding.message : `${finding.room} — passes`}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-ink-faint">
          <span>
            <span className="font-medium">Got:</span> {finding.measured}
          </span>
          <span>
            <span className="font-medium">Need:</span> {finding.required}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── single rule accordion ─────────────────────────────────────────────────

function RuleAccordion({
  rule,
  findings,
  onSelect,
  onActivateRule,
}: {
  rule: CheckRule
  findings: CheckFinding[]
  onSelect: (finding: CheckFinding) => void
  /** Called with the failing findings when the rule is expanded, null when collapsed. */
  onActivateRule: (findings: CheckFinding[] | null) => void
}) {
  const fails = findings.filter((f) => f.status === 'fail')
  const passes = findings.filter((f) => f.status === 'pass')
  const [open, setOpen] = useState(rule.fail > 0)
  const [showPasses, setShowPasses] = useState(false)

  // Emit on first render if this rule starts open (has failures).
  useEffect(() => {
    if (open && fails.length > 0) onActivateRule(fails)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    onActivateRule(next && fails.length > 0 ? fails : null)
  }

  return (
    <div className="border-rule border-b last:border-b-0">
      <button
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-paper"
        onClick={toggle}
        type="button"
      >
        {open ? (
          <ChevronDown className="size-3.5 shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-ink-faint" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-xs text-ink">{rule.title}</span>
          <span className="block text-[10px] text-ink-faint">{rule.section}</span>
        </span>
        {statusBadge(rule.fail)}
      </button>

      {open && (
        <div className="pb-1">
          {/* Rule text */}
          <div className="mx-3 mb-2 rounded-md border border-rule/60 bg-paper px-3 py-2 text-[11px] text-ink-soft leading-relaxed">
            <p>
              <span className="font-medium text-pass">✓ Complies:</span> {rule.complies}
            </p>
            <p className="mt-1">
              <span className="font-medium text-fail">✗ Violates:</span> {rule.violates}
            </p>
            {rule.fail > 0 && (
              <p className="mt-1">
                <span className="font-medium text-ink">Fix:</span> {rule.fix}
              </p>
            )}
          </div>

          {/* Failures */}
          {fails.length > 0 && (
            <div className="px-1">
              {fails.map((f) => (
                <FindingRow finding={f} key={f.id} onSelect={onSelect} />
              ))}
            </div>
          )}

          {/* Passing rows — collapsed by default */}
          {passes.length > 0 && (
            <div className="px-1">
              <button
                className="ml-2 mt-1 flex items-center gap-1 text-[10px] text-ink-faint hover:text-ink"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPasses((v) => !v)
                }}
                type="button"
              >
                {showPasses ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
                {passes.length} passing check{passes.length !== 1 ? 's' : ''}
              </button>
              {showPasses &&
                passes.map((f) => <FindingRow finding={f} key={f.id} onSelect={onSelect} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── main panel ────────────────────────────────────────────────────────────

type Props = {
  /** The building / sample id, e.g. "duplex". Null when a custom IFC is loaded. */
  buildingId: string | null
}

export function CodeCheckPanel({ buildingId }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [report, setReport] = useState<CheckReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Rules being stepped through while status === 'loading', and how many have
  // finished — drives the "checking through codes" progress list.
  const [checkingRules, setCheckingRules] = useState<CheckRule[]>([])
  const [checkingIndex, setCheckingIndex] = useState(0)
  const checkRun = useRef(0)
  const nodes = useScene((s) => s.nodes) as Record<string, import('@pascal-app/core').AnyNode>
  const focusNode = useReview((s) => s.focusNode)
  const setViolationIds = useReview((s) => s.setViolationIds)
  const setViolationMarkers = useReview((s) => s.setViolationMarkers)
  const drawingSet = useDrawingSet((s) => s.open)

  /** GlobalId → scene node id index, rebuilt whenever the scene changes. */
  const gidIndex = useMemo(() => buildGlobalIdIndex(nodes), [nodes])

  /** Resolve a list of findings' primary GlobalIds to scene node ids. */
  const resolveIds = (findings: CheckFinding[]): string[] => {
    const ids: string[] = []
    for (const f of findings) {
      const id = gidIndex.get(f.target.globalId)
      if (id) ids.push(id)
    }
    return ids
  }

  // Clear violation highlights and cancel any staged check when the panel
  // unmounts or the building changes. buildingId is an intentional trigger so
  // switching samples mid-check tears the old run down.
  // biome-ignore lint/correctness/useExhaustiveDependencies: buildingId re-runs cleanup on sample switch.
  useEffect(() => {
    return () => {
      checkRun.current++ // cancel any in-flight staged check
      clearViolationHighlight()
      setViolationIds([])
      setViolationMarkers([])
    }
  }, [setViolationIds, setViolationMarkers, buildingId])

  const runChecks = async () => {
    const id = buildingId
    if (!id) return
    const run = ++checkRun.current
    setStatus('loading')
    setError(null)
    setReport(null)
    setCheckingRules([])
    setCheckingIndex(0)
    clearViolationHighlight()
    setViolationIds([])
    setViolationMarkers([])
    const result = await fetchCheckReport(id)
    if (run !== checkRun.current) return
    if (!result) {
      setError(`No check report found for "${id}". Run scripts/check_code.py ${id} first.`)
      setStatus('error')
      return
    }

    // Walk the rules one at a time so the check reads as deliberate work —
    // each code section lights up as it's "evaluated" before results appear.
    // Total stays a few seconds regardless of how many rules there are.
    const rules = result.rules
    setCheckingRules(rules)
    const total = 2400
    const perRule = rules.length > 0 ? Math.min(650, Math.max(220, total / rules.length)) : 0
    for (let i = 0; i < rules.length; i++) {
      await new Promise((r) => setTimeout(r, perRule))
      if (run !== checkRun.current) return
      setCheckingIndex(i + 1)
    }
    // A final beat so the last row reads as "done" before the report shows.
    await new Promise((r) => setTimeout(r, 260))
    if (run !== checkRun.current) return

    setReport(result)
    setStatus('done')
  }

  /** Highlight all failing findings for a rule; null clears the highlight. */
  const activateRule = (findings: CheckFinding[] | null) => {
    if (!findings || findings.length === 0) {
      // Both: synchronous material restore + store record clear
      clearViolationHighlight()
      setViolationIds([])
      setViolationMarkers([])
      return
    }
    const ids = resolveIds(findings)
    // Synchronous — no React state cycle, no rAF
    applyViolationHighlight(ids)
    // Store record so ViolationEmphasis can re-sync if the canvas remounts
    setViolationIds(ids)

    // Build markers for all failing findings that have sheet coords.
    const markers = findings
      .filter((f) => f.sheet)
      .map((f) => ({
        findingId: f.id,
        globalId: f.target.globalId,
        page: f.sheet!.page,
        x: f.sheet!.x,
        y: f.sheet!.y,
        active: false,
      }))
    setViolationMarkers(markers)

    // Jump the PDF to the plan sheet for the first failing finding's storey.
    const first = findings[0]
    if (first?.storey && drawingSet) {
      const sheet = planSheetForStorey(drawingSet, first.storey)
      if (sheet) {
        const review = useReview.getState()
        if (review.pdfOpen) review.setPdfPage(sheet.page)
      }
    }
  }

  /** Select the primary element of a finding in the 3D model and highlight it. */
  const selectFinding = (finding: CheckFinding) => {
    const nodeId = gidIndex.get(finding.target.globalId)
    if (!nodeId) return

    const node = nodes[nodeId]
    if (!node) return

    const level = levelOf(nodes, nodeId)
    const isRoom = node.type === 'zone'
    useViewer.getState().setSelection({
      levelId: (level?.id ?? null) as never,
      zoneId: (isRoom ? nodeId : null) as never,
      selectedIds: (isRoom ? [] : [nodeId]) as never,
    })
    focusNode(nodeId)

    // Synchronous highlight — single material swap, no async hops
    applyViolationHighlight([nodeId])
    setViolationIds([nodeId])

    // Update markers — mark this finding active, keep others as context
    setViolationMarkers(
      useReview
        .getState()
        .violationMarkers.map((m) => ({ ...m, active: m.findingId === finding.id })),
    )

    // Jump PDF to the right floor plan page
    if (finding.sheet) {
      const review = useReview.getState()
      if (review.pdfOpen) {
        review.setPdfPage(finding.sheet.page)
        review.bumpPdfFocus()
      }
    }
  }

  // Group findings by rule id
  const findingsByRule = useMemo(() => {
    if (!report) return new Map<string, CheckFinding[]>()
    const map = new Map<string, CheckFinding[]>()
    for (const f of report.findings) {
      const list = map.get(f.rule)
      if (list) list.push(f)
      else map.set(f.rule, [f])
    }
    return map
  }, [report])

  // ── idle / no building ──
  if (!buildingId) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
        <ShieldCheck className="size-8 text-ink-faint" />
        <p className="text-ink-soft text-xs leading-relaxed">
          Code checks are available for the sample buildings. Open a sample to run the checker.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* ── header / run button ── */}
      <div className="sticky top-0 z-10 flex items-center gap-2 border-rule border-b bg-panel px-3 py-2.5">
        <ClipboardList className="size-4 shrink-0 text-ink-soft" />
        <span className="flex-1 font-medium text-ink text-xs">Code Check</span>
        {status === 'done' && report && statusBadge(report.summary.fail)}
        <button
          className={[
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs transition-colors',
            status === 'loading'
              ? 'cursor-wait bg-accent/70 text-white'
              : 'bg-accent text-white hover:bg-accent/90',
          ].join(' ')}
          disabled={status === 'loading'}
          onClick={runChecks}
          type="button"
        >
          {status === 'loading' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : status === 'done' ? (
            <RefreshCw className="size-3.5" />
          ) : (
            <ShieldCheck className="size-3.5" />
          )}
          {status === 'loading' ? 'Checking…' : status === 'done' ? 'Re-run' : 'Run checks'}
        </button>
      </div>

      {/* ── body ── */}
      {status === 'idle' && (
        <p className="px-4 py-6 text-center text-ink-faint text-xs leading-relaxed">
          Click <strong className="font-medium text-ink-soft">Run checks</strong> to load the code
          review findings for this building.
        </p>
      )}

      {status === 'loading' && (
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2 px-3 py-3 text-ink-soft text-xs">
            <Loader2 className="size-3.5 animate-spin text-accent" />
            {checkingRules.length === 0
              ? 'Loading code requirements…'
              : `Checking ${Math.min(checkingIndex + 1, checkingRules.length)} of ${checkingRules.length} requirements…`}
          </div>
          <div className="border-rule border-t">
            {checkingRules.map((rule, i) => {
              const done = i < checkingIndex
              const current = i === checkingIndex
              return (
                <div
                  className={[
                    'flex items-center gap-2 px-3 py-2 transition-colors',
                    done ? 'opacity-100' : current ? 'opacity-100' : 'opacity-40',
                  ].join(' ')}
                  key={rule.id}
                >
                  {done ? (
                    <CheckCircle className="size-3.5 shrink-0 text-pass" />
                  ) : current ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-accent" />
                  ) : (
                    <ShieldCheck className="size-3.5 shrink-0 text-ink-faint" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-[11px] text-ink">
                      {rule.title}
                    </span>
                    <span className="block text-[10px] text-ink-faint">{rule.section}</span>
                  </span>
                  <span className="font-mono text-[10px] text-ink-faint tabular-nums">
                    {done ? '✓' : current ? '…' : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="m-3 rounded-lg border border-fail/30 bg-fail/10 px-3 py-2.5">
          <p className="font-medium text-fail text-xs">Could not load report</p>
          <p className="mt-1 text-[11px] text-ink-soft leading-relaxed">{error}</p>
        </div>
      )}

      {status === 'done' && report && (
        <div className="flex flex-col gap-0">
          {/* code reference block */}
          <div className="px-3 py-3">
            <CodeRef report={report} />
          </div>

          {/* rules with findings */}
          <div className="border-rule border-t">
            <h3 className="px-3 py-2 font-medium text-[10px] text-ink-faint uppercase tracking-[0.08em]">
              Findings by rule
            </h3>
            {report.rules.map((rule) => (
              <RuleAccordion
                findings={findingsByRule.get(rule.id) ?? []}
                key={rule.id}
                onActivateRule={activateRule}
                onSelect={selectFinding}
                rule={rule}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
