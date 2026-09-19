'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Download,
  Save,
  MapPin,
  Mountain,
  PackageCheck,
  Clock,
  Check,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import {
  DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS,
  offlinePackageFreshness,
} from '@gohealt/shared-types'
import type { OfflinePackageMetadata, TripPlan } from '@gohealt/shared-types'
import { trails, type TrailSeed, defaultChecklist, offlineManifestVersion } from '../lib/data'
import { buildTrailReadiness, defaultPermit, defaultSafety } from '../lib/readiness'
import { weatherForTrail } from '../lib/data'
import { OFFLINE_PACKAGE_STORAGE_KEY, LAST_PLAN_STORAGE_KEY } from '../lib/session'
import { cn } from '../lib/utils'

type TripPlannerProps = {
  selectedTrail: TrailSeed
  tripName: string
  onTripNameChange: (name: string) => void
  offlinePackage: OfflinePackageMetadata | null
  onOfflinePackageChange: (pkg: OfflinePackageMetadata | null) => void
  visibleTrails: TrailSeed[]
}

const readinessIcon = {
  ready: <CheckCircle2 className="h-4 w-4 text-mint-300" />,
  warning: <AlertTriangle className="h-4 w-4 text-sunrise-300" />,
  blocked: <XCircle className="h-4 w-4 text-coral-400" />,
}

const readinessChip = {
  ready: 'border-mint-400/30 bg-mint-400/10 text-mint-300',
  warning: 'border-sunrise-400/30 bg-sunrise-400/10 text-sunrise-300',
  blocked: 'border-coral-500/30 bg-coral-500/10 text-coral-400',
}

export function TripPlanner({
  selectedTrail,
  tripName,
  onTripNameChange,
  offlinePackage,
  onOfflinePackageChange,
  visibleTrails,
}: TripPlannerProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [saved, setSaved] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const weather = weatherForTrail(selectedTrail.id)
  const readiness = buildTrailReadiness({ ...selectedTrail, weather })

  const progress = useMemo(() => {
    return Math.round((checked.size / defaultChecklist.length) * 100)
  }, [checked.size])

  function toggleItem(idx: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function createPlan() {
    if (typeof window === 'undefined') return
    const plan: TripPlan = {
      id: 'draft',
      title: `${tripName} — ${selectedTrail.name}`,
      userId: 'local-user',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      itinerary: [
        {
          day: 1,
          trailId: selectedTrail.id,
          notes: 'Start at 6:30 AM. Check weather and trail closure status. Use offline trail package and keep hydration points logged.',
        },
      ],
      checklist: defaultChecklist,
      readiness,
      offlineManifestVersion,
      offlinePackage: offlinePackage ?? undefined,
    }
    localStorage.setItem(LAST_PLAN_STORAGE_KEY, JSON.stringify(plan))
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  function downloadOffline() {
    const metadata: OfflinePackageMetadata = {
      manifestVersion: offlineManifestVersion,
      downloadedAt: new Date().toISOString(),
      maxAgeDays: DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS,
    }
    onOfflinePackageChange(metadata)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(OFFLINE_PACKAGE_STORAGE_KEY, JSON.stringify(metadata))
    }
    const payload = { ...metadata, trails: visibleTrails }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'gohealttrail-offline.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3500)
  }

  const freshness = offlinePackage ? offlinePackageFreshness(offlinePackage) : null
  const freshnessLabel = freshness ? `Offline package: ${freshness}` : 'Offline package: not downloaded'
  const freshnessColor = freshness === 'fresh' ? 'text-mint-300' : freshness === 'stale' ? 'text-sunrise-300' : 'text-coral-400'

  return (
    <section id="planner" className="scroll-mt-20 border-t border-white/5 bg-forest-900/30 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: plan config */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-mist sm:text-4xl">Trip planner</h2>
            <p className="mt-2 text-mist-dim">
              Build a one-day plan, tick off your checklist, and download an offline safety package.
            </p>

            {/* Trip title input */}
            <div className="mt-6">
              <label htmlFor="trip-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-mist-dim">
                Trip title
              </label>
              <input
                id="trip-name"
                type="text"
                value={tripName}
                onChange={(e) => onTripNameChange(e.target.value)}
                placeholder="Weekend ridge mission"
                className="w-full rounded-xl border border-white/10 bg-forest-950/40 px-4 py-3 text-sm text-mist outline-none placeholder:text-mist-dim/60 focus:border-mint-400/50"
              />
            </div>

            {/* Selected trail summary */}
            <div className="glass mt-4 overflow-hidden rounded-2xl">
              <div className={cn('h-16 bg-gradient-to-br', selectedTrail.heroGradient)} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-mist">{selectedTrail.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-mist-dim">
                      <MapPin className="h-3 w-3" />
                      {selectedTrail.region}, {selectedTrail.state}
                    </p>
                  </div>
                  <span className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', readinessChip[readiness.status])}>
                    {readinessIcon[readiness.status]}
                    <span className="capitalize">{readiness.status}</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist-dim">
                  <span className="flex items-center gap-1"><Mountain className="h-3 w-3" />{selectedTrail.difficulty}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.floor(selectedTrail.durationMinutes / 60)}h</span>
                  <span>{selectedTrail.distanceKm} km · +{selectedTrail.elevationGain} m</span>
                </div>
              </div>
            </div>

            {/* Readiness callout */}
            <div className="mt-4 rounded-xl border border-white/8 bg-forest-950/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-mist">
                <CheckCircle2 className="h-4 w-4 text-mint-400" />
                Readiness status: <span className="capitalize">{readiness.status}</span>
              </div>
              {readiness.missing.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-mist-dim">
                  {readiness.missing.map((m) => (
                    <li key={m} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-sunrise-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              )}
              {readiness.recommendations.length > 0 && (
                <p className="mt-2 text-xs text-sunrise-300">{readiness.recommendations.join(' ')}</p>
              )}
              <p className="mt-2 flex items-center gap-1.5 text-xs">
                <PackageCheck className={cn('h-3.5 w-3.5', freshnessColor)} />
                <span className={freshnessColor}>{freshnessLabel}</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createPlan}
                className="flex items-center gap-2 rounded-xl bg-mint-500 px-5 py-3 text-sm font-semibold text-forest-950 shadow-lg shadow-mint-500/20 transition-all hover:bg-mint-400"
              >
                <Save className="h-4 w-4" />
                Save trip plan
              </button>
              <button
                type="button"
                onClick={downloadOffline}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-mist transition-all hover:border-mint-400/40 hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
                Download offline package
              </button>
            </div>

            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-sm text-mint-300"
                >
                  <Check className="h-4 w-4" />
                  Saved locally in this browser (localStorage).
                </motion.p>
              )}
              {downloaded && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-sm text-mint-300"
                >
                  <Check className="h-4 w-4" />
                  Offline package downloaded — manifest {offlineManifestVersion}.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Right: interactive checklist */}
          <div>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-mist">Pre-departure checklist</h3>
                <span className="text-sm font-medium text-mint-300">
                  {checked.size}/{defaultChecklist.length} ready
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-forest-950/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-mint-500 to-mint-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Checklist items */}
              <ul className="mt-4 space-y-1.5">
                {defaultChecklist.map((item, idx) => {
                  const isChecked = checked.has(idx)
                  return (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => toggleItem(idx)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all',
                          isChecked
                            ? 'border-mint-400/30 bg-mint-400/8'
                            : 'border-white/8 bg-forest-950/30 hover:border-white/15',
                        )}
                      >
                        <motion.span
                          animate={{ scale: isChecked ? [1, 1.15, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                          className="shrink-0"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-mint-400" />
                          ) : (
                            <Circle className="h-5 w-5 text-mist-dim/40" />
                          )}
                        </motion.span>
                        <span className={cn('text-sm transition-colors', isChecked ? 'text-mist' : 'text-mist-dim')}>
                          {item}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {checked.size === defaultChecklist.length && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl border border-mint-400/30 bg-mint-400/8 p-3 text-center text-sm text-mint-300"
                >
                  🎉 All checks cleared — you&apos;re ready for the trail!
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
