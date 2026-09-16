import { deriveReadinessStatus } from '@gohealt/shared-types'
import type { SafetySummary, Trail, TrailPermitInfo, TrailReadiness } from '@gohealt/shared-types'

export const defaultPermit: TrailPermitInfo = {
  required: false,
  notes: ['Check the latest district or forestry notice before departure.'],
}

export const defaultSafety: SafetySummary = {
  level: 'normal',
  reasons: [],
  source: 'system',
  observedAt: new Date().toISOString(),
}

export function buildTrailReadiness(trail: Trail): TrailReadiness {
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
    // Single source of truth: the weather-aware derivation in @gohealt/shared-types.
    // A local reimplementation silently dropped the weather input and reported
    // advisory-weather trails as 'ready'.
    status: deriveReadinessStatus(trail.weather, safety, missing.length),
    missing,
    recommendations,
  }
}