import Fastify from 'fastify'
import cors from '@fastify/cors'
import 'dotenv/config'
import type { CommunityTrailUpdate } from '@gohealt/shared-types'
import { supabase } from './lib/supabase.js'
import { seedDatabase } from './seed.js'
import { requireAuthenticatedUser } from './auth.js'
import { registerPlanRoutes } from './plan-routes.js'
import { registerCommunityRoutes } from './community-routes.js'
import { registerSosRoutes } from './sos-routes.js'

// Raw shape returned by Supabase select() on community_trail_updates.
// Columns are snake_case; the handlers map them to the camelCase API shape.
type CommunityUpdateRow = {
  id: string
  trail_id: string
  category: CommunityTrailUpdate['category']
  severity: CommunityTrailUpdate['severity']
  message: string
  reporter: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

const server = Fastify({ logger: true })

async function bootstrap() {
  await server.register(cors, {
    origin: true,
  })

  // Health check
  server.get('/health', async () => ({
    ok: true,
    service: 'gohealttrail-api',
    version: '0.1.0',
  }))

  // Seed endpoint (for development)
  server.post('/seed', async (request, reply) => {
    try {
      await seedDatabase()
      return { success: true }
    } catch (err) {
      await reply.code(500)
      return { error: 'Seed failed', details: String(err) }
    }
  })

  // GET /trails
  server.get('/trails', async (request) => {
    const state = (request.query as { state?: string }).state
    const difficulty = (request.query as { difficulty?: string }).difficulty

    let query = supabase.from('trails').select('*')
    if (state) query = query.ilike('state', `%${state}%`)
    if (difficulty) query = query.eq('difficulty', difficulty)

    const { data, error } = await query
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      trails: data || [],
      count: data?.length || 0,
    }
  })

  // GET /trails/:id
  server.get('/trails/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { data: trail, error } = await supabase
      .from('trails')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !trail) {
      await reply.code(404)
      return { error: 'Trail not found' }
    }

    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .eq('trail_id', id)

    if (alertsError) {
      await reply.code(500)
      return { error: `Database error: ${alertsError.message}` }
    }

    return { trail, alerts: alerts || [] }
  })

  // GET /alerts
  server.get('/alerts', async () => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      alerts: data || [],
      activeWarnings: (data || []).filter((a) => a.level !== 'info').length,
    }
  })

  registerPlanRoutes(server, supabase, requireAuthenticatedUser)
  registerCommunityRoutes(server, supabase, requireAuthenticatedUser)
  registerSosRoutes(server, supabase, requireAuthenticatedUser)


  // GET /offline-manifest
  server.get('/offline-manifest', async () => {
    const { data: trails, error } = await supabase.from('trails').select('*')
    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return {
      generatedAt: new Date().toISOString(),
      version: `${(trails || []).length}-${new Date().toISOString().slice(0, 10)}`,
      trails: trails || [],
    }
  })

  // SOS is registered by registerSosRoutes.

  // GET /community-updates
  server.get('/community-updates', async () => {
    const { data, error } = await supabase
      .from('community_trail_updates')
      .select('id, trail_id, category, severity, message, reporter, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    const rows = (data || []) as CommunityUpdateRow[]

    return {
      updates: rows.map((row) => ({
        id: row.id,
        trailId: row.trail_id,
        category: row.category,
        severity: row.severity,
        message: row.message,
        reporter: row.reporter,
        status: row.status,
        reportedAt: row.created_at,
      })),
    }
  })


  // GET /community-updates/pending
  server.get('/community-updates/pending', async () => {
    const { data, error } = await supabase
      .from('community_trail_updates')
      .select('id, trail_id, category, severity, message, reporter, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    const rows = (data || []) as CommunityUpdateRow[]

    return {
      updates: rows.map((row) => ({
        id: row.id,
        trailId: row.trail_id,
        category: row.category,
        severity: row.severity,
        message: row.message,
        reporter: row.reporter,
        status: row.status,
        reportedAt: row.created_at,
      })),
    }
  })

  /* Legacy community mutation handlers replaced by registerCommunityRoutes. */
  /*
  // POST /community-updates/:id/approve
  server.post('/community-updates/:id/approve', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data, error } = await supabase
      .from('community_trail_updates')
      .update({ status: 'approved' })
      .eq('id', id)
      .select('id, trail_id, category, severity, message, reporter, status, created_at')
      .single()

    if (error) {
      await reply.code(500)
      return { error: `Database error: ${error.message}` }
    }

    if (!data) {
      await reply.code(404)
      return { error: 'Update not found' }
    }

    return {
      id: data.id,
      trailId: data.trail_id,
      category: data.category,
      severity: data.severity,
      message: data.message,
      reporter: data.reporter,
      status: data.status,
      reportedAt: data.created_at,
    }
  })

  // POST /community-updates/:id/reject
  server.post('/community-updates/:id/reject', async (request, reply) => {
    const { id } = request.params as { id: string }

    const { data, error } = await supabase
      .from('community_trail_updates')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('id, trail_id, category, severity, message, reporter, status, created_at')
      .single()

    if (error) {
      await reply.code(500)
      return { error: `Database error: ${error.message}` }
    }

    if (!data) {
      await reply.code(404)
      return { error: 'Update not found' }
    }

    return {
      id: data.id,
      trailId: data.trail_id,
      category: data.category,
      severity: data.severity,
      message: data.message,
      reporter: data.reporter,
      status: data.status,
      reportedAt: data.created_at,
    }
  })

  // POST /community-updates
  server.post('/community-updates', async (request, reply) => {
    const user = await requireAuthenticatedUser(request, reply)
    if (!user) return

    const payload = request.body as {
      trailId?: string
      category?: CommunityTrailUpdate['category']
      severity?: CommunityTrailUpdate['severity']
      message?: string
      reporter?: string
    }

    if (
      !payload?.trailId ||
      !payload?.category ||
      !payload?.severity ||
      !payload?.message ||
      !payload?.reporter
    ) {
      await reply.code(400)
      return { error: 'Invalid community update payload.' }
    }

    const nextUpdate = {
      id: randomUUID(),
      trail_id: payload.trailId,
      category: payload.category,
      severity: payload.severity,
      message: payload.message,
      reporter: user.id,
    }

    const { data, error } = await supabase
      .from('community_trail_updates')
      .insert(nextUpdate)
      .select('id, trail_id, category, severity, message, reporter, status, created_at')
      .single()

    if (error) {
      await reply.code(500)
      return { error: `Database error: ${error.message}` }
    }

    await reply.code(201)
    return {
      id: data.id,
      trailId: data.trail_id,
      category: data.category,
      severity: data.severity,
      message: data.message,
      reporter: data.reporter,
      status: data.status,
      reportedAt: data.created_at,
    }
  })
  */

  await server.listen({ host: '0.0.0.0', port: 8080 })
}

bootstrap().catch((err) => {
  server.log.error(err)
  process.exit(1)
})

export default server