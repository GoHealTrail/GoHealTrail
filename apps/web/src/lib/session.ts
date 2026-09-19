import type { OfflinePackageMetadata } from '@gohealt/shared-types'
import type { SessionState } from '../components/Navbar'

export const SESSION_STORAGE_KEY = 'gohealttrail:session-token'
export const OFFLINE_PACKAGE_STORAGE_KEY = 'gohealttrail:offline-package'
export const LAST_PLAN_STORAGE_KEY = 'gohealttrail:last-plan'

export function readOfflinePackage(): OfflinePackageMetadata | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(OFFLINE_PACKAGE_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed?.manifestVersion !== 'string' ||
      typeof parsed?.downloadedAt !== 'string' ||
      typeof parsed?.maxAgeDays !== 'number'
    ) {
      return null
    }
    return parsed as OfflinePackageMetadata
  } catch {
    return null
  }
}

export function readSessionState(): SessionState {
  if (typeof window === 'undefined') {
    return { token: '', status: 'anonymous' }
  }
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return { token: '', status: 'anonymous' }
  try {
    const parsed = JSON.parse(raw)
    const token =
      typeof parsed?.token === 'string'
        ? parsed.token.trim()
        : typeof raw === 'string'
          ? raw.trim()
          : ''
    if (!token) return { token: '', status: 'anonymous' }
    return { token, status: 'signed-in' }
  } catch {
    const token = raw.trim()
    return token ? { token, status: 'signed-in' } : { token: '', status: 'anonymous' }
  }
}

export function storeSessionState(session: SessionState): void {
  if (typeof window === 'undefined') return
  if (session.status === 'anonymous' || !session.token) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function buildAuthHeaders(session: SessionState): { authorization: string } | Record<string, never> {
  if (session.status !== 'signed-in' || !session.token) return {}
  return { authorization: `Bearer ${session.token}` }
}
