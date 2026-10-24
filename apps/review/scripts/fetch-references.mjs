#!/usr/bin/env node
// Downloads the documents published with the sample models into
// public/reference/<model>/: the other discipline models, COBie
// spreadsheets, discipline images, manufacturer product data and O&M
// documents. The list and sources live in public/reference/sources.json.
// They total about 370 MB and keep their publishers' terms, so they stay out
// of git; the generated floor plans in public/reference/*/drawings are
// committed.
//
//   bun run references            download any that are missing
//   bun run references --force    download all of them again

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const referenceDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'reference')
const manifest = JSON.parse(readFileSync(join(referenceDir, 'sources.json'), 'utf8'))
const force = process.argv.includes('--force')

// Large files sit in Git LFS (media URL); small ones are plain blobs (raw URL).
const bases = [
  `https://media.githubusercontent.com/media/${manifest.repository}/main/`,
  `https://raw.githubusercontent.com/${manifest.repository}/main/`,
]

async function download(entry) {
  const dest = join(referenceDir, entry.path)
  if (!force && existsSync(dest) && statSync(dest).size === entry.bytes) return 'present'
  const sourcePath = entry.source.split('/').map(encodeURIComponent).join('/')
  let lastError = 'not found'
  for (const base of bases) {
    try {
      const res = await fetch(base + sourcePath, { redirect: 'follow' })
      if (!res.ok) {
        lastError = `HTTP ${res.status}`
        continue
      }
      const bytes = new Uint8Array(await res.arrayBuffer())
      const head = new TextDecoder().decode(bytes.slice(0, 40))
      if (head.startsWith('version https://git-lfs')) {
        lastError = 'got a Git LFS pointer instead of the file'
        continue
      }
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, bytes)
      return 'downloaded'
    } catch (err) {
      lastError = err.message
    }
  }
  throw new Error(lastError)
}

let failed = 0
let downloaded = 0
const queue = [...manifest.files]
async function worker() {
  for (let entry = queue.shift(); entry; entry = queue.shift()) {
    try {
      if ((await download(entry)) === 'downloaded') {
        downloaded++
        console.log(`[references] ${entry.path}`)
      }
    } catch (err) {
      failed++
      console.error(`[references] could not download ${entry.path}: ${err.message}`)
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker))

console.log(`[references] ${downloaded} downloaded, ${manifest.files.length - downloaded - failed} already present, ${failed} failed`)
if (failed) process.exit(1)
