import type { Trail, TripPlan, CommunityTrailUpdate } from '@gohealt/shared-types'

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

export const meta = {
  name: 'GoHealTrail Mobile',
  description: 'Malaysia-focused trail planning shell with safety and permit reminders',
  offlineFirst: true,
}

export const kompendiumSnapshot: RegionReference[] = [
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

export const trailAttractions: TrailAttraction[] = [
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

export const safetyRules = [
  'Do not vandalize or damage plants and facilities.',
  'Keep the forest clean and preserve its beauty.',
  'Any fire or cooking activity must be supervised to prevent forest-fire risk.',
  'Climbing, fishing, camping, and chalet/cabin use requires prior permission.',
]

export const permitNotice =
  'Permit matrix from POSTER_STATUS_KAWASAN_PENDAKIAN... is currently a scanned PDF without text extraction in this environment. It should be added as structured data once OCR is completed.'

export const trails: Trail[] = [
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

export const alerts = [
  {
    trailId: 't-002',
    level: 'warning' as const,
    title: 'Heavy rain expected',
    message: 'Wear anti-slip shoes, avoid rocky shortcuts.',
  },
]

export const communityUpdates: CommunityTrailUpdate[] = [
  {
    id: '1',
    trailId: 't-002',
    category: 'water',
    severity: 'warning',
    status: 'approved',
    message: 'Water flow currently low before sunrise; carry extra water.',
    reporter: 'Community ranger report',
    reportedAt: new Date().toISOString(),
  },
  {
    id: '2',
    trailId: 't-001',
    category: 'leech',
    severity: 'warning',
    message: 'Leech activity is common in the lower stretch after rain.',
    status: 'approved',
    reporter: 'Local hiker',
    reportedAt: new Date().toISOString(),
  },
]

export const starterChecklist = ['Water', 'Food', 'Torch', 'Rain jacket', 'First aid kit']

export const defaultCommunityUpdatePayload = {
  trailId: 't-002',
  category: 'other' as const,
  severity: 'info' as const,
  message: 'Community check-in',
  status: 'pending' as const,
  reporter: 'Mobile',
}

export function buildPlan(title: string, userId: string, selectedTrailId: string): TripPlan {
  return {
    id: `plan-${Date.now()}`,
    title,
    userId,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    itinerary: [
      {
        day: 1,
        trailId: selectedTrailId,
        notes: 'Start early and keep offline map enabled.',
      },
    ],
    checklist: [...starterChecklist],
  }
}

export const buildCommunityPayload = () => ({
  ...defaultCommunityUpdatePayload,
  message: `Update at ${new Date().toISOString()}`,
  trailId: trails[0]?.id ?? 't-001',
})

export const defaultCommunityApiBase = 'http://localhost:8080'

export type SessionState = {
  token: string
  status: 'anonymous' | 'signed-in'
}

function buildAuthHeaders(session: SessionState): { authorization: string } | Record<string, never> {
  if (session.status !== 'signed-in' || !session.token) {
    return {}
  }

  return {
    authorization: `Bearer ${session.token}`,
  }
}

export async function submitCommunityTrailUpdate(
  payload: Omit<CommunityTrailUpdate, 'id' | 'reportedAt'>,
  apiBase = defaultCommunityApiBase,
  session: SessionState = { token: '', status: 'anonymous' },
): Promise<{ ok: true; update: CommunityTrailUpdate } | { ok: false; error: string }> {
  if (
    !payload?.trailId ||
    !payload?.category ||
    !payload?.severity ||
    !payload?.message ||
    !payload?.reporter
  ) {
    return { ok: false, error: 'Invalid community update payload.' }
  }

  const headers = buildAuthHeaders(session)
  if (!headers.authorization) {
    return { ok: false, error: 'Authentication required to submit community updates.' }
  }

  const response = await fetch(`${apiBase}/community-updates`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    return { ok: false, error: body || `Request failed with ${response.status}` }
  }

  const update = (await response.json()) as CommunityTrailUpdate
  return { ok: true, update }
}

export async function moderateCommunityTrailUpdate(
  id: string,
  action: 'approve' | 'reject',
  apiBase = defaultCommunityApiBase,
  session: SessionState = { token: '', status: 'anonymous' },
): Promise<{ ok: true; update: CommunityTrailUpdate } | { ok: false; error: string }> {
  if (!id) {
    return { ok: false, error: 'Invalid community update id.' }
  }

  if (action !== 'approve' && action !== 'reject') {
    return { ok: false, error: 'Invalid moderation action.' }
  }

  const headers = buildAuthHeaders(session)
  if (!headers.authorization) {
    return { ok: false, error: 'Authentication required to moderate community updates.' }
  }


  const response = await fetch(`${apiBase}/community-updates/${id}/${action}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    return { ok: false, error: body || `Request failed with ${response.status}` }
  }

  const update = (await response.json()) as CommunityTrailUpdate
  return { ok: true, update }
}

export async function approveCommunityTrailUpdate(
  id: string,
  apiBase = defaultCommunityApiBase,
  session: SessionState = { token: '', status: 'anonymous' },
): Promise<{ ok: true; update: CommunityTrailUpdate } | { ok: false; error: string }> {
  return moderateCommunityTrailUpdate(id, 'approve', apiBase, session)
}

export async function rejectCommunityTrailUpdate(
  id: string,
  apiBase = defaultCommunityApiBase,
  session: SessionState = { token: '', status: 'anonymous' },
): Promise<{ ok: true; update: CommunityTrailUpdate } | { ok: false; error: string }> {
  return moderateCommunityTrailUpdate(id, 'reject', apiBase, session)
}

export const pendingCommunityPayload = buildCommunityPayload
