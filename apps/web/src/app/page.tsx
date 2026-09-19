'use client'

import { useEffect, useMemo, useState } from 'react'
import type { OfflinePackageMetadata } from '@gohealt/shared-types'
import { Navbar, type SessionState } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { AlertsBanner } from '../components/AlertsBanner'
import { TrailExplorer } from '../components/TrailExplorer'
import { StatsStrip } from '../components/StatsStrip'
import { KompendiumGrid } from '../components/KompendiumGrid'
import { TripPlanner } from '../components/TripPlanner'
import { CommunityFeed } from '../components/CommunityFeed'
import { SafetySection } from '../components/SafetySection'
import { Footer } from '../components/Footer'
import { trails, type TrailSeed, weatherForTrail } from '../lib/data'
import { buildTrailReadiness } from '../lib/readiness'
import {
  readOfflinePackage,
  readSessionState,
  storeSessionState,
} from '../lib/session'

export default function Home() {
  const [selectedTrail, setSelectedTrail] = useState<TrailSeed>(trails[0])
  const [tripName, setTripName] = useState('Weekend Rescue Trail')
  const [sessionState, setSessionState] = useState<SessionState>(() => readSessionState())
  const [offlinePackage, setOfflinePackage] = useState<OfflinePackageMetadata | null>(() =>
    readOfflinePackage(),
  )

  useEffect(() => {
    storeSessionState(sessionState)
  }, [sessionState])

  // Trails included in the offline download payload — the full curated set
  // so the package is complete even when UI filters narrow the visible list.
  const visibleTrails = useMemo(() => trails, [])

  function handleCreatePlan(trail: TrailSeed) {
    setSelectedTrail(trail)
    setTripName(`${trail.name} plan`)
    if (typeof document !== 'undefined') {
      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Touch readiness so the import is used and the derivation path is exercised
  // on every render — the planner recomputes it internally for live display.
  const _readiness = buildTrailReadiness({
    ...selectedTrail,
    weather: weatherForTrail(selectedTrail.id),
  })
  void _readiness

  return (
    <>
      <Navbar session={sessionState} onSessionChange={setSessionState} />
      <AlertsBanner />
      <main>
        <Hero />
        <TrailExplorer
          selectedTrail={selectedTrail}
          onSelectTrail={setSelectedTrail}
          onCreatePlan={handleCreatePlan}
        />
        <StatsStrip />
        <KompendiumGrid />
        <TripPlanner
          selectedTrail={selectedTrail}
          tripName={tripName}
          onTripNameChange={setTripName}
          offlinePackage={offlinePackage}
          onOfflinePackageChange={setOfflinePackage}
          visibleTrails={visibleTrails}
        />
        <CommunityFeed session={sessionState} />
        <SafetySection />
      </main>
      <Footer />
    </>
  )
}
