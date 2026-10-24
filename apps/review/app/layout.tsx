import type { ReactNode } from 'react'
import { ClientBootstrap } from './client-bootstrap'
import './globals.css'

export const metadata = {
  title: 'PermitReady',
  description:
    'Permit review with drawings and 3D side by side — open an IFC model next to its plans, select in either pane, and keep both linked.',
  icons: {
    icon: '/brand/mark.png',
    apple: '/brand/mark.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientBootstrap>{children}</ClientBootstrap>
      </body>
    </html>
  )
}
