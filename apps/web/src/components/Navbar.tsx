'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { KeyRound, Menu, Mountain, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export type SessionState = {
  token: string
  status: 'anonymous' | 'signed-in'
}

const navLinks = [
  { href: '#trails', label: 'Trails' },
  { href: '#planner', label: 'Planner' },
  { href: '#community', label: 'Community' },
  { href: '#safety', label: 'Safety' },
]

export function Navbar({
  session,
  onSessionChange,
}: {
  session: SessionState
  onSessionChange: (next: SessionState) => void
}) {
  const [open, setOpen] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [tokenInput, setTokenInput] = useState(session.token)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setTokenInput(session.token)
  }, [session.token])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function saveToken() {
    const token = tokenInput.trim()
    onSessionChange(token ? { token, status: 'signed-in' } : { token: '', status: 'anonymous' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-mint-400 to-forest-600 text-forest-950 shadow-md shadow-mint-500/30 transition-transform group-hover:scale-105">
            <Mountain className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-mist">
            Go<span className="text-mint-300">Heal</span>Trail
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
            >
              {link.label}
            </a>
          ))}

          <div className="relative ml-2">
            <button
              type="button"
              onClick={() => setSessionOpen((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                session.status === 'signed-in'
                  ? 'border-mint-400/40 bg-mint-400/10 text-mint-300'
                  : 'border-white/15 bg-white/5 text-mist-dim hover:border-mint-400/30 hover:text-mist'
              }`}
              aria-expanded={sessionOpen}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  session.status === 'signed-in' ? 'bg-mint-400 animate-pulse-soft' : 'bg-mist-dim'
                }`}
              />
              {session.status === 'signed-in' ? 'Signed in' : 'Sign in'}
            </button>

            <AnimatePresence>
              {sessionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass absolute right-0 top-12 w-80 rounded-2xl p-4 shadow-xl shadow-black/40"
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-mist">
                    <KeyRound className="h-4 w-4 text-mint-300" />
                    API session token
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-mist-dim">
                    Paste a bearer token to submit and moderate community updates.
                  </p>
                  <input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste bearer access token"
                    className="mt-3 w-full rounded-lg border border-white/10 bg-forest-950/60 px-3 py-2 text-sm text-mist placeholder:text-mist-dim/50 focus:border-mint-400/50 focus:outline-none"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={saveToken}
                      className="flex-1 rounded-lg bg-mint-500 px-3 py-2 text-xs font-bold text-forest-950 transition-colors hover:bg-mint-400"
                    >
                      Save token
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTokenInput('')
                        onSessionChange({ token: '', status: 'anonymous' })
                      }}
                      className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="glass overflow-hidden border-t border-white/5 md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-mist-dim transition-colors hover:bg-white/5 hover:text-mist"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setSessionOpen(true)
                }}
                className="mt-1 w-full rounded-lg border border-mint-400/30 bg-mint-400/10 px-3 py-2.5 text-sm font-semibold text-mint-300"
              >
                {session.status === 'signed-in' ? 'Signed in ✓' : 'Sign in with token'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
