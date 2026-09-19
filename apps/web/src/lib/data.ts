import type {
  CommunityTrailUpdate,
  Trail,
  WeatherSummary,
} from '@gohealt/shared-types'

/* ------------------------------------------------------------------ */
/* Trails                                                              */
/* ------------------------------------------------------------------ */

export type TrailSeed = Trail & {
  tagline: string
  region: string
  heroGradient: string
  elevationGain: number
  elevationProfile: number[]
  rating: number
  reviews: number
  features: string[]
  bestMonths: string
}

export const trails: TrailSeed[] = [
  {
    id: 't-001',
    name: 'Bukit Broga Skywalk',
    tagline: 'Golden grassland ridges above the morning clouds',
    state: 'Selangor',
    region: 'Broga, Semenyih',
    difficulty: 'moderate',
    distanceKm: 6.5,
    durationMinutes: 240,
    hasWater: true,
    heroGradient: 'from-mint-500/30 via-forest-700/40 to-sunrise-500/20',
    elevationGain: 400,
    elevationProfile: [0, 60, 140, 120, 210, 260, 340, 400, 360, 400],
    rating: 4.6,
    reviews: 1284,
    features: ['Sunrise point', 'Grassland ridge', 'Photo deck'],
    bestMonths: 'Mar – Sep',
  },
  {
    id: 't-002',
    name: 'Gunung Stong Sunset Loop',
    tagline: 'Seven-tier waterfall country in Kelantan highlands',
    state: 'Kelantan',
    region: 'Dabong',
    difficulty: 'hard',
    distanceKm: 11,
    durationMinutes: 360,
    hasWater: true,
    heroGradient: 'from-river-400/25 via-forest-700/40 to-mint-500/20',
    elevationGain: 890,
    elevationProfile: [0, 120, 260, 310, 480, 620, 560, 740, 830, 890, 820, 890],
    rating: 4.8,
    reviews: 862,
    features: ['Jelawang waterfall', 'Camping', 'River crossing'],
    bestMonths: 'Feb – Aug',
  },
  {
    id: 't-003',
    name: 'Batu Burok Jungle Route',
    tagline: 'Family-friendly shaded loop beside heritage casuarina groves',
    state: 'Pahang',
    region: 'Kuantan fringe',
    difficulty: 'easy',
    distanceKm: 4.2,
    durationMinutes: 150,
    hasWater: false,
    heroGradient: 'from-moss-400/25 via-forest-700/40 to-river-400/15',
    elevationGain: 140,
    elevationProfile: [0, 30, 55, 90, 80, 120, 140, 110, 140],
    rating: 4.2,
    reviews: 447,
    features: ['Shaded canopy', 'Birdwatching', 'Beginner'],
    bestMonths: 'Year-round',
  },
  {
    id: 't-004',
    name: 'FRIM River Trail',
    tagline: 'Research forest boardwalks and a gentle riverside flow',
    state: 'Selangor',
    region: 'Kepong',
    difficulty: 'easy',
    distanceKm: 5,
    durationMinutes: 120,
    hasWater: false,
    heroGradient: 'from-mint-400/20 via-forest-700/40 to-moss-300/15',
    elevationGain: 90,
    elevationProfile: [0, 20, 40, 60, 50, 75, 90, 70, 90],
    rating: 4.4,
    reviews: 1932,
    features: ['Canopy boardwalk', 'Water station', 'Wheelchair sections'],
    bestMonths: 'Year-round',
  },
  {
    id: 't-005',
    name: 'Mount Nuang Camp Ridge',
    tagline: 'The classic Selangor big-mountain sufferfest',
    state: 'Selangor',
    region: 'Hulu Langat',
    difficulty: 'hard',
    distanceKm: 9,
    durationMinutes: 320,
    hasWater: true,
    heroGradient: 'from-coral-500/20 via-forest-700/45 to-mint-500/15',
    elevationGain: 980,
    elevationProfile: [0, 150, 320, 470, 430, 610, 780, 920, 870, 980],
    rating: 4.7,
    reviews: 733,
    features: ['Camp ridge', 'Mossy forest', 'Permit checkpoint'],
    bestMonths: 'Mar – Oct',
  },
]

/* ------------------------------------------------------------------ */
/* Alerts & weather                                                    */
/* ------------------------------------------------------------------ */

export const demoAlerts = [
  {
    trailId: 't-002',
    level: 'warning' as const,
    title: 'Recent heavy rain',
    message:
      'Sections near summit are slippery. Carry anti-slip gear and avoid dusk travel.',
  },
  {
    trailId: 't-004',
    level: 'info' as const,
    title: 'Updated water refill point',
    message: 'Water station at FRIM River Trail checkpoint is open on weekends.',
  },
]

const weatherRiskFromAlert: Record<'info' | 'warning' | 'danger', WeatherSummary['risk']> = {
  info: 'normal',
  warning: 'advisory',
  danger: 'danger',
}

export function weatherForTrail(trailId: string): WeatherSummary | undefined {
  const alert = demoAlerts.find((item) => item.trailId === trailId)
  if (!alert) return undefined
  return {
    risk: weatherRiskFromAlert[alert.level],
    reasons: [alert.title, alert.message],
    observedAt: new Date().toISOString(),
  }
}

/* ------------------------------------------------------------------ */
/* Community                                                           */
/* ------------------------------------------------------------------ */

export const seedCommunityUpdates: CommunityTrailUpdate[] = [
  {
    id: 'seed-1',
    trailId: 't-002',
    category: 'water',
    severity: 'warning',
    status: 'approved',
    message: 'Water flow currently low before sunrise; carry extra water.',
    reporter: 'Community ranger report',
    reportedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'seed-2',
    trailId: 't-001',
    category: 'leech',
    severity: 'warning',
    status: 'approved',
    message: 'Leech activity is common in the lower stretch after rain.',
    reporter: 'Local hiker',
    reportedAt: new Date(Date.now() - 7 * 3600_000).toISOString(),
  },
  {
    id: 'seed-3',
    trailId: 't-004',
    category: 'mud',
    severity: 'warning',
    status: 'approved',
    message: 'Mud patches reported around the river crossing.',
    reporter: 'Volunteer check-in',
    reportedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
  },
  {
    id: 'seed-4',
    trailId: 't-005',
    category: 'condition',
    severity: 'info',
    status: 'pending',
    message: 'Trail markers refreshed between Camp Lolo and the ridge — much easier to follow now.',
    reporter: 'Weekend volunteer crew',
    reportedAt: new Date(Date.now() - 30 * 3600_000).toISOString(),
  },
]

/* ------------------------------------------------------------------ */
/* Reference data (Kompendium extraction)                              */
/* ------------------------------------------------------------------ */

export type RegionReference = {
  state: string
  amenityForests: number
  stateParkForests: number
  totalSites: number
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

export const safetyRules = [
  'Do not vandalize or damage plants and facilities.',
  'Keep the forest clean and preserve its beauty.',
  'Any fire or cooking activity must be supervised to prevent forest-fire risk.',
  'Climbing, fishing, camping, and chalet/cabin use requires prior permission.',
]

export const defaultChecklist = [
  'Water (2L min)',
  'Trail food',
  'Power bank',
  'First aid kit',
  'Rain jacket',
  'Permit confirmed',
  'Weather checked',
  'Offline package downloaded',
]

export const offlineManifestVersion = '2026-09-15-web-readiness-v1'

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
