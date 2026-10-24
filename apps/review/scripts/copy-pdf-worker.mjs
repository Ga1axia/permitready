#!/usr/bin/env node
// pdf.js needs its worker served as a static URL. Copy it into public/.

import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function findPdfjs(startDir) {
  let dir = startDir
  while (dir && dir !== '/') {
    const candidate = join(dir, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs')
    if (existsSync(candidate)) return candidate
    dir = resolve(dir, '..')
  }
  return null
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const worker = findPdfjs(scriptDir)
if (!worker) {
  console.error('[review] pdfjs-dist worker not found')
  process.exit(1)
}
const publicDir = join(scriptDir, '..', 'public')
mkdirSync(publicDir, { recursive: true })
const dest = join(publicDir, 'pdf.worker.min.mjs')
const same = existsSync(dest) && statSync(dest).size === statSync(worker).size
if (!same) {
  copyFileSync(worker, dest)
  console.log('[review] copied pdf.worker.min.mjs → public/')
}
