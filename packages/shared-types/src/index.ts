export type UserRole = 'user' | 'guide' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Trail {
  id: string
  name: string
  state: string
  difficulty: 'easy' | 'moderate' | 'hard'
  distanceKm: number
  durationMinutes: number
  hasWater?: boolean
}

export interface TripPlan {
  id: string
  title: string
  userId: string
  startDate: string
  endDate: string
  itinerary: Array<{ day: number; trailId: string; notes: string }>
  checklist: string[]
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
