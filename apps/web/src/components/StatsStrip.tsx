'use client'

import { Trees, MapPinned, Mountain, MessageSquare } from 'lucide-react'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'
import { kompendiumSnapshot, trails, seedCommunityUpdates } from '../lib/data'

const totalForestSites = kompendiumSnapshot.reduce((s, r) => s + r.totalSites, 0)

const stats = [
  { icon: Mountain, label: 'Curated trails', value: trails.length, color: 'text-mint-300' },
  { icon: Trees, label: 'Forest sites', value: totalForestSites, color: 'text-sunrise-400' },
  { icon: MapPinned, label: 'States covered', value: kompendiumSnapshot.length, color: 'text-river-300' },
  { icon: MessageSquare, label: 'Community updates', value: seedCommunityUpdates.length, color: 'text-coral-400' },
]

export function StatsStrip() {
  return (
    <section className="relative border-y border-white/5 bg-forest-900/40 py-16">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className="glass-soft flex flex-col items-center rounded-2xl p-6 text-center">
                <span className={`mb-3 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </span>
                <CountUp to={stat.value} className="text-3xl font-bold text-mist" />
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-mist-dim">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
