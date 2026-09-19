'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, TriangleAlert, OctagonAlert, X } from 'lucide-react'
import { demoAlerts, trails } from '../lib/data'
import { cn } from '../lib/utils'

const severityStyles: Record<string, { icon: React.ReactNode; chip: string; bar: string }> = {
  info: {
    icon: <Info className="h-4 w-4 text-river-300" />,
    chip: 'border-river-400/30 bg-river-400/10 text-river-300',
    bar: 'bg-river-400',
  },
  warning: {
    icon: <TriangleAlert className="h-4 w-4 text-sunrise-400" />,
    chip: 'border-sunrise-400/30 bg-sunrise-400/10 text-sunrise-300',
    bar: 'bg-sunrise-400',
  },
  danger: {
    icon: <OctagonAlert className="h-4 w-4 text-coral-400" />,
    chip: 'border-coral-500/30 bg-coral-500/10 text-coral-400',
    bar: 'bg-coral-500',
  },
}

export function AlertsBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || demoAlerts.length === 0) return null

  const items = [...demoAlerts, ...demoAlerts] // duplicate for seamless marquee

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="relative z-40 border-b border-white/5 bg-forest-900/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-mist-dim">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-coral-500" />
            Alerts
          </div>

          {/* Marquee */}
          <div className="relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee gap-8 hover:[animation-play-state:paused]">
              {items.map((alert, i) => {
                const style = severityStyles[alert.level] ?? severityStyles.info
                const trail = trails.find((t) => t.id === alert.trailId)
                return (
                  <div key={`${alert.trailId}-${i}`} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        style.chip,
                      )}
                    >
                      {style.icon}
                      {alert.level}
                    </span>
                    <span className="text-mist-dim">
                      <span className="font-medium text-mist">{trail?.name ?? alert.trailId}</span>
                      {' — '}
                      {alert.title}. {alert.message}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-forest-900 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-forest-900 to-transparent" />
          </div>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
            aria-label="Dismiss alerts"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
