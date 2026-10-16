# GoHealTrail — decision log

Only decisions Fahru stated or approved go in **Decided**. Everything else waits in **Proposed**.
Newest first.

## Decided

| Date | Decision | Why | Decided by |
|---|---|---|---|
| 2026-10-16 | Use the existing GitHub repo `GoHealTrail/GoHealTrail`. Fahru deleted and recreated the repo; the new site was pushed as a single fresh commit to `main`. Old history and branches are gone, no archive, no "v2" | Old content no longer applies | Fahru |
| 2026-10-16 | Adopt the 5-agent team (Orchestrator, Builder, Data Steward, Growth, QA) and run the 7-day plan | Execute launch without doing every step by hand | Fahru |
| 2026-10-15 | Build the site as a fresh, standalone Next.js app in `site/`, using the Jabatan Perhutanan poster data, with monetisation built in | Real code, not a mockup | Fahru |
| 2026-10-15 | Restart GoHealTrail as a dark "Dark Adventure" trail-discovery landing page; previous content and any Supabase setup no longer apply | New direction | Fahru |

## Proposed (awaiting Fahru)

| Proposed | Item | Recommendation | Owner |
|---|---|---|---|
| 2026-10-16 | Hosting | Vercel — native Next.js, per-PR previews, already connected | Builder |
| 2026-10-16 | Lead storage | Google Sheet + Apps Script web app as `LEAD_WEBHOOK_URL` (free; CRM later) | Builder |
| 2026-10-16 | Trail Pro & retreat prices | Keep "Early access" until there is waitlist demand, or set prices in `lib/site.ts` | Fahru |
| 2026-10-16 | Public contact email | Set `SITE.contactEmail` before launch | Fahru |
