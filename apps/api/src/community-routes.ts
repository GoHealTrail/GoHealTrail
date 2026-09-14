import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import type { AuthenticatedUser } from './auth.js'
import type { CommunityTrailUpdate } from '@gohealt/shared-types'

type AuthGuard = (request: FastifyRequest, reply: FastifyReply) => Promise<AuthenticatedUser | null>
type CommunityRow = { id: string; trail_id: string; category: CommunityTrailUpdate['category']; severity: CommunityTrailUpdate['severity']; message: string; reporter: string; status: 'pending' | 'approved' | 'rejected'; created_at: string }

function present(row: CommunityRow) {
  return { id: row.id, trailId: row.trail_id, category: row.category, severity: row.severity, message: row.message, reporter: row.reporter, status: row.status, reportedAt: row.created_at }
}

export function registerCommunityRoutes(server: FastifyInstance, db: SupabaseClient, authenticate: AuthGuard) {
  server.post('/community-updates', async (request, reply) => {
    const user = await authenticate(request, reply)
    if (!user) return
    const payload = request.body as { trailId?: string; category?: CommunityTrailUpdate['category']; severity?: CommunityTrailUpdate['severity']; message?: string }
    if (!payload?.trailId || !payload.category || !payload.severity || !payload.message) return reply.code(400).send({ error: 'Invalid community update payload.' })
    const { data, error } = await db.from('community_trail_updates').insert({ id: randomUUID(), trail_id: payload.trailId, category: payload.category, severity: payload.severity, message: payload.message, reporter: user.id }).select('id, trail_id, category, severity, message, reporter, status, created_at').single()
    if (error) return reply.code(500).send({ error: `Database error: ${error.message}` })
    return reply.code(201).send(present(data as CommunityRow))
  })

  async function moderate(status: 'approved' | 'rejected', request: FastifyRequest, reply: FastifyReply) {
    const user = await authenticate(request, reply)
    if (!user) return
    const { id } = request.params as { id: string }
    const { data, error } = await db.from('community_trail_updates').update({ status }).eq('id', id).select('id, trail_id, category, severity, message, reporter, status, created_at').single()
    if (error) return reply.code(500).send({ error: `Database error: ${error.message}` })
    if (!data) return reply.code(404).send({ error: 'Update not found' })
    return present(data as CommunityRow)
  }

  server.post('/community-updates/:id/approve', async (request, reply) => moderate('approved', request, reply))
  server.post('/community-updates/:id/reject', async (request, reply) => moderate('rejected', request, reply))
}
