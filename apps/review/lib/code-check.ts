/** Shape of the JSON files written by scripts/check_code.py into public/checks/. */

export type CheckTarget = {
  globalId: string
  ifcClass: string
  name: string
  model: string
}

export type CheckSheet = {
  number: string
  page: number
  x: number
  y: number
}

export type CheckFinding = {
  id: string
  rule: string
  status: 'fail' | 'pass'
  target: CheckTarget
  storey: string
  room: string
  measured: string
  required: string
  message: string
  /** IFC model coords [x, y, z] in metres, Z up. */
  point: [number, number, number]
  /** Related elements (e.g. windows inside a bedroom). */
  related?: CheckTarget[]
  sheet?: CheckSheet
}

export type CheckRule = {
  id: string
  section: string
  title: string
  complies: string
  violates: string
  fix: string
  fail: number
  pass: number
}

export type CheckReport = {
  version: number
  building: string
  title: string
  code: string
  model: string
  generated: string
  coordinates: string
  summary: { rules: number; fail: number; pass: number }
  rules: CheckRule[]
  findings: CheckFinding[]
}

/** Fetch the pre-generated check report for a building id (e.g. "duplex").
 *  Returns null if the file doesn't exist yet. */
export async function fetchCheckReport(buildingId: string): Promise<CheckReport | null> {
  try {
    const res = await fetch(`/checks/${buildingId}.json`)
    if (!res.ok) return null
    return (await res.json()) as CheckReport
  } catch {
    return null
  }
}
