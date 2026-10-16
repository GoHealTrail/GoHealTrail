# GoHealTrail — shared context for every agent

GoHealTrail: trail discovery for people who go outdoors to heal and reset, focused on
Peninsular Malaysia. This repo is the Next.js landing site (no database, no Supabase).

## Key files
- `lib/permits.ts` — 258 forest-reserve hiking locations with MGP-guide and permit rules,
  transcribed from an undated Jabatan Perhutanan Semenanjung Malaysia poster. **Safety data.**
- `lib/trails.ts` — AllTrails snapshot (stats + 7-day forecasts), `DATA_AS_OF`.
- `lib/site.ts` — offers and business config; prices are `null` until Fahru sets them.
- `app/api/lead/route.ts` — lead forms → `LEAD_WEBHOOK_URL` (no storage without it).
- `docs/decisions.md` — decision log. `docs/sprint-<n>.md` — the current task cards.

Revenue streams: MGP guide bookings, permit help (concierge), Trail Pro, Healing Retreats,
partner listings / sponsorship. Owner and sole approver: **Fahru**.

## Rules (all agents)
- Never invent facts, prices, stats, dates or sources. Missing → say "unknown" and ask.
- Permit and guide data is safety data. Only official sources count (forestry.gov.my,
  State Forestry Department pages/notices).
- GoHealTrail is independent. Never imply a link to any government agency.
- Never send, publish, deploy to production, spend money, or change secrets/accounts.
  Prepare it and ask Fahru.
- Work only from a task card in `docs/sprint-<n>.md`. Out of scope → set the card's status
  to `blocked` with one question.
- Label claims: Observed / Confirmed (with source) / Assumption.
- Never claim a command, build or test ran unless it did; paste the real output.

## Commands
```bash
npm install
npm run typecheck
npm run build
npm run dev   # http://localhost:3000
```

## Team (subagents in `.claude/agents/`)
| Agent | Owns | Never touches |
|---|---|---|
| `ght-orchestrator` | sprint plan, task cards, `docs/decisions.md` | code, data, outreach |
| `ght-builder` | app/, components/, lib/site.ts, lib/trails.ts *code* | `lib/permits.ts` data |
| `ght-data-steward` | `lib/permits.ts`, `lib/trails.ts` data | UI code |
| `ght-growth` | `docs/growth/` drafts, lead triage | code, data, sending |
| `ght-qa` | verdicts in the card's Evidence | anything it reviews (read-only) |

Flow: Orchestrator writes card → owner does it and sets `in-review` → QA PASS/FAIL →
2 FAILs = escalate to Fahru → Fahru approves anything live, sent, priced or touching permits.
