import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPlan,
  buildCommunityPayload,
  buildTrailReadiness,
  mobileAppSections,
  moderateCommunityTrailUpdate,
  submitCommunityTrailUpdate,
} from './index.js'
import { DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS, offlinePackageFreshness } from '@gohealt/shared-types'
import type { Trail } from '@gohealt/shared-types'

test('mobile app exposes the core trail workflow sections', () => {
  assert.deepEqual(mobileAppSections, ['Discover trails', 'Trip planner', 'Community updates', 'Emergency'])
})

test('builds a one-day plan with readiness and offline manifest metadata', () => {
  const plan = buildPlan('Weekend plan', 'user-1', 't-002')

  assert.equal(plan.title, 'Weekend plan')
  assert.equal(plan.userId, 'user-1')
  assert.equal(plan.itinerary[0]?.trailId, 't-002')
  assert.ok(plan.checklist.length >= 3)
  assert.equal(plan.offlineManifestVersion, '2026-09-15-mobile-readiness-v1')
  assert.equal(plan.readiness?.status, 'ready')
})

test('stamps a fresh offline package on the generated plan', () => {
  const plan = buildPlan('Weekend plan', 'user-1', 't-002')
  const pkg = plan.offlinePackage

  assert.ok(pkg)
  assert.equal(pkg?.manifestVersion, plan.offlineManifestVersion)
  assert.equal(pkg?.maxAgeDays, DEFAULT_OFFLINE_PACKAGE_MAX_AGE_DAYS)
  assert.ok(!Number.isNaN(Date.parse(pkg?.downloadedAt ?? '')))
  assert.equal(offlinePackageFreshness(pkg!), 'fresh')
})

test('marks trails without water as needing preparation', () => {
  const trail: Trail = {
    id: 't-test',
    name: 'Dry trail',
    state: 'Selangor',
    difficulty: 'easy',
    distanceKm: 2,
    durationMinutes: 60,
    hasWater: false,
  }

  const readiness = buildTrailReadiness(trail)

  assert.equal(readiness.status, 'warning')
  assert.deepEqual(readiness.missing, ['Carry extra water'])
})

test('blocks dangerous trails', () => {
  const trail: Trail = {
    id: 't-danger',
    name: 'Danger trail',
    state: 'Pahang',
    difficulty: 'hard',
    distanceKm: 8,
    durationMinutes: 300,
    safety: {
      level: 'danger',
      reasons: ['Flash flood warning'],
      source: 'official',
      observedAt: '2026-09-15T00:00:00Z',
    },
  }

  assert.equal(buildTrailReadiness(trail).status, 'blocked')
})

test('rejects community submission without an authenticated session', async () => {
  const result = await submitCommunityTrailUpdate(buildCommunityPayload(), 'http://127.0.0.1:9')

  assert.deepEqual(result, {
    ok: false,
    error: 'Authentication required to submit community updates.',
  })
})

test('rejects moderation without an authenticated session', async () => {
  const result = await moderateCommunityTrailUpdate('update-1', 'approve', 'http://127.0.0.1:9')

  assert.deepEqual(result, {
    ok: false,
    error: 'Authentication required to moderate community updates.',
  })
})
