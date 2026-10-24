import { convertIfcToPascal, type PascalSceneGraph } from '@pascal-app/ifc-converter'

export type LoadProgress = (message: string, percent: number) => void

export class ModelMissingError extends Error {
  constructor(public readonly file: string) {
    super(`${file} is not in public/models yet`)
  }
}

type Entry = { promise: Promise<PascalSceneGraph>; listeners: Set<LoadProgress> }

// Converting the clinic takes several seconds. A second request for the same
// model, while it converts or after, shares the one conversion: switching
// back to a model is instant, and React's development double-mount doesn't
// convert twice. Every caller still receives progress.
const cache = new Map<string, Entry>()

export function loadModelFromUrl(url: string, onProgress: LoadProgress): Promise<PascalSceneGraph> {
  const existing = cache.get(url)
  if (existing) {
    existing.listeners.add(onProgress)
    return existing.promise
  }

  const listeners = new Set<LoadProgress>([onProgress])
  const report: LoadProgress = (message, percent) => {
    for (const listener of listeners) listener(message, percent)
  }
  const promise = (async () => {
    report('Downloading model', 2)
    const res = await fetch(url)
    if (res.status === 404) throw new ModelMissingError(url)
    if (!res.ok) throw new Error(`Could not download ${url} (HTTP ${res.status})`)
    return convertBytes(new Uint8Array(await res.arrayBuffer()), report)
  })()
  cache.set(url, { promise, listeners })
  promise.then(
    () => listeners.clear(),
    () => cache.delete(url),
  )
  return promise
}

export async function loadModelFromFile(
  file: File,
  onProgress: LoadProgress,
): Promise<PascalSceneGraph> {
  onProgress('Reading file', 2)
  return convertBytes(new Uint8Array(await file.arrayBuffer()), onProgress)
}

async function convertBytes(bytes: Uint8Array, onProgress: LoadProgress) {
  const head = new TextDecoder().decode(bytes.slice(0, 32))
  if (!head.startsWith('ISO-10303-21')) {
    throw new Error('This is not an IFC file. Export the model as IFC2x3 or IFC4 and try again.')
  }
  // web-ifc loads its WASM from the app root (copied there by
  // scripts/copy-web-ifc-wasm.mjs).
  return convertIfcToPascal(bytes, onProgress, { wasmPath: '/' })
}
