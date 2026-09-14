import assert from 'node:assert/strict'
import test from 'node:test'
import Fastify from 'fastify'
import { registerCommunityRoutes } from './community-routes.js'

function result(data: unknown, error: unknown = null) {
  const chain = {
    insert: () => chain,
    update: () => chain,
    eq: () => chain,
    select: () => chain,
    single: async () => ({ data, error }),
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  }
  return chain
}

function dbFor(data: unknown) {
  return { from: () => result(data) } as never
}

function moderationDb(data: unknown) {
  return {
    from: () => ({
      update: () => ({
        eq: () => {
          const chain = {
            select: () => chain,
            single: async () => ({ data, error: null }),
            then: (resolve: (value: { data: unknown; error: null }) => unknown) =>
              Promise.resolve({ data, error: null }).then(resolve),
            catch: (reject: (error: unknown) => unknown) => Promise.reject(reject),
          }
          return chain
        },
      }),
    }),
  } as never
}

test('creates a community update with the authenticated reporter', async () => {
  const server = Fastify()
  registerCommunityRoutes(
    server,
    dbFor({
      id: 'update-1', trail_id: 'trail-1', category: 'condition', severity: 'warning',
      message: 'Slippery rocks', reporter: 'user-1', status: 'pending', created_at: 'now',
    }),
    async () => ({ id: 'user-1' })
  )
  await server.ready()

  const response = await server.inject({
    method: 'POST',
    url: '/community-updates',
    payload: {
      trailId: 'trail-1', category: 'condition', severity: 'warning',
      message: 'Slippery rocks', reporter: 'attacker-supplied-id',
    },
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.json().reporter, 'user-1')
  await server.close()
})

test('moderates an update only through an authenticated request', async () => {
  const server = Fastify()
  registerCommunityRoutes(
    server,
    moderationDb({
      id: 'update-1', trail_id: 'trail-1', category: 'condition', severity: 'warning',
      message: 'Slippery rocks', reporter: 'user-1', status: 'approved', created_at: 'now',
    }),
    async () => ({ id: 'moderator-1' })
  )
  await server.ready()

  const response = await server.inject({ method: 'POST', url: '/community-updates/update-1/approve' })

  assert.equal(response.statusCode, 200)
  assert.equal(response.json().status, 'approved')
  await server.close()
})

test('rejects unauthenticated community submission', async () => {
  const server = Fastify()
  registerCommunityRoutes(server, dbFor(null), async (_request, reply) => {
    await reply.code(401).send({ error: 'Authentication required' })
    return null
  })
  await server.ready()

  const response = await server.inject({ method: 'POST', url: '/community-updates', payload: {} })

  assert.equal(response.statusCode, 401)
  await server.close()
})
