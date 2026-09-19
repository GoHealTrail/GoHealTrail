'use client'

import { Mountain, Heart } from 'lucide-react'

const LINKS = [
  { label: 'Trails', href: '#trails' },
  { label: 'Planner', href: '#planner' },
  { label: 'Community', href: '#community' },
  { label: 'Safety', href: '#safety' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-forest-900/50 py-12">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-mint-400 to-forest-600 text-forest-950">
              <Mountain className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div>
              <p className="font-semibold text-mist">GoHealTrail</p>
              <p className="text-xs text-mist-dim">Malaysia outdoor trails platform</p>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-4">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-mist-dim transition-colors hover:text-mint-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-mist-dim">
            Built with
            <Heart className="h-3 w-3 text-coral-400" fill="currentColor" />
            for Malaysia&apos;s outdoor community
          </p>
        </div>
      </div>
    </footer>
  )
}
