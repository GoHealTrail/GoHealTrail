export type UserRole = 'user' | 'guide' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export type TrailDifficulty = 'easy' | 'moderate' | 'hard'
export type SafetyLevel = 'normal' | 'advisory' | 'danger' | 'closed'
export type SafetySource = 'official' | 'ranger' | 'community' | 'system'
export type WeatherRisk = 'normal' | 'advisory' | 'danger'

export interface WeatherSummary {
  risk: WeatherRisk
  reasons: string[]
  observedAt: string
  expiresAt?: string
}

export function isWeatherAlertActive(weather: WeatherSummary, now = new Date()): boolean {
  return !weather.expiresAt || new Date(weather.expiresAt).getTime() > now.getTime()
}

export function weatherRiskToSafetyLevel(risk: WeatherRisk): SafetyLevel {
  return risk
}

export function deriveReadinessStatus(
  weather: WeatherSummary | undefined,
  safety: SafetySummary | undefined,
  missingCount: number,
): TrailReadiness['status'] {
  const weatherActive = weather ? isWeatherAlertActive(weather) : false
  const safetyLevel = safety?.level ?? 'normal'
  const weatherDanger = weatherActive && weather?.risk === 'danger'
  const safetyDanger = safetyLevel === 'danger' || safetyLevel === 'closed'

  if (weatherDanger || safetyDanger) return 'blocked'
  if (missingCount > 0 || (weatherActive && weather?.risk === 'advisory') || safetyLevel === 'advisory') return 'warning'
  return 'ready'
}

export interface TrailPermitInfo {
  required: boolean
  localFee?: number
  foreignFee?: number
  leadTimeDays?: number
  notes: string[]
}

export interface SafetySummary {
  level: SafetyLevel
  reasons: string[]
  source: SafetySource
  observedAt: string
  expiresAt?: string
}

export interface TrailReadiness {
  status: 'ready' | 'warning' | 'blocked'
  missing: string[]
  recommendations: string[]
}

export interface Trail {
  id: string
  name: string
  state: string
  difficulty: TrailDifficulty
  distanceKm: number
  durationMinutes: number
  hasWater?: boolean
  permit?: TrailPermitInfo
  safety?: SafetySummary
  weather?: WeatherSummary
}

export interface TripPlan {
  id: string
  title: string
  userId: string
  startDate: string
  endDate: string
  itinerary: Array<{ day: number; trailId: string; notes: string }>
  checklist: string[]
  readiness?: TrailReadiness
  offlineManifestVersion?: string
}

export interface CommunityTrailUpdate {
  id: string
  trailId: string
  category: 'closure' | 'water' | 'condition' | 'leech' | 'mud' | 'other'
  severity: 'info' | 'warning' | 'danger'
  status: 'pending' | 'approved' | 'rejected'
  message: string
  reporter: string
  reportedAt: string
}
