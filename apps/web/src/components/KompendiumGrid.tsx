'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trees, MapPin, ExternalLink } from 'lucide-react'
import { kompendiumSnapshot } from '../lib/data'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'
import { cn } from '../lib/utils'

export function KompendiumGrid() {
  const [open, setOpen] = useState(true)

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-river-400/20 bg-river-400/5 px-3 py-1 text-xs font-medium text-river-300">
                <Trees className="h-3.5 w-3.5" />
                JPSM / FDPM reference
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-mist sm:text-4xl">
                Malaysia forest reference
              </h2>
              <p className="mt-2 text-mist-dim">
                Compendium of Amenity Forests and State Park Forests in Peninsular Malaysia.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-mist-dim transition-colors hover:text-mist"
            >
              {open ? 'Collapse' : 'Expand'}
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </button>
          </div>
        </Reveal>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {kompendiumSnapshot.map((region, i) => (
                  <Reveal key={region.state} delay={Math.min(i * 0.04, 0.4)}>
                    <article className="glass-soft group rounded-2xl p-4 transition-all hover:ring-1 hover:ring-mint-400/20">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-mint-400" />
                        <h3 className="font-semibold text-mist">{region.state}</h3>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <Cell label="Amenity" value={region.amenityForests} />
                        <Cell label="State park" value={region.stateParkForests} />
                        <Cell label="Total" value={region.totalSites} highlight />
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>

              <p className="mt-6 flex items-center gap-1.5 text-xs text-mist-dim">
                Source: Compendium of Amenity Forests and State Park Forests in Peninsular Malaysia (JPSM / FDPM).
                <ExternalLink className="h-3 w-3" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function Cell({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg py-1.5', highlight ? 'bg-mint-500/10' : 'bg-white/5')}>
      <CountUp
        to={value}
        className={cn('block text-lg font-bold', highlight ? 'text-mint-300' : 'text-mist')}
      />
      <p className="text-[10px] uppercase tracking-wide text-mist-dim">{label}</p>
    </div>
  )
}
