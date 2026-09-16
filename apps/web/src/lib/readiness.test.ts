import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { Trail } from '@gohealt/shared-types'

import { buildTrailReadiness } from './readiness'

function makeTrail(overrides: Partial<Trail> = {}): Trail {
  return {
    id: 't-test',
    name: 'Test Trail',
    state: 'Selangor',
    difficulty: 'moderate',
    distanceKm: 5,
    durationMinutes: 120,
    hasWater: true,
    ...overrides,
  }
}

const advisoryWeather = {
  risk: 'advisory' as const,
  reasons: ['Recent heavy rain'],
  observedAt: new Date().toISOString(),
}

test('advisory weather downgrades readiness to warning', () => {
  const readiness = buildTrailReadiness(makeTrail({ weather: advisoryWeather }))
  assert.equal(readiness.status, 'warning')
})

test('danger weather blocks readiness', () => {
  const weather = { ...advisoryWeather, risk: 'danger' as const }
  assert.equal(buildTrailReadiness(makeTrail({ weather })).status, 'blocked')
})

test('expired advisory weather does not downgrade readiness', () => {
  const weather = {
    ...advisoryWeather,
    expiresAt: new Date(Date.now() - 60_000).toISOString(),
  }
  assert.equal(buildTrailReadiness(makeTrail({ weather })).status, 'ready')
})

test('normal weather with water and no permit stays ready', () => {
  assert.equal(buildTrailReadiness(makeTrail()).status, 'ready')
})

test('missing water still warns', () => {
  const readiness = buildTrailReadiness(makeTrail({ hasWater: false }))
  assert.equal(readiness.status, 'warning')
  assert.deepEqual(readiness.missing, ['Carry extra water'])
})

test('required permit still warns and is listed as missing', () => {
  const readiness = buildTrailReadiness(makeTrail({ permit: { required: true, notes: [] } }))
  assert.equal(readiness.status, 'warning')
  assert.deepEqual(readiness.missing, ['Confirm permit'])
})

test('danger safety blocks regardless of normal weather', () => {
  const safety = {
    level: 'danger' as const,
    reasons: ['Landslide'],
    source: 'official' as const,
    observedAt: new Date().toISOString(),
  }
  assert.equal(buildTrailReadiness(makeTrail({ safety })).status, 'blocked')
})