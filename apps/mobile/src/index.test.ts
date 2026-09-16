import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildPlan,
  buildCommunityPayload,
  mobileAppSections,
  moderateCommunityTrailUpdate,
  submitCommunityTrailUpdate,
} from './index.js'

test('mobile app exposes the core trail workflow sections', () => {
  assert.deepEqual(mobileAppSections, ['Discover trails', 'Trip planner', 'Community updates', 'Emergency'])
})

test('builds a one-day plan with the selected trail and safety checklist', () => {
  const plan = buildPlan('Weekend plan', 'user-1', 't-002')

  assert.equal(plan.title, 'Weekend plan')
  assert.equal(plan.userId, 'user-1')
  assert.equal(plan.itinerary[0]?.trailId, 't-002')
  assert.ok(plan.checklist.length >= 3)
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
