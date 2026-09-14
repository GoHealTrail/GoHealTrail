import assert from 'node:assert/strict'
import test from 'node:test'
import { makeRequireAuthenticatedUser } from './auth.js'

function request(authorization?: string) {
  return { headers: authorization ? { authorization } : {} } as never
}

function reply() {
  const state = { status: 200, body: undefined as unknown }
  const value = {
    code(status: number) {
      state.status = status
      return value
    },
    send(body: unknown) {
      state.body = body
      return value
    },
    state,
  }
  return value
}

test('rejects requests without a bearer token', async () => {
  const response = reply()
  const requireUser = makeRequireAuthenticatedUser(async () => ({ data: { user: null }, error: null }))
  const user = await requireUser(request(), response as never)

  assert.equal(user, null)
  assert.equal(response.state.status, 401)
  assert.deepEqual(response.state.body, { error: 'Authentication required' })
})

test('rejects malformed authorization headers', async () => {
  const response = reply()
  const requireUser = makeRequireAuthenticatedUser(async () => ({ data: { user: null }, error: null }))
  const user = await requireUser(request('Basic token'), response as never)

  assert.equal(user, null)
  assert.equal(response.state.status, 401)
  assert.deepEqual(response.state.body, { error: 'Authentication required' })
})

test('returns the Supabase user for a valid bearer token', async () => {
  const response = reply()
  const requireUser = makeRequireAuthenticatedUser(async () => ({
    data: { user: { id: 'user-123', email: 'user@example.test' } },
    error: null,
  }))

  const user = await requireUser(request('Bearer valid-token'), response as never)

  assert.deepEqual(user, { id: 'user-123', email: 'user@example.test' })
  assert.equal(response.state.status, 200)
})

test('rejects an invalid Supabase token', async () => {
  const response = reply()
  const requireUser = makeRequireAuthenticatedUser(async () => ({
    data: { user: null },
    error: new Error('invalid token'),
  }))

  const user = await requireUser(request('Bearer invalid-token'), response as never)

  assert.equal(user, null)
  assert.equal(response.state.status, 401)
  assert.deepEqual(response.state.body, { error: 'Invalid authentication token' })
})
