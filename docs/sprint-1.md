# Sprint 1 — 16 to 22 Oct 2026 (launch week)

Written by ght-orchestrator on 2026-10-16. Goal for the week: site live with working lead
capture, verified permit data and a first batch of guide outreach drafts.

## Plan

| Day | Date | Card | Owner | Needs Fahru |
|---|---|---|---|---|
| 1 | Fri 16 Oct | Setup: project docs, agents, git | — | Force-push to GoHealTrail/GoHealTrail `main` |
| 2 | Sat 17 Oct | GHT-001 Lead capture · GHT-002 Privacy page | ght-builder | Add `LEAD_WEBHOOK_URL`; review privacy text |
| 3 | Sun 18 Oct | GHT-003 Verify permits · GHT-004 Refresh trails | ght-data-steward | Approve each permit change |
| 4 | Mon 19 Oct | Decisions: prices, contact email, hosting | Fahru | Yes |
| 5 | Tue 20 Oct | GHT-005 Prospects + outreach + Selangor guide | ght-growth | Edit and send |
| 6 | Wed 21 Oct | Launch card (written after 001–004 pass QA) | ght-builder + ght-qa | Approve production |
| 7 | Thu 22 Oct | Review KPIs, plan Sprint 2 | ght-orchestrator | Pick top 3 |

---

### GHT-001 — Connect lead forms to a Google Sheet
- **Owner:** ght-builder
- **Goal:** Every form submission lands as a row in a Google Sheet.
- **Inputs:** `app/api/lead/route.ts`, `README.md` § Forms / leads, `components/LeadForm.tsx`
- **Acceptance criteria:**
  1. `docs/lead-webhook.md` gives step-by-step Apps Script setup (Sheet columns: receivedAt, type, email, name, trail, note) and a copy-paste `doPost` script.
  2. With `LEAD_WEBHOOK_URL` set locally, a test lead from the guide dialog appears as a sheet row.
  3. Without it, production still returns 503 (unchanged behaviour).
  4. `npm run typecheck` and `npm run build` pass; real output pasted below.
- **Out of scope:** any database or CRM; changing form fields.
- **Needs human approval:** yes — Fahru creates the Sheet/script under his Google account and adds the secret URL to the host.
- **Due:** 2026-10-17
- **Status:** todo
- **Evidence:**

### GHT-002 — Privacy page
- **Owner:** ght-builder
- **Goal:** A `/privacy` page that says what the forms collect, why, how long it is kept and how to ask for deletion; linked from the footer and every form.
- **Inputs:** `components/Chrome.tsx`, `components/LeadForm.tsx`, `lib/site.ts`
- **Acceptance criteria:**
  1. `/privacy` renders in the site's style at 1440px and 390px with no horizontal overflow.
  2. Text covers: data collected (email, name, note, trail), purpose, retention [Fahru to set], contact for deletion (`SITE.contactEmail`), no sale of data.
  3. Footer and the lead dialog link to it.
  4. Typecheck and build pass.
- **Out of scope:** cookie banner (no tracking cookies are used yet).
- **Needs human approval:** yes — Fahru reviews the wording. This is a plain-language template, not legal advice; a PDPA review by a qualified person is recommended before scaling.
- **Due:** 2026-10-17
- **Status:** todo
- **Evidence:**

### GHT-003 — Verify all 258 permit rows
- **Owner:** ght-data-steward
- **Goal:** Every row in `lib/permits.ts` is checked against an official source, or flagged.
- **Inputs:** `lib/permits.ts`, the original poster image, forestry.gov.my and State Forestry Department pages
- **Acceptance criteria:**
  1. "Rows checked: N of 258" reported, per state.
  2. Diff table for every proposed change, each with a source URL and source date.
  3. Conflicts listed separately, not resolved by the agent.
  4. Re-check of the poster for Negeri Sembilan (ticket rows) and Selangor (rows 1–36 vs 37–53 MGP split).
- **Out of scope:** Sabah/Sarawak; UI changes.
- **Needs human approval:** yes — every change to `lib/permits.ts`.
- **Due:** 2026-10-18
- **Status:** todo
- **Evidence:**

### GHT-004 — Refresh trail data and stop stale forecasts
- **Owner:** ght-data-steward (data) → ght-builder (code, if needed)
- **Goal:** Trending-trail stats and forecasts are current, and the page never shows a forecast older than 3 days as current.
- **Inputs:** `lib/trails.ts`, AllTrails connector
- **Acceptance criteria:**
  1. All 5 trails refreshed; `DATA_AS_OF` updated to the refresh date.
  2. Proposal (for ght-builder) to hide or label the forecast UI when `DATA_AS_OF` is more than 3 days old.
  3. Diff table of changed values.
- **Out of scope:** adding new trails.
- **Needs human approval:** no for trail stats; yes before the forecast UI behaviour changes.
- **Due:** 2026-10-18
- **Status:** todo
- **Evidence:**

### GHT-005 — Supply-side outreach drafts
- **Owner:** ght-growth
- **Goal:** A first list of MGP guides/agencies and trailhead businesses to approach, with drafts ready to send.
- **Inputs:** `lib/permits.ts` (guide-required locations), `lib/site.ts` (offers), public business listings
- **Acceptance criteria:**
  1. `docs/growth/prospects.md`: businesses only, each with a public source URL; no private personal data.
  2. `docs/growth/outreach.md`: one guide-recruitment and one partner message (English + Malay), no prices beyond `lib/site.ts`.
  3. `docs/growth/selangor-guide.md`: a draft Selangor trail guide using only `lib/permits.ts` facts, linking to the permit checker.
- **Out of scope:** sending anything; paid ads.
- **Needs human approval:** yes — Fahru edits and sends.
- **Due:** 2026-10-20
- **Status:** todo
- **Evidence:**

---

## Decisions needed from Fahru
- Force-push this repo to `GoHealTrail/GoHealTrail` `main` and delete the old branches (Claude has no push access to the repo).
- Confirm hosting (Vercel proposed) and lead storage (Google Sheet proposed).
- Retention period for lead data (for GHT-002).
- Prices or "early access", and the public contact email (Day 4).
