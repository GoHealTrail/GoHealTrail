'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ShieldAlert,
  Siren,
  X,
  CheckCircle2,
  Ban,
  FileWarning,
  Flame,
  Leaf,
  Lock,
} from 'lucide-react'
import { safetyRules } from '../lib/data'
import { Reveal } from './Reveal'

const ruleIcons = [Ban, Leaf, Flame, Lock]

const permitNotice =
  'Permit requirements vary by forest reserve and activity. Check the latest district or forestry notice before departure. Climbing, fishing, camping, and chalet/cabin use typically requires prior permission.'

export function SafetySection() {
  const [sosOpen, setSosOpen] = useState(false)

  return (
    <section id="safety" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral-500/20 bg-coral-500/5 px-3 py-1 text-xs font-medium text-coral-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Safety first
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-mist sm:text-4xl">
              Safety &amp; permits
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-mist-dim">
              Know the rules, respect the forest, and always have an emergency plan.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Safety rules */}
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-mist">
              <ShieldAlert className="h-5 w-5 text-mint-400" />
              Forest rules
            </h3>
            <ul className="space-y-3">
              {safetyRules.map((rule, i) => {
                const Icon = ruleIcons[i % ruleIcons.length]
                return (
                  <li key={rule} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Icon className="h-3.5 w-3.5 text-mint-300" />
                    </span>
                    <span className="text-sm text-mist-dim">{rule}</span>
                  </li>
                )
              })}
            </ul>

            {/* Permit notice */}
            <div className="mt-5 rounded-xl border border-sunrise-400/20 bg-sunrise-400/5 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-sunrise-300">
                <FileWarning className="h-4 w-4" />
                Permit notice
              </p>
              <p className="mt-1.5 text-xs text-mist-dim">{permitNotice}</p>
            </div>
          </div>

          {/* SOS */}
          <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <span className="absolute inset-0 animate-pulse-soft rounded-full bg-coral-500/20 blur-xl" />
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                aria-label="Trigger emergency SOS"
                className="relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-coral-500 to-coral-400 text-forest-950 shadow-2xl shadow-coral-500/40 transition-transform hover:scale-105 active:scale-95"
              >
                <Siren className="h-10 w-10" strokeWidth={2.5} />
              </button>
            </motion.div>
            <h3 className="mt-6 text-xl font-bold text-mist">Emergency SOS</h3>
            <p className="mt-1 max-w-xs text-sm text-mist-dim">
              If conditions worsen, tap SOS to record an emergency event with your last known
              location and support contacts.
            </p>
          </div>
        </div>
      </div>

      {/* SOS modal */}
      <AnimatePresence>
        {sosOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-forest-950/80 p-5 backdrop-blur-sm"
            onClick={() => setSosOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="glass relative w-full max-w-md rounded-2xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-mist-dim hover:text-mist"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint-500/15"
              >
                <CheckCircle2 className="h-7 w-7 text-mint-400" />
              </motion.span>
              <h3 className="mt-4 text-xl font-bold text-mist">SOS request recorded</h3>
              <p className="mt-2 text-sm text-mist-dim">
                Your location and contacts will be shared with support contacts. Stay where you are
                if safe to do so — help is on the way.
              </p>
              <button
                type="button"
                onClick={() => setSosOpen(false)}
                className="mt-5 w-full rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-forest-950 transition-colors hover:bg-mint-400"
              >
                Dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
