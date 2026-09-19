'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Droplets,
  Bug,
  Footprints,
  Ban,
  Wrench,
  HelpCircle,
  Send,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import type { CommunityTrailUpdate } from '@gohealt/shared-types'
import { trails, seedCommunityUpdates, API_BASE, timeAgo } from '../lib/data'
import type { SessionState } from './Navbar'
import { buildAuthHeaders } from '../lib/session'
import { cn } from '../lib/utils'
import { Reveal } from './Reveal'

type CommunityFeedProps = {
  session: SessionState
}

const categoryIcon: Record<string, React.ReactNode> = {
  water: <Droplets className="h-4 w-4" />,
  leech: <Bug className="h-4 w-4" />,
  mud: <Footprints className="h-4 w-4" />,
  closure: <Ban className="h-4 w-4" />,
  condition: <Wrench className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
}

const severityColor: Record<string, string> = {
  info: 'text-river-300',
  warning: 'text-sunrise-300',
  danger: 'text-coral-400',
}

const statusColor: Record<string, string> = {
  pending: 'text-sunrise-300',
  approved: 'text-mint-300',
  rejected: 'text-coral-400',
}

const STATUS_FILTERS = ['all', 'approved', 'pending', 'rejected'] as const

export function CommunityFeed({ session }: CommunityFeedProps) {
  const [updates, setUpdates] = useState<CommunityTrailUpdate[]>(seedCommunityUpdates)
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  const [message, setMessage] = useState('')
  const [reporter, setReporter] = useState('')
  const [selectedTrailId, setSelectedTrailId] = useState(trails[0]?.id ?? '')
  const [category, setCategory] = useState<CommunityTrailUpdate['category']>('condition')
  const [severity, setSeverity] = useState<CommunityTrailUpdate['severity']>('warning')
  const [filterStatus, setFilterStatus] = useState<'all' | CommunityTrailUpdate['status']>('all')

  const isModerating = processingIds.length > 0

  useEffect(() => {
    let cancelled = false
    async function loadCommunityUpdates() {
      try {
        const response = await fetch(`${API_BASE}/community-updates`, { cache: 'no-store' })
        const payload = (await response.json()) as { updates?: CommunityTrailUpdate[] }
        if (!cancelled && payload.updates?.length) {
          setUpdates(payload.updates)
        }
      } catch {
        // keep seed fallback
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCommunityUpdates()
    return () => {
      cancelled = true
    }
  }, [])

  async function submitCommunityUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    const trimmedMessage = message.trim()
    const trimmedReporter = reporter.trim()
    if (!trimmedMessage || !trimmedReporter || !selectedTrailId) {
      setFormError('Trail, message, and reporter are required.')
      return
    }
    const headers = buildAuthHeaders(session)
    if (!headers.authorization) {
      setFormError('You must sign in with a token to submit community updates.')
      return
    }
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE}/community-updates`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify({
          trailId: selectedTrailId,
          category,
          severity,
          message: trimmedMessage,
          reporter: trimmedReporter,
        }),
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Request failed with ${response.status}`)
      }
      const created = (await response.json()) as CommunityTrailUpdate
      setUpdates((current) => [created, ...current])
      setMessage('')
      setReporter('')
    } catch (error) {
      setFormError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function moderateUpdate(id: string, action: 'approve' | 'reject') {
    if (!id || processingIds.includes(id)) return
    const headers = buildAuthHeaders(session)
    if (!headers.authorization) {
      setActionError('You must sign in with a token to moderate community updates.')
      return
    }
    setActionError('')
    setProcessingIds((current) => [...current, id])
    try {
      const response = await fetch(`${API_BASE}/community-updates/${id}/${action}`, {
        method: 'POST',
        headers: { ...headers },
      })
      if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Request failed with ${response.status}`)
      }
      const updated = (await response.json()) as CommunityTrailUpdate
      setUpdates((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (error) {
      setActionError((error as Error).message)
    } finally {
      setProcessingIds((current) => current.filter((itemId) => itemId !== id))
    }
  }

  const filtered =
    filterStatus === 'all' ? updates : updates.filter((entry) => entry.status === filterStatus)

  return (
    <section id="community" className="scroll-mt-20 border-t border-white/5 bg-forest-900/30 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              Community trail updates
            </h2>
            <p className="mt-2 text-mist-dim">
              {loading ? 'Loading updates from API…' : `Showing ${filtered.length} latest updates from the trail community.`}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Submit form */}
          <div className="glass h-fit rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-mist">
              <Send className="h-4 w-4 text-mint-400" />
              Report a condition
            </h3>
            <form onSubmit={submitCommunityUpdate} className="mt-4 space-y-3">
              <Field label="Trail">
                <select
                  value={selectedTrailId}
                  onChange={(e) => setSelectedTrailId(e.target.value)}
                  className="form-input"
                >
                  {trails.map((trail) => (
                    <option key={trail.id} value={trail.id}>
                      {trail.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommunityTrailUpdate['category'])}
                    className="form-input"
                  >
                    <option value="condition">condition</option>
                    <option value="water">water</option>
                    <option value="closure">closure</option>
                    <option value="leech">leech</option>
                    <option value="mud">mud</option>
                    <option value="other">other</option>
                  </select>
                </Field>
                <Field label="Severity">
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as CommunityTrailUpdate['severity'])}
                    className="form-input"
                  >
                    <option value="info">info</option>
                    <option value="warning">warning</option>
                    <option value="danger">danger</option>
                  </select>
                </Field>
              </div>

              <Field label="Reporter">
                <input
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="Your name"
                  className="form-input"
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what you observed on the trail"
                  rows={3}
                  className="form-input resize-none"
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-mint-400 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit update
                  </>
                )}
              </button>

              {formError && (
                <p className="text-sm text-coral-400">{formError}</p>
              )}
              {actionError && (
                <p className="text-sm text-coral-400">{actionError}</p>
              )}
              {session.status !== 'signed-in' && (
                <p className="text-xs text-mist-dim">
                  Sign in via the session chip in the navbar to submit and moderate updates.
                </p>
              )}
            </form>
          </div>

          {/* Updates feed */}
          <div>
            {/* Status filter chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all',
                    filterStatus === s
                      ? 'border-mint-400/50 bg-mint-400/15 text-mint-300'
                      : 'border-white/10 bg-white/5 text-mist-dim hover:text-mist',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((entry) => {
                  const trail = trails.find((t) => t.id === entry.trailId)
                  return (
                    <motion.article
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      className="glass rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={cn('grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5', severityColor[entry.severity])}>
                            {categoryIcon[entry.category] ?? categoryIcon.other}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-mist">
                              {trail?.name ?? entry.trailId}
                            </p>
                            <p className="text-xs text-mist-dim">
                              {entry.severity} · {entry.category} · {timeAgo(entry.reportedAt)}
                            </p>
                          </div>
                        </div>
                        <span className={cn('rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase', statusColor[entry.status])}>
                          {entry.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-mist-dim">{entry.message}</p>
                      <p className="mt-2 text-xs text-mist-dim/70">Reported by {entry.reporter}</p>

                      {entry.status === 'pending' && session.status === 'signed-in' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            disabled={processingIds.includes(entry.id) || isModerating}
                            onClick={() => moderateUpdate(entry.id, 'approve')}
                            className="flex items-center gap-1 rounded-lg border border-mint-400/30 bg-mint-400/10 px-3 py-1.5 text-xs font-medium text-mint-300 transition-colors hover:bg-mint-400/20 disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={processingIds.includes(entry.id) || isModerating}
                            onClick={() => moderateUpdate(entry.id, 'reject')}
                            className="flex items-center gap-1 rounded-lg border border-coral-500/30 bg-coral-500/10 px-3 py-1.5 text-xs font-medium text-coral-400 transition-colors hover:bg-coral-500/20 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </motion.article>
                  )
                })}
              </AnimatePresence>

              {filtered.length === 0 && !loading && (
                <div className="glass rounded-2xl p-8 text-center text-mist-dim">
                  No updates match this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-mist-dim">{label}</span>
      {children}
    </label>
  )
}
