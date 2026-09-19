import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'GoHealTrail — Discover Malaysia’s Wild Side',
  description:
    'Plan, track, and safely enjoy outdoor trips across Malaysia. Trail discovery, weather-aware readiness, offline maps, SOS and community updates.',
}

export const viewport: Viewport = {
  themeColor: '#04110c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
