import assert from 'node:assert/strict'
import test from 'node:test'
import Fastify from 'fastify'
import { registerSosRoutes } from './sos-routes.js'

function sosDb(data: unknown, error: unknown = null) {
  const chain = {
    insert: () => chain,
    select: () => chain,
    single: async () => ({ data, error }),
    /* eslint-disable no-unused-vars -- thenable test-double contract. */
    then: (resolve: (value: { data: unknown; error: unknown }) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
    /* eslint-enable no-unused-vars */
  }
  return { from: () => chain } as never
}

test('persists an authenticated SOS event and returns its record', async () => {
  const server = Fastify()
  registerSosRoutes(
    server,
    sosDb({
      id: 'sos-1',
      user_id: 'user-1',
      latitude: 3.139,
      longitude: 101.686,
      contacts: ['+60123456789'],
      notes: 'Need assistance',
      status: 'accepted',
      created_at: 'now',
    }),
    async () => ({ id: 'user-1', role: 'user' })
  )
  await server.ready()

  const response = await server.inject({
    method: 'POST',
    url: '/sos',
    payload: {
      latitude: 3.139,
      longitude: 101.686,
      contacts: ['+60123456789'],
      notes: 'Need assistance',
    },
  })

  assert.equal(response.statusCode, 201)
  assert.equal(response.json().eventId, 'sos-1')
  assert.equal(response.json().userId, 'user-1')
  await server.close()
})

test('rejects SOS payloads without coordinates', async () => {
  const server = Fastify()
  registerSosRoutes(server, sosDb(null), async () => ({ id: 'user-1', role: 'user' }))
  await server.ready()

  const response = await server.inject({ method: 'POST', url: '/sos', payload: {} })

  assert.equal(response.statusCode, 400)
  await server.close()
})

test('requires authentication for SOS creation', async () => {
  const server = Fastify()
  registerSosRoutes(server, sosDb(null), async (_request, reply) => {
    await reply.code(401).send({ error: 'Authentication required' })
    return null
  })
  await server.ready()

  const response = await server.inject({ method: 'POST', url: '/sos', payload: {} })

  assert.equal(response.statusCode, 401)
  await server.close()
})
