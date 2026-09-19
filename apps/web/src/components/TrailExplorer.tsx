'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Star,
  MapPin,
  Clock,
  Route,
  TrendingUp,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Mountain,
  Droplets,
  CheckCircle2,
  CircleAlert,
  OctagonAlert,
} from 'lucide-react'
import { trails, type TrailSeed, weatherForTrail } from '../lib/data'
import { buildTrailReadiness, defaultPermit, defaultSafety } from '../lib/readiness'
import { cn } from '../lib/utils'

type TrailExplorerProps = {
  selectedTrail: TrailSeed
  onSelectTrail: (trail: TrailSeed) => void
  onCreatePlan: (trail: TrailSeed) => void
}

const DIFFICULTIES = ['all', 'easy', 'moderate', 'hard'] as const

const difficultyBadge: Record<string, string> = {
  easy: 'border-mint-400/30 bg-mint-400/10 text-mint-300',
  moderate: 'border-sunrise-400/30 bg-sunrise-400/10 text-sunrise-300',
  hard: 'border-coral-500/30 bg-coral-500/10 text-coral-400',
}

const readinessMeta: Record<string, { icon: React.ReactNode; chip: string; label: string }> = {
  ready: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    chip: 'border-mint-400/30 bg-mint-400/10 text-mint-300',
    label: 'Ready',
  },
  warning: {
    icon: <CircleAlert className="h-4 w-4" />,
    chip: 'border-sunrise-400/30 bg-sunrise-400/10 text-sunrise-300',
    label: 'Caution',
  },
  blocked: {
    icon: <OctagonAlert className="h-4 w-4" />,
    chip: 'border-coral-500/30 bg-coral-500/10 text-coral-400',
    label: 'Blocked',
  },
}

export function TrailExplorer({ selectedTrail, onSelectTrail, onCreatePlan }: TrailExplorerProps) {
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const availableStates = useMemo(
    () => Array.from(new Set(trails.map((t) => t.state))).sort(),
    [],
  )

  const visibleTrails = useMemo(() => {
    const q = search.trim().toLowerCase()
    return trails.filter((t) => {
      if (stateFilter !== 'all' && t.state !== stateFilter) return false
      if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false
      if (q && !t.name.toLowerCase().includes(q) && !t.region.toLowerCase().includes(q) && !t.tagline.toLowerCase().includes(q))
        return false
      return true
    })
  }, [stateFilter, difficultyFilter, search])

  return (
    <section id="trails" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              Trail explorer
            </h2>
            <p className="mt-2 text-mist-dim">
              Five curated Malaysian routes — filter, inspect elevation, and check live readiness.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass mb-8 flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:justify-between">
          {/* State pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={stateFilter === 'all'} onClick={() => setStateFilter('all')}>
              All states
            </Pill>
            {availableStates.map((state) => (
              <Pill
                key={state}
                active={stateFilter === state}
                onClick={() => setStateFilter(state)}
              >
                {state}
              </Pill>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Difficulty segmented control */}
            <div className="flex items-center rounded-xl border border-white/10 bg-forest-950/40 p-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficultyFilter(d)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all',
                    difficultyFilter === d
                      ? 'bg-mint-500 text-forest-950'
                      : 'text-mist-dim hover:text-mist',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-dim" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search trails…"
                className="w-full rounded-xl border border-white/10 bg-forest-950/40 py-2 pl-9 pr-3 text-sm text-mist outline-none placeholder:text-mist-dim/60 focus:border-mint-400/50 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(380px,440px)]">
          {/* Trail cards list */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {visibleTrails.map((trail) => (
                <TrailCard
                  key={trail.id}
                  trail={trail}
                  selected={trail.id === selectedTrail.id}
                  onSelect={() => onSelectTrail(trail)}
                />
              ))}
            </AnimatePresence>

            {visibleTrails.length === 0 && (
              <div className="glass flex flex-col items-center gap-3 rounded-2xl p-12 text-center">
                <Mountain className="h-8 w-8 text-mist-dim" />
                <p className="text-mist-dim">No trails match your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStateFilter('all')
                    setDifficultyFilter('all')
                    setSearch('')
                  }}
                  className="text-sm font-medium text-mint-300 hover:text-mint-400"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Sticky detail panel */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TrailDetail trail={selectedTrail} onCreatePlan={() => onCreatePlan(selectedTrail)} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
        active
          ? 'border-mint-400/50 bg-mint-400/15 text-mint-300'
          : 'border-white/10 bg-white/5 text-mist-dim hover:border-white/20 hover:text-mist',
      )}
    >
      {children}
    </button>
  )
}

function TrailCard({
  trail,
  selected,
  onSelect,
}: {
  trail: TrailSeed
  selected: boolean
  onSelect: () => void
}) {
  const readiness = buildTrailReadiness({
    ...trail,
    weather: weatherForTrail(trail.id),
  })
  const rMeta = readinessMeta[readiness.status]

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -3 }}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl p-0.5 text-left transition-all',
        selected
          ? 'ring-2 ring-mint-400/60 ring-glow'
          : 'ring-1 ring-white/8 hover:ring-mint-400/30',
      )}
    >
      {/* Gradient thumb strip */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-24 bg-gradient-to-br opacity-70 transition-opacity group-hover:opacity-100',
          trail.heroGradient,
        )}
      />

      <div className="glass relative mt-16 rounded-[14px] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-mist">{trail.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-mist-dim">
              <MapPin className="h-3 w-3" />
              {trail.region}, {trail.state}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
              difficultyBadge[trail.difficulty],
            )}
          >
            {trail.difficulty}
          </span>
        </div>

        <p className="mt-2 line-clamp-1 text-sm text-mist-dim">{trail.tagline}</p>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-mist-dim">
          <span className="flex items-center gap-1.5">
            <Route className="h-3.5 w-3.5 text-mint-400" />
            {trail.distanceKm} km
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-mint-400" />
            {Math.floor(trail.durationMinutes / 60)}h {trail.durationMinutes % 60}m
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-mint-400" />
            {trail.elevationGain} m
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-sunrise-400" />
            {trail.rating} ({trail.reviews})
          </span>
          {trail.hasWater && (
            <span className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-river-300" />
              Water point
            </span>
          )}
        </div>

        {/* Readiness chip */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              rMeta.chip,
            )}
          >
            {rMeta.icon}
            {rMeta.label}
          </span>
          <span className="text-xs font-medium text-mint-300 opacity-0 transition-opacity group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </motion.button>
  )
}

/* -------------------------------------------------- */
/* Elevation profile SVG                              */
/* -------------------------------------------------- */

function ElevationChart({ data, gain }: { data: number[]; gain: number }) {
  const W = 360
  const H = 130
  const padX = 8
  const padY = 12
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stepX = (W - padX * 2) / (data.length - 1)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const points = data.map((v, i) => {
    const x = padX + i * stepX
    const y = H - padY - ((v - min) / range) * (H - padY * 2)
    return [x, y] as const
  })

  const pathD = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  const areaD = `${pathD} L${points[points.length - 1][0].toFixed(1)},${(H - padY).toFixed(1)} L${points[0][0].toFixed(1)},${(H - padY).toFixed(1)} Z`

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.round((x - padX) / stepX)
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)))
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="Elevation profile"
      >
        <defs>
          <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#13452e" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="elevStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={W - padX}
            y1={padY + g * (H - padY * 2)}
            y2={padY + g * (H - padY * 2)}
            stroke="rgba(168,213,162,0.08)"
            strokeWidth="1"
          />
        ))}

        <motion.path
          d={areaD}
          fill="url(#elevFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#elevStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />

        {/* Hover marker */}
        {hoverIdx !== null && (
          <>
            <line
              x1={points[hoverIdx][0]}
              x2={points[hoverIdx][0]}
              y1={padY}
              y2={H - padY}
              stroke="rgba(110,231,183,0.4)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={points[hoverIdx][0]}
              cy={points[hoverIdx][1]}
              r="4"
              fill="#6ee7b7"
              stroke="#04110c"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoverIdx !== null && (
        <div
          className="pointer-events-none absolute -top-2 rounded-lg border border-white/10 bg-forest-950/90 px-2.5 py-1 text-xs text-mist shadow-lg"
          style={{
            left: `${(points[hoverIdx][0] / W) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {data[hoverIdx]} m
        </div>
      )}

      <div className="mt-1 flex justify-between text-[11px] text-mist-dim">
        <span>Start · {data[0]} m</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +{gain} m gain
        </span>
        <span>Peak · {Math.max(...data)} m</span>
      </div>
    </div>
  )
}

/* -------------------------------------------------- */
/* Trail detail panel                                 */
/* -------------------------------------------------- */

function TrailDetail({ trail, onCreatePlan }: { trail: TrailSeed; onCreatePlan: () => void }) {
  const weather = weatherForTrail(trail.id)
  const readiness = buildTrailReadiness({ ...trail, weather: weatherForTrail(trail.id) })
  const permit = trail.permit ?? defaultPermit
  const rMeta = readinessMeta[readiness.status]

  return (
    <motion.div
      key={trail.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass overflow-hidden rounded-2xl"
    >
      {/* Header with gradient */}
      <div className={cn('relative h-24 bg-gradient-to-br', trail.heroGradient)}>
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', difficultyBadge[trail.difficulty])}>
            {trail.difficulty}
          </span>
          <h3 className="mt-1 text-xl font-bold text-mist">{trail.name}</h3>
          <p className="text-xs text-mist-dim">{trail.region}, {trail.state}</p>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-mist-dim">{trail.tagline}</p>

        {/* Elevation chart */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-dim">Elevation profile</p>
          <ElevationChart data={trail.elevationProfile} gain={trail.elevationGain} />
        </div>

        {/* Readiness */}
        <div className="mt-5 rounded-xl border border-white/8 bg-forest-950/40 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-mist-dim">Readiness</span>
            <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', rMeta.chip)}>
              {rMeta.icon}
              {rMeta.label}
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-xs text-mist-dim">
            <div>Permit: <span className="text-mist">{permit.required ? 'Required' : 'Check locally'}</span></div>
            <div>Weather: <span className="text-mist">{weather?.risk ?? 'normal'}</span></div>
            {weather?.reasons && (
              <div className="rounded-lg bg-white/5 px-2 py-1.5 text-mist-dim">
                {weather.reasons.join(' — ')}
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Distance" value={`${trail.distanceKm} km`} icon={<Route className="h-3.5 w-3.5" />} />
          <Stat label="Duration" value={`${Math.floor(trail.durationMinutes / 60)}h`} icon={<Clock className="h-3.5 w-3.5" />} />
          <Stat label="Rating" value={`${trail.rating}★`} icon={<Star className="h-3.5 w-3.5" />} />
        </div>

        {/* Features */}
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mist-dim">
            <Sparkles className="h-3.5 w-3.5" /> Features
          </p>
          <div className="flex flex-wrap gap-1.5">
            {trail.features.map((f) => (
              <span key={f} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-mist-dim">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Best months */}
        <div className="mt-4 flex items-center gap-2 text-xs text-mist-dim">
          <CalendarDays className="h-3.5 w-3.5 text-sunrise-400" />
          Best months: <span className="text-mist">{trail.bestMonths}</span>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onCreatePlan}
          className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-mint-500 px-4 py-3 text-sm font-semibold text-forest-950 shadow-lg shadow-mint-500/20 transition-all hover:bg-mint-400"
        >
          Create 1-day plan
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/8 bg-forest-950/40 p-2.5">
      <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center text-mint-400">{icon}</div>
      <p className="text-sm font-semibold text-mist">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-mist-dim">{label}</p>
    </div>
  )
}
