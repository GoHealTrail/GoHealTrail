"use client"



import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS, offlinePackageFreshness } from '@gohealt/shared-types'
import type { CommunityTrailUpdate, OfflinePackageMetadata, Trail, TripPlan, TrailReadiness, TrailPermitInfo, SafetySummary, WeatherRisk } from '@gohealt/shared-types'



type SessionState = {

  token: string

  status: 'anonymous' | 'signed-in'

}



type RegionReference = {

  state: string

  amenityForests: number

  stateParkForests: number

  totalSites: number

}



const SESSION_STORAGE_KEY = 'gohealttrail:session-token'

const OFFLINE_PACKAGE_STORAGE_KEY = 'gohealttrail:offline-package'

function readOfflinePackage(): OfflinePackageMetadata | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(OFFLINE_PACKAGE_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.manifestVersion !== 'string' ||
      typeof parsed?.downloadedAt !== 'string' ||
      typeof parsed?.maxAgeDays !== 'number'
    ) {
      return null
    }

    return parsed as OfflinePackageMetadata
  } catch {
    return null
  }
}



function readSessionState(): SessionState {

  if (typeof window === 'undefined') {

    return { token: '', status: 'anonymous' }

  }



  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!raw) {

    return { token: '', status: 'anonymous' }

  }



  try {

    const parsed = JSON.parse(raw)

    const token = typeof parsed?.token === 'string' ? parsed.token.trim() : typeof raw === 'string' ? raw.trim() : ''

    if (!token) {

      return { token: '', status: 'anonymous' }

    }



    return { token, status: 'signed-in' }

  } catch {

    const token = raw.trim()

    return token ? { token, status: 'signed-in' } : { token: '', status: 'anonymous' }

  }

}



function storeSessionState(session: SessionState): void {

  if (typeof window === 'undefined') return



  if (session.status === 'anonymous' || !session.token) {

    window.localStorage.removeItem(SESSION_STORAGE_KEY)

    return

  }



  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))

}



function buildAuthHeaders(session: SessionState): { authorization: string } | Record<string, never> {
  if (session.status !== 'signed-in' || !session.token) {
    return {}
  }

  return {
    authorization: `Bearer ${session.token}`,
  }
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



const offlineManifestVersion = '2026-09-15-web-readiness-v1'

const defaultChecklist = ['Water', 'Food', 'Power bank', 'First aid kit', 'Rain jacket', 'Permit confirmed', 'Weather checked', 'Offline package downloaded']

const weatherRiskFromAlert: Record<'info' | 'warning' | 'danger', WeatherRisk> = {
  info: 'normal',
  warning: 'advisory',
  danger: 'danger',
}

function weatherForTrail(trailId: string) {
  const alert = demoAlerts.find((item) => item.trailId === trailId)
  if (!alert) return undefined

  return {
    risk: weatherRiskFromAlert[alert.level],
    reasons: [alert.title, alert.message],
    observedAt: new Date().toISOString(),
  }
}

const defaultPermit: TrailPermitInfo = {
  required: false,
  notes: ['Check the latest district or forestry notice before departure.'],
}

const defaultSafety: SafetySummary = {
  level: 'normal',
  reasons: [],
  source: 'system',
  observedAt: new Date().toISOString(),
}

function buildTrailReadiness(trail: Trail): TrailReadiness {
  const missing: string[] = []
  const recommendations: string[] = []
  const permit = trail.permit ?? defaultPermit
  const safety = trail.safety ?? defaultSafety

  if (!trail.hasWater) missing.push('Carry extra water')
  if (permit.required) missing.push('Confirm permit')
  if (safety.level === 'danger' || safety.level === 'closed') {
    recommendations.push('Do not start this trail while the safety alert is active.')
  } else if (safety.level === 'advisory') {
    recommendations.push(...safety.reasons)
  }

  return {
    status: safety.level === 'closed' || safety.level === 'danger'
      ? 'blocked'
      : missing.length > 0 || recommendations.length > 0 ? 'warning' : 'ready',
    missing,
    recommendations,
  }
}



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

  const trailWithWeather = { ...trail, weather: weatherForTrail(trail.id) }
  const readiness = buildTrailReadiness(trailWithWeather)
  const safety = trail.safety ?? defaultSafety
  const permit = trail.permit ?? defaultPermit
  const weather = trailWithWeather.weather

  return (

    <li style={{ marginBottom: 12, border: '1px solid rgba(255,255,255,0.18)', padding: 12, borderRadius: 8 }}>

      <div style={{ fontWeight: 700 }}>{trail.name}</div>

      <div>

        {trail.state} · {trail.difficulty} · {trail.distanceKm} km · {trail.durationMinutes} min ·

        {trail.hasWater ? ' water point' : ' no dedicated water point'}

      </div>

      <div style={{ marginTop: 6 }}>
        Safety: <strong>{safety.level}</strong> · Weather: {weather?.risk ?? 'normal'} · Permit: {permit.required ? 'required' : 'check locally'} · Readiness: {readiness.status}
      </div>
      {weather && <div style={{ marginTop: 4, opacity: 0.85 }}>Weather signal: {weather.reasons.join(' — ')}</div>}

      <div style={{ marginTop: 8 }}>

        <button type="button" onClick={() => onPlan(trail)}>

          Create 1-day plan

        </button>

      </div>

    </li>

  )

}



function SessionStatus({

  session,

  onSessionChange,

}: {

  session: SessionState

  onSessionChange: (next: SessionState) => void

}) {

  const [tokenInput, setTokenInput] = useState(session.token)



  useEffect(() => {

    setTokenInput(session.token)

  }, [session.token])



  return (

    <section style={{ marginBottom: 24 }}>

      <h2>Session</h2>

      <p>Current session: {session.status}</p>

      <input

        value={tokenInput}

        onChange={(event) => setTokenInput(event.target.value)}

        placeholder="Paste bearer access token"

        style={{ width: '100%', marginBottom: 8 }}

      />

      <div style={{ display: 'flex', gap: 8 }}>

        <button

          type="button"

          onClick={() =>

            onSessionChange(

              tokenInput.trim()

                ? { token: tokenInput.trim(), status: 'signed-in' }

                : { token: '', status: 'anonymous' }

            )

          }

        >

          Save token

        </button>

        <button

          type="button"

          onClick={() => {

            setTokenInput('')

            onSessionChange({ token: '', status: 'anonymous' })

          }}

        >

          Clear token

        </button>

      </div>

      <p style={{ marginBottom: 0, opacity: 0.85 }}>

        Protected actions (submit/moderate community updates) only run when signed in.

      </p>

    </section>

  )

}



function CommunityUpdatesSection({

  session,

}: {

  session: SessionState

}) {

  const [updates, setUpdates] = useState<CommunityTrailUpdate[]>(demoCommunityUpdates)

  const [loading, setLoading] = useState(true)

  const [formError, setFormError] = useState('')

  const [actionError, setActionError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [processingIds, setProcessingIds] = useState<string[]>([])

  const [message, setMessage] = useState('')

  const [reporter, setReporter] = useState('')

  const [selectedTrailId, setSelectedTrailId] = useState(demoTrails[0]?.id ?? '')



  const [category, setCategory] = useState<CommunityTrailUpdate['category']>('condition')

  const [severity, setSeverity] = useState<CommunityTrailUpdate['severity']>('warning')

  const [filterStatus, setFilterStatus] = useState<'all' | CommunityTrailUpdate['status']>('all')



  const isModerating = processingIds.length > 0



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



    const headers = buildAuthHeaders(session)

    if (!headers.authorization) {

      setFormError('You must sign in with a token to submit community updates.')

      return

    }



    setIsSubmitting(true)



    try {

      const response = await fetch(`${API_BASE}/community-updates`, {

        method: 'POST',

        headers: {

          'content-type': 'application/json',

          ...headers,

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



  async function moderateUpdate(id: string, action: 'approve' | 'reject') {

    if (!id || processingIds.includes(id)) return



    const headers = buildAuthHeaders(session)

    if (!headers.authorization) {

      setActionError('You must sign in with a token to moderate community updates.')

      return

    }



    setActionError('')

    setProcessingIds((current) => [...current, id])



    try {

      const response = await fetch(`${API_BASE}/community-updates/${id}/${action}`, {

        method: 'POST',

        headers: {

          ...headers,

        },

      })



      if (!response.ok) {

        const body = await response.text()

        throw new Error(body || `Request failed with ${response.status}`)

      }



      const updated = (await response.json()) as CommunityTrailUpdate

      setUpdates((current) => current.map((item) => (item.id === updated.id ? updated : item)))

    } catch (error) {

      setActionError((error as Error).message)

    } finally {

      setProcessingIds((current) => current.filter((itemId) => itemId !== id))

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

          {actionError && <p style={{ color: '#fca5a5' }}>{actionError}</p>}

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

            {entry.status === 'pending' && session.status === 'signed-in' && (

              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>

                <button

                  type="button"

                  disabled={processingIds.includes(entry.id) || isModerating}

                  onClick={() => moderateUpdate(entry.id, 'approve')}

                >

                  Approve

                </button>

                <button

                  type="button"

                  disabled={processingIds.includes(entry.id) || isModerating}

                  onClick={() => moderateUpdate(entry.id, 'reject')}

                >

                  Reject

                </button>

              </div>

            )}

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

  const [sessionState, setSessionState] = useState<SessionState>(() => readSessionState())

  const [offlinePackage, setOfflinePackage] = useState<OfflinePackageMetadata | null>(() => readOfflinePackage())



  useEffect(() => {

    storeSessionState(sessionState)

  }, [sessionState])



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
    readiness: buildTrailReadiness({ ...selectedTrail, weather: weatherForTrail(selectedTrail.id) }),
    offlineManifestVersion,
    offlinePackage: offlinePackage ?? undefined,

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

    const metadata: OfflinePackageMetadata = {

      manifestVersion: offlineManifestVersion,

      downloadedAt: new Date().toISOString(),

      maxAgeDays: DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS,

    }

    setOfflinePackage(metadata)

    if (typeof window !== 'undefined') {

      window.localStorage.setItem(OFFLINE_PACKAGE_STORAGE_KEY, JSON.stringify(metadata))

    }



    const payload = {

      ...metadata,

      trails: visibleTrails,

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
          {offlinePackage
            ? ` · Offline package: ${offlinePackageFreshness(offlinePackage)}`
            : ' · Offline package: not downloaded'}

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



      <SessionStatus

        session={sessionState}

        onSessionChange={setSessionState}

      />



      <CommunityUpdatesSection session={sessionState} />



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
