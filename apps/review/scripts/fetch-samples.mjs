#!/usr/bin/env node
// Downloads / refreshes the three sample models into public/models/.
// Those IFCs are committed and ship with the deploy; this script is for
// restoring a clean checkout or updating from upstream. Sources and credits:
// lib/samples.ts and public/models/ATTRIBUTION.md.
//
//   bun run samples            download any that are missing
//   bun run samples --force    download all of them again

import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SAMPLES = [
  {
    file: 'kit-office.ifc',
    url: 'http://www.ifcwiki.org/images/9/98/AC20-Institute-Var-2.ifc',
  },
  {
    file: 'duplex.ifc',
    url: 'https://media.githubusercontent.com/media/buildingsmart-community/Community-Sample-Test-Files/main/IFC%202.3.0.1%20(IFC%202x3)/Duplex%20Apartment/Duplex_A_20110907.ifc',
  },
  {
    file: 'clinic.ifc',
    url: 'https://media.githubusercontent.com/media/buildingsmart-community/Community-Sample-Test-Files/main/IFC%202.3.0.1%20(IFC%202x3)/Medical-Dental%20Clinic/Clinic_Architectural.ifc',
  },
]

const force = process.argv.includes('--force')
const modelsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models')
mkdirSync(modelsDir, { recursive: true })

let failed = 0
for (const { file, url } of SAMPLES) {
  const dest = join(modelsDir, file)
  if (!force && existsSync(dest) && statSync(dest).size > 0) {
    console.log(`[samples] ${file} already present`)
    continue
  }
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    // A Git LFS pointer instead of the model means the media URL was wrong.
    const head = new TextDecoder().decode(bytes.slice(0, 64))
    if (!head.startsWith('ISO-10303-21')) throw new Error('response is not an IFC file')
    writeFileSync(dest, bytes)
    console.log(`[samples] ${file} (${(bytes.length / 1e6).toFixed(1)} MB)`)
  } catch (err) {
    failed++
    console.error(`[samples] could not download ${file} from ${url}: ${err.message}`)
  }
}

if (failed) {
  console.error(`[samples] ${failed} model(s) missing; the app shows how to add them by hand.`)
  process.exit(1)
}
