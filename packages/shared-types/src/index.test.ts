import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS, offlinePackageFreshness } from './index.js'
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

test('reports a freshly downloaded offline package as fresh', () => {
  const freshness = offlinePackageFreshness(
    {
      manifestVersion: 'v1',
      downloadedAt: '2026-09-16T00:00:00Z',
      maxAgeDays: DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS,
    },
    new Date('2026-09-16T12:00:00Z'),
  )

  assert.equal(freshness, 'fresh')
})

test('reports an offline package past half its max age as stale', () => {
  const freshness = offlinePackageFreshness(
    {
      manifestVersion: 'v1',
      downloadedAt: '2026-09-16T00:00:00Z',
      maxAgeDays: 7,
    },
    new Date('2026-09-20T00:00:00Z'),
  )

  assert.equal(freshness, 'stale')
})

test('reports an offline package past its max age as expired', () => {
  const freshness = offlinePackageFreshness(
    {
      manifestVersion: 'v1',
      downloadedAt: '2026-09-16T00:00:00Z',
      maxAgeDays: 7,
    },
    new Date('2026-09-30T00:00:00Z'),
  )

  assert.equal(freshness, 'expired')
})

test('treats an unparseable download timestamp as expired', () => {
  const freshness = offlinePackageFreshness(
    {
      manifestVersion: 'v1',
      downloadedAt: 'not-a-date',
      maxAgeDays: 7,
    },
    new Date('2026-09-16T00:00:00Z'),
  )

  assert.equal(freshness, 'expired')
})

test('treats a non-positive max age as expired', () => {
  const freshness = offlinePackageFreshness(
    {
      manifestVersion: 'v1',
      downloadedAt: '2026-09-16T00:00:00Z',
      maxAgeDays: 0,
    },
    new Date('2026-09-16T00:00:00Z'),
  )

  assert.equal(freshness, 'expired')
})