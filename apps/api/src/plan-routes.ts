import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import type { AuthenticatedUser } from './auth.js'

type PlanPayload = {
  title?: string
  startDate?: string
  endDate?: string
  itinerary?: Array<{ day: number; trailId: string; notes: string }>
  checklist?: string[]
}

/* eslint-disable no-unused-vars -- request/reply are contract parameter names. */
type AuthGuard = (request: FastifyRequest, reply: FastifyReply) => Promise<AuthenticatedUser | null>
/* eslint-enable no-unused-vars */

export function registerPlanRoutes(server: FastifyInstance, db: SupabaseClient, authenticate: AuthGuard) {
  server.get('/plans', async (request, reply) => {
    const user = await authenticate(request, reply)
    if (!user) return

    const requestedUserId = (request.query as { userId?: string }).userId
    if (requestedUserId && requestedUserId !== user.id) {
      return reply.code(403).send({ error: 'Cannot access another user’s plans' })
    }

    const { data, error } = await db.from('trip_plans').select('*').eq('user_id', user.id)
    if (error) throw new Error(`Database error: ${error.message}`)
    return { plans: data || [] }
  })

  server.post('/plans', async (request, reply) => {
    const user = await authenticate(request, reply)
    if (!user) return

    const payload = request.body as PlanPayload
    if (!payload?.title || !payload.startDate || !payload.endDate || !Array.isArray(payload.itinerary) || !Array.isArray(payload.checklist)) {
      await reply.code(400)
      return { error: 'Invalid plan payload' }
    }

    const plan = {
      id: randomUUID(),
      title: payload.title,
      user_id: user.id,
      start_date: payload.startDate,
      end_date: payload.endDate,
      itinerary: payload.itinerary,
      checklist: payload.checklist,
    }
    const { data, error } = await db.from('trip_plans').insert(plan).select().single()
    if (error) {
      await reply.code(500)
      return { error: `Database error: ${error.message}` }
    }
    return reply.code(201).send(data)
  })
}
