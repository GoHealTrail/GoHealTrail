'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin, Bell, Trees } from 'lucide-react'
import { CountUp } from './CountUp'
import { kompendiumSnapshot, demoAlerts, trails } from '../lib/data'

type HeroProps = {
  onExplore?: () => void
  onPlan?: () => void
}

const totalForestSites = kompendiumSnapshot.reduce((sum, r) => sum + r.totalSites, 0)

export function Hero({ onExplore, onPlan }: HeroProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section id="top" className="noise relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Drifting gradient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-mint-500/20 blur-[90px]"
              animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute right-0 top-32 h-[32rem] w-[32rem] rounded-full bg-forest-600/30 blur-[100px]"
              animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 0.95, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-sunrise-500/15 blur-[80px]"
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,213,162,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,213,162,0.4) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.21, 0.65, 0.35, 1] }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3.5 py-1.5 text-xs font-medium text-mint-300">
            <MapPin className="h-3.5 w-3.5" />
            Malaysia outdoor trails platform
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-mist sm:text-6xl lg:text-7xl">
            Discover Malaysia&apos;s <span className="text-gradient">Wild Side</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist-dim">
            Weather-aware trail discovery, one-day trip planning, offline readiness, and live
            community updates — built for the rainforest, the ridges, and the rivers.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#trails"
              onClick={onExplore}
              className="group inline-flex items-center gap-2 rounded-xl bg-mint-500 px-5 py-3 text-sm font-semibold text-forest-950 shadow-lg shadow-mint-500/25 transition-all hover:bg-mint-400 hover:shadow-mint-500/40"
            >
              Explore trails
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#planner"
              onClick={onPlan}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-mist backdrop-blur-sm transition-all hover:border-mint-400/40 hover:bg-white/10"
            >
              Plan a trip
            </a>
          </div>

          {/* Stats chips */}
          <div className="mt-12 flex flex-wrap gap-6">
            <StatChip icon={<Trees className="h-4 w-4 text-mint-300" />} label="Forest sites" >
              <CountUp to={totalForestSites} className="text-2xl font-bold text-mist" />
            </StatChip>
            <StatChip icon={<MapPin className="h-4 w-4 text-sunrise-400" />} label="Curated trails">
              <CountUp to={trails.length} className="text-2xl font-bold text-mist" />
            </StatChip>
            <StatChip icon={<Bell className="h-4 w-4 text-coral-400" />} label="Active alerts">
              <CountUp to={demoAlerts.length} className="text-2xl font-bold text-mist" />
            </StatChip>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade into page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-forest-950 to-transparent" />
    </section>
  )
}

function StatChip({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5">
        {icon}
      </span>
      <div>
        {children}
        <p className="text-xs font-medium uppercase tracking-wide text-mist-dim">{label}</p>
      </div>
    </div>
  )
}
