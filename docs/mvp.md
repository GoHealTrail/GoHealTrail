# GoHealTrail MVP Tracker

**Single-page tracker for planning and execution** (priorities: **P0 / P1 / P2**, statuses: **Done / In Progress / Blocker**).

## Scope and current state
The MVP implementation is in seed form with key flows wired in web + API + mobile parity scaffolding.

## MVP feature tracker

| ID | Feature | Priority | Owner | Status | Notes |
|---|---|---:|---|---|---|
| MVP-01 | Trail discovery + filters | P0 | Web, API | Done | API list + detail endpoints exist; web page supports state/difficulty filtering over seeded trails. |
| MVP-02 | Trail detail + condition feed | P0 | Web, Mobile | Done | Condition feed exists in seeded trail/alert data and rule-based safety reminders. |
| MVP-03 | Trip planner with checklist | P0 | Web, Mobile | Done | 1-day plan creation works; checklist includes baseline safety items. |
| MVP-04 | Offline trail package / manifest | P0 | API, Web, Mobile | Done | `/offline-manifest` endpoint added; offline-oriented export data exists in UI seed flow. |
| MVP-05 | Weather and safety alerts | P0 | Web, Mobile, API | Done | Seeded alerts with severity + safety banner/rules are visible in app data model. |
| MVP-06 | SOS emergency flow | P1 | Mobile, API | Done | `/sos` endpoint returns tracked event object; UI includes emergency trigger flow. |
| MVP-07 | Community trail updates | P1 | Web, API | In Progress | Added API + DB schema + seed + web reads from `/community-updates`; next: form submit + moderation + mobile parity. |

## Acceptance criteria status

| Criterion | Status | Owner | Proof |
|---|---|---|---|
| Open app and view 5+ sample trails | Done | Web | Static seeded trail dataset (5+ items currently defined). |
| Create a 1-day trip plan with checklist (3+ items) | Done | Web | Plan builder and mobile `buildPlan()` helper. |
| Offline manifest download / cached plan details | Done | API | `/offline-manifest` endpoint + seed offline payload in web flow. |
| SOS trigger produces tracked event | Done | API | `POST /sos` returns event payload for tracking assertions. |
| Safety banner appears for high-risk trail | Done | Web, Mobile | Safety banner/rules + alert severity values in seeded data. |

## Roadmap (out of MVP scope for now)

| ID | Feature | Priority | Owner | Status |
|---|---|---:|---|---|
| MVP-N1 | Booking payments | P2 | Product | Blocker |
| MVP-N2 | Internal e-commerce | P2 | Product | Blocker |
| MVP-N3 | Full analytics dashboard | P2 | Product | Blocker |
| MVP-N4 | Background sync conflict resolution | P2 | Platform | Blocker |

## Notes
- Current implementation is a functional MVP seed, not production-hardened.
- Next blockers to remove: persistence/auth, real weather/map integrations, push notifications, and mobile parity hardening.
