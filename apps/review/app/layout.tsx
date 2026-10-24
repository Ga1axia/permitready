import type { ReactNode } from 'react'
import { ClientBootstrap } from './client-bootstrap'
import './globals.css'

export const metadata = {
  title: 'Code Review 3D',
  description:
    'Review building models in 3D: open an IFC model, explore it floor by floor, and inspect any element.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientBootstrap>{children}</ClientBootstrap>
      </body>
    </html>
  )
}
