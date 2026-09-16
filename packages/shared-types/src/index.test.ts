import assert from 'node:assert/strict'
import test from 'node:test'
import type { Trail } from './index.js'

test('shared trail contract accepts safety and permit metadata', () => {
  const trail: Trail = {
    id: 't-001',
    name: 'Test trail',
    state: 'Selangor',
    difficulty: 'easy',
    distanceKm: 2,
    durationMinutes: 60,
    permit: { required: true, localFee: 5, notes: ['Apply before arrival'] },
    safety: {
      level: 'advisory',
      reasons: ['Rain expected'],
      source: 'system',
      observedAt: '2026-09-15T00:00:00Z',
    },
  }

  assert.equal(trail.permit?.required, true)
  assert.equal(trail.safety?.level, 'advisory')
})
