'use client'

// Registers Pascal's built-in node kinds on the client before any <Viewer>.
import '../lib/bootstrap'
import type { ReactNode } from 'react'

export function ClientBootstrap({ children }: { children: ReactNode }) {
  return children
}
