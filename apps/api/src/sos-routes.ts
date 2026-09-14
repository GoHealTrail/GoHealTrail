import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthenticatedUser } from './auth.js'

/* eslint-disable no-unused-vars -- request/reply are contract parameter names. */
type AuthGuard = (request: FastifyRequest, reply: FastifyReply) => Promise<AuthenticatedUser | null>
/* eslint-enable no-unused-vars */

type SosRow = {
  id: string
  user_id: string
  latitude: number
  longitude: number
  contacts: string[] | null
  notes: string | null
  status: string
  created_at: string
}

export function registerSosRoutes(server: FastifyInstance, db: SupabaseClient, authenticate: AuthGuard) {
  server.post('/sos', async (request, reply) => {
    const user = await authenticate(request, reply)
    if (!user) return

    const payload = request.body as {
      latitude?: number
      longitude?: number
      contacts?: string[]
      notes?: string
    }

    if (typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') {
      return reply.code(400).send({ error: 'Invalid SOS payload. Numeric latitude/longitude required.' })
    }

    const { data, error } = await db
      .from('sos_events')
      .insert({
        user_id: user.id,
        latitude: payload.latitude,
        longitude: payload.longitude,
        contacts: payload.contacts ?? [],
        notes: payload.notes ?? null,
        status: 'accepted',
      })
      .select('id, user_id, latitude, longitude, contacts, notes, status, created_at')
      .single()

    if (error) return reply.code(500).send({ error: `Database error: ${error.message}` })

    const row = data as SosRow
    return reply.code(201).send({
      eventId: row.id,
      userId: row.user_id,
      status: row.status,
      sharedLocation: { latitude: row.latitude, longitude: row.longitude },
      contacts: row.contacts ?? [],
      notes: row.notes ?? 'No extra notes provided',
      createdAt: row.created_at,
    })
  })
}
