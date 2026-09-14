import assert from 'node:assert/strict'
import test from 'node:test'
import Fastify from 'fastify'
import { registerPlanRoutes } from './plan-routes.js'

function queryResult(data: unknown, error: unknown = null) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    insert: () => chain,
    single: async () => ({ data, error }),
    /* eslint-disable no-unused-vars -- thenable test-double contract. */
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
    /* eslint-enable no-unused-vars */
  }
  return chain
}

test('returns only the authenticated user plans', async () => {
  const db = {
    from: (table: string) => {
      assert.equal(table, 'trip_plans')
      return queryResult([{ id: 'plan-1', user_id: 'user-1' }])
    },
  } as never
  const server = Fastify()
  registerPlanRoutes(server, db, async () => ({ id: 'user-1' }))
  await server.ready()

  const response = await server.inject({
    method: 'GET',
    url: '/plans?userId=user-1',
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), { plans: [{ id: 'plan-1', user_id: 'user-1' }] })
  await server.close()
})

test('rejects access to another user plans', async () => {
  const server = Fastify()
  registerPlanRoutes(server, { from: () => queryResult([]) } as never, async () => ({ id: 'user-1' }))
  await server.ready()

  const response = await server.inject({
    method: 'GET',
    url: '/plans?userId=user-2',
  })

  assert.equal(response.statusCode, 403)
  assert.deepEqual(response.json(), { error: 'Cannot access another user’s plans' })
  await server.close()
})

test('creates a plan owned by the authenticated user', async () => {
  let inserted: Record<string, unknown> | undefined
  const db = {
    from: () => ({
      insert: (value: Record<string, unknown>) => {
        inserted = value
        return {
          select: () => ({
            single: async () => ({ data: { ...value, created_at: 'now' }, error: null }),
            /* eslint-disable no-unused-vars -- thenable test-double contract. */
            then: (resolve: (value: { data: Record<string, unknown>; error: null }) => unknown) =>
              Promise.resolve({ data: { ...value, created_at: 'now' }, error: null }).then(resolve),
            /* eslint-enable no-unused-vars */
          }),
        }
      },
    }),
  } as never
  const server = Fastify()
  registerPlanRoutes(server, db, async () => ({ id: 'user-1' }))
  await server.ready()

  const response = await server.inject({
    method: 'POST',
    url: '/plans',
    payload: {
      title: 'Weekend hike',
      userId: 'attacker-supplied-id',
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      itinerary: [],
      checklist: ['Water'],
    },
  })

  assert.equal(response.statusCode, 201)
  assert.equal(inserted?.user_id, 'user-1')
  assert.notEqual(inserted?.user_id, 'attacker-supplied-id')
  await server.close()
})
