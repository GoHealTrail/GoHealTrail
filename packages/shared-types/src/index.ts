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
