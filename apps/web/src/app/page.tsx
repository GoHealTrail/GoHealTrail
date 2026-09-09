"use client"

import { useEffect, useMemo, useState } from 'react'
import type { CommunityTrailUpdate, Trail, TripPlan } from '@gohealt/shared-types'

type RegionReference = {
  state: string
  amenityForests: number
  stateParkForests: number
  totalSites: number
}

type TrailAttraction = {
  type: string
  labels: [string, string][]
}

const demoTrails: Trail[] = [
  {
    id: 't-001',
    name: 'Trekking to Bukit Broga Skywalk',
    state: 'Selangor',
    difficulty: 'moderate',
    distanceKm: 6.5,
    durationMinutes: 240,
    hasWater: true,
  },
  {
    id: 't-002',
    name: 'Gunung Stong Sunset Loop',
    state: 'Kelantan',
    difficulty: 'hard',
    distanceKm: 11,
    durationMinutes: 360,
    hasWater: true,
  },
  {
    id: 't-003',
    name: 'Batu Burok Jungle Route',
    state: 'Pahang',
    difficulty: 'easy',
    distanceKm: 4.2,
    durationMinutes: 150,
    hasWater: false,
  },
  {
    id: 't-004',
    name: 'FRIM River Trail',
    state: 'Selangor',
    difficulty: 'easy',
    distanceKm: 5,
    durationMinutes: 120,
    hasWater: false,
  },
  {
    id: 't-005',
    name: 'Mount Nuang Camp Ridge',
    state: 'Selangor',
    difficulty: 'hard',
    distanceKm: 9,
    durationMinutes: 320,
    hasWater: true,
  },
]

const demoAlerts = [
  {
    trailId: 't-002',
    level: 'warning' as const,
    title: 'Recent heavy rain',
    message: 'Sections near summit are slippery. Carry anti-slip gear and avoid dusk travel.',
  },
  {
    trailId: 't-004',
    level: 'info' as const,
    title: 'Updated water refill point',
    message: 'Water station at FRIM River Trail checkpoint is open on weekends.',
  },
]

const demoCommunityUpdates: CommunityTrailUpdate[] = [
  {
    id: 'seed-1',
    trailId: 't-002',
    category: 'water',
    severity: 'warning',
    status: 'approved',
    message: 'Water flow currently low before sunrise; carry extra water.',
    reporter: 'Community ranger report',
    reportedAt: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    trailId: 't-001',
    category: 'leech',
    severity: 'warning',
    status: 'approved',
    message: 'Leech activity is common in the lower stretch after rain.',
    reporter: 'Local hiker',
    reportedAt: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    trailId: 't-004',
    category: 'mud',
    severity: 'warning',
    status: 'approved',
    message: 'Mud patches reported around the river crossing.',
    reporter: 'Volunteer check-in',
    reportedAt: new Date().toISOString(),
  },
]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

const kompendiumSnapshot: RegionReference[] = [
  { state: 'Johor', amenityForests: 8, stateParkForests: 0, totalSites: 8 },
  { state: 'Kedah', amenityForests: 27, stateParkForests: 0, totalSites: 27 },
  { state: 'Kelantan', amenityForests: 3, stateParkForests: 1, totalSites: 4 },
  { state: 'Melaka', amenityForests: 4, stateParkForests: 1, totalSites: 5 },
  { state: 'Negeri Sembilan', amenityForests: 11, stateParkForests: 0, totalSites: 11 },
  { state: 'Pahang', amenityForests: 28, stateParkForests: 1, totalSites: 29 },
  { state: 'Perak', amenityForests: 16, stateParkForests: 0, totalSites: 16 },
  { state: 'Perlis', amenityForests: 3, stateParkForests: 1, totalSites: 4 },
  { state: 'Pulau Pinang', amenityForests: 2, stateParkForests: 1, totalSites: 3 },
  { state: 'Selangor', amenityForests: 10, stateParkForests: 1, totalSites: 10 },
  { state: 'Terengganu', amenityForests: 11, stateParkForests: 0, totalSites: 11 },
  { state: 'W.P. Kuala Lumpur', amenityForests: 1, stateParkForests: 0, totalSites: 1 },
]

const trailAttractions: TrailAttraction[] = [
  {
    type: 'Attractions',
    labels: [
      ['Kajian/Pendidikan', 'Research / Education'],
      ['Sungai', 'River'],
      ['Air Terjun', 'Waterfall'],
      ['Berkelah', 'Picnic'],
      ['Berkhemah', 'Camping'],
      ['Berenang', 'Swimming'],
      ['Treking', 'Trekking'],
      ['Mendaki Gunung', 'Mountain Climbing'],
      ['Gua', 'Cave'],
      ['Muzium Perhutanan', 'Forestry Museum'],
      ['Hidupan Liar', 'Wildlife'],
      ['Tapak Geologi', 'Geological Site'],
      ['Titian Silara', 'Canopy Walk'],
      ['Rafting', 'Rafting'],
      ['Berkayak', 'Canoeing'],
    ],
  },
  {
    type: 'Facilities',
    labels: [
      ['Parkir', 'Parking'],
      ['Tandas', 'Toilet'],
      ['Pondok Rehat', 'Resting Hut'],
      ['Pusat Maklumat', 'Information Centre'],
      ['Chalet/Asrama', 'Chalet / Dormitory'],
      ['Dewan Serbaguna', 'Multi-purpose Hall'],
      ['Gerai', 'Stall'],
      ['Padang', 'Field'],
      ['Pelantar/Laluan Jambatan Gantung', 'Boardwalk / Hanging Bridge'],
      ['Jeti', 'Jetty'],
      ['Laluan OKU', 'Path for disabled access'],
      ['Menara Pandang', 'Look-out Tower'],
      ['Tempat Memasak', 'Cooking Site'],
    ],
  },
]

const safetyRules = [
  'Do not vandalize or damage plants and facilities.',
  'Keep the forest clean and preserve its beauty.',
  'Any fire or cooking activity must be supervised to prevent forest-fire risk.',
  'Climbing, fishing, camping, and chalet/cabin use requires prior permission.',
]

const permitNotice =
  'Permit matrix from POSTER_STATUS_KAWASAN_PENDAKIAN... is currently a scanned PDF without text extraction in this environment. It should be added as structured data once OCR is done.'

const offlineManifestVersion = '2026-09-07'
const defaultChecklist = ['Water', 'Food', 'Power bank', 'First aid kit', 'Rain jacket']

function Checklist({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18 }}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function FilterSection({
  state,
  difficulty,
  onState,
  onDifficulty,
  onClear,
}: {
  state: string
  difficulty: string
  onState: (value: string) => void
  onDifficulty: (value: string) => void
  onClear: () => void
}) {
  const availableStates = Array.from(
    new Set([
      ...demoTrails.map((trail) => trail.state),
      ...kompendiumSnapshot.map((entry) => entry.state),
      ...['Johor', 'Kedah', 'Terengganu', 'Pulau Pinang', 'Negeri Sembilan'],
    ])
  ).sort()

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 16 }}>
      <select value={state} onChange={(event) => onState(event.target.value)}>
        <option value="">All states</option>
        {availableStates.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>

      <select value={difficulty} onChange={(event) => onDifficulty(event.target.value)}>
        <option value="">Any difficulty</option>
        <option value="easy">Easy</option>
        <option value="moderate">Moderate</option>
        <option value="hard">Hard</option>
      </select>

      <button type="button" onClick={onClear}>
        Clear
      </button>
    </div>
  )
}

function TrailListItem({
  trail,
  onPlan,
}: {
  trail: Trail
  onPlan: (trail: Trail) => void
}) {
  return (
    <li style={{ marginBottom: 12, border: '1px solid rgba(255,255,255,0.18)', padding: 12, borderRadius: 8 }}>
      <div style={{ fontWeight: 700 }}>{trail.name}</div>
      <div>
        {trail.state} · {trail.difficulty} · {trail.distanceKm} km · {trail.durationMinutes} min ·
        {trail.hasWater ? ' water point' : ' no dedicated water point'}
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={() => onPlan(trail)}>
          Create 1-day plan
        </button>
      </div>
    </li>
  )
}

function CommunityUpdatesSection() {
  const [updates, setUpdates] = useState<CommunityTrailUpdate[]>(demoCommunityUpdates)
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [reporter, setReporter] = useState('')
  const [selectedTrailId, setSelectedTrailId] = useState(demoTrails[0]?.id ?? '')

  const [category, setCategory] = useState<CommunityTrailUpdate['category']>('condition')
  const [severity, setSeverity] = useState<CommunityTrailUpdate['severity']>('warning')
  const [filterStatus, setFilterStatus] = useState<'all' | CommunityTrailUpdate['status']>('all')

  useEffect(() => {
    let cancelled = false

    async function loadCommunityUpdates() {
      try {
        const response = await fetch(`${API_BASE}/community-updates`, {
          cache: 'no-store',
        })
        const payload = (await response.json()) as { updates?: CommunityTrailUpdate[] }
        if (!cancelled && payload.updates?.length) {
          setUpdates(payload.updates)
        }
      } catch {
        // keep seed fallback
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCommunityUpdates()

    return () => {
      cancelled = true
    }
  }, [])

  async function submitCommunityUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    const trimmedMessage = message.trim()
    const trimmedReporter = reporter.trim()

    if (!trimmedMessage || !trimmedReporter || !selectedTrailId) {
      setFormError('Trail, message, and reporter are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE}/community-updates`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          trailId: selectedTrailId,
          category,
          severity,
          message: trimmedMessage,
          reporter: trimmedReporter,
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Request failed with ${response.status}`)
      }

      const created = (await response.json()) as CommunityTrailUpdate
      setUpdates((current) => [created, ...current])
      setMessage('')
      setReporter('')
    } catch (error) {
      setFormError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Community trail updates</h2>
      <p style={{ opacity: 0.85 }}>
        {loading ? 'Loading updates from API...' : `Showing ${updates.length} latest updates`}
      </p>
      <form onSubmit={submitCommunityUpdate} style={{ marginBottom: 16, display: 'grid', gap: 8 }}>
        <select value={selectedTrailId} onChange={(event) => setSelectedTrailId(event.target.value)}>
          {demoTrails.map((trail) => (
            <option key={trail.id} value={trail.id}>
              {trail.name}
            </option>
          ))}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value as CommunityTrailUpdate['category'])}>
          <option value="closure">closure</option>
          <option value="water">water</option>
          <option value="condition">condition</option>
          <option value="leech">leech</option>
          <option value="mud">mud</option>
          <option value="other">other</option>
        </select>
        <select value={severity} onChange={(event) => setSeverity(event.target.value as CommunityTrailUpdate['severity'])}>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="danger">danger</option>
        </select>
        <input
          value={reporter}
          onChange={(event) => setReporter(event.target.value)}
          placeholder="Reporter name"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe what you observed"
          rows={3}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit community update'}
        </button>
        {formError && <p style={{ color: '#ff9a9e' }}>{formError}</p>}
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(filterStatus === 'all' ? updates : updates.filter((entry) => entry.status === filterStatus)).map((entry) => (
          <li
            key={entry.id}
            style={{
              marginBottom: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: 700 }}>Trail {entry.trailId}</div>
            <div>
              {entry.severity.toUpperCase()} · {entry.category}{' '}
              <span
                style={{
                  color: entry.status === 'pending' ? '#fbbf24' : entry.status === 'rejected' ? '#f87171' : '#4ade80',
                  fontWeight: 700,
                }}
              >
                [{entry.status.toUpperCase()}]
              </span>
            </div>
            <div>{entry.message}</div>
            <div style={{ opacity: 0.8 }}>Reported by {entry.reporter}</div>
          </li>
        ))}
      </ul>
      <select
        style={{ marginTop: 12 }}
        value={filterStatus}
        onChange={(event) => setFilterStatus(event.target.value as 'all' | CommunityTrailUpdate['status'])}
      >
        <option value="all">All updates</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
        <option value="rejected">Rejected</option>
      </select>
    </section>
  )
}

export default function Home() {
  const [stateFilter, setStateFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [tripName, setTripName] = useState('Weekend Rescue Trail')
  const [selectedTrail, setSelectedTrail] = useState<Trail>(demoTrails[0])
  const [planSaved, setPlanSaved] = useState(false)

  const visibleTrails = useMemo(() => {
    return demoTrails.filter((trail) => {
      const byState = !stateFilter || trail.state === stateFilter
      const byDifficulty = !difficultyFilter || trail.difficulty === difficultyFilter
      return byState && byDifficulty
    })
  }, [stateFilter, difficultyFilter])

  const lastPlan: TripPlan = {
    id: 'draft',
    title: tripName,
    userId: 'local-user',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    itinerary: [
      {
        day: 1,
        trailId: selectedTrail.id,
        notes: 'Start at 6:30 AM. Check weather and trail closure status.',
      },
    ],
    checklist: defaultChecklist,
  }

  function createPlan() {
    if (typeof window === 'undefined') return
    const plan: TripPlan = {
      ...lastPlan,
      title: `${tripName} - ${selectedTrail.name}`,
      itinerary: [
        {
          day: 1,
          trailId: selectedTrail.id,
          notes: 'Use offline trail package and keep hydration points logged.',
        },
      ],
    }

    localStorage.setItem('gohealttrail:last-plan', JSON.stringify(plan))
    setPlanSaved(true)
  }

  function downloadOffline() {
    const payload = {
      manifestVersion: offlineManifestVersion,
      trails: visibleTrails,
      downloadedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'gohealttrail-offline.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function triggerSOS() {
    alert('SOS request recorded: your location + contacts will be shared with support contacts.')
  }

  return (
    <main
      style={{
        margin: '0 auto',
        maxWidth: 1024,
        padding: 24,
        lineHeight: 1.5,
        color: '#e8ebf1',
      }}
    >
      <h1>GoHealTrail MVP</h1>
      <p>Trail discovery, planning, and safety-first flow for Malaysia outdoors.</p>

      <section style={{ marginBottom: 24 }}>
        <h2>Safety banner</h2>
        <p>
          Active alerts: {demoAlerts.length} · Offline manifest: {offlineManifestVersion}
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Malaysia forest reference (Kompendium extraction)</h2>
        <p>
          Source: Compendium of Amenity Forests and State Park Forests in Peninsular Malaysia (JPSM/FDPM).
        </p>
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            padding: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {kompendiumSnapshot.map((entry) => (
            <article
              key={entry.state}
              style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}
            >
              <div style={{ fontWeight: 700 }}>{entry.state}</div>
              <div>Amenity forests: {entry.amenityForests}</div>
              <div>State park forests: {entry.stateParkForests}</div>
              <div>Total: {entry.totalSites}</div>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Attractions and facilities indicators</h2>
        {trailAttractions.map((group) => (
          <div key={group.type} style={{ marginBottom: 12 }}>
            <h3>{group.type}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {group.labels.map(([ms, en]) => (
                <span
                  key={`${group.type}-${ms}`}
                  style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 13,
                  }}
                >
                  {ms} / {en}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <CommunityUpdatesSection />

      <section style={{ marginBottom: 24 }}>
        <h2>Safety & permit reminders</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {safetyRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <p style={{ marginTop: 8, opacity: 0.85 }}>{permitNotice}</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Discover trails</h2>
        <FilterSection
          state={stateFilter}
          difficulty={difficultyFilter}
          onState={setStateFilter}
          onDifficulty={setDifficultyFilter}
          onClear={() => {
            setStateFilter('')
            setDifficultyFilter('')
          }}
        />

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {visibleTrails.map((trail) => (
            <TrailListItem
              key={trail.id}
              trail={trail}
              onPlan={(trailItem) => {
                setSelectedTrail(trailItem)
                setTripName(`${trailItem.name} plan`)
                setPlanSaved(false)
              }}
            />
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Trip planner</h2>
        <label htmlFor="trip-name">Trip title</label>
        <input
          id="trip-name"
          value={tripName}
          onChange={(event) => setTripName(event.target.value)}
          style={{ display: 'block', marginBottom: 8 }}
        />

        <p>
          Plan for: <strong>{selectedTrail.name}</strong>
        </p>
        <Checklist items={lastPlan.checklist} />

        <div style={{ marginTop: 8 }}>
          <button type="button" onClick={createPlan}>
            Save trip plan
          </button>
          <button type="button" onClick={downloadOffline} style={{ marginLeft: 8 }}>
            Download offline trail package
          </button>
        </div>

        {planSaved && <p style={{ color: '#5cf1c3' }}>Saved locally in this browser (localStorage).</p>}
      </section>

      <section>
        <h2>Emergency</h2>
        <p>If conditions worsen, tap SOS to send tracked event.</p>
        <button type="button" onClick={triggerSOS}>
          Send SOS
        </button>
      </section>
    </main>
  )
}
