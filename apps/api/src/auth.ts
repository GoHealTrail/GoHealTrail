import type { FastifyReply, FastifyRequest } from 'fastify'
import { supabase } from './lib/supabase.js'

export type UserRole = 'user' | 'moderator' | 'admin'

export type AuthenticatedUser = {
  id: string
  email?: string
  role: UserRole
}

/* eslint-disable no-unused-vars -- token is part of the injected auth contract. */
type AuthLookup = (token: string) => Promise<{
  data: { user: { id: string; email?: string; app_metadata?: Record<string, unknown> } | null }
  error: unknown
}>
/* eslint-enable no-unused-vars */

function bearerToken(request: FastifyRequest) {
  const value = request.headers.authorization
  if (!value?.startsWith('Bearer ')) return null
  const token = value.slice('Bearer '.length).trim()
  return token || null
}

function roleFromMetadata(role: string | undefined): UserRole {
  return role === 'admin' || role === 'moderator' ? role : 'user'
}

export function makeRequireAuthenticatedUser(authLookup: AuthLookup) {
  return async function requireAuthenticatedUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<AuthenticatedUser | null> {
    const token = bearerToken(request)
    if (!token) {
      await reply.code(401).send({ error: 'Authentication required' })
      return null
    }

    const { data, error } = await authLookup(token)
    if (error || !data.user) {
      await reply.code(401).send({ error: 'Invalid authentication token' })
      return null
    }

    return {
      id: data.user.id,
      role: roleFromMetadata(typeof data.user.app_metadata?.role === 'string' ? data.user.app_metadata.role : undefined),
      ...(data.user.email ? { email: data.user.email } : {}),
    }
  }
}

export const requireAuthenticatedUser = makeRequireAuthenticatedUser(async (token) => {
  const { data, error } = await supabase.auth.getUser(token)
  return {
    data: {
      user: data.user
        ? {
            id: data.user.id,
            ...(data.user.email ? { email: data.user.email } : {}),
            app_metadata: data.user.app_metadata,
          }
        : null,
    },
    error,
  }
})
