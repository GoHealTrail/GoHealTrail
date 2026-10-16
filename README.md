# GoHealTrail — landing site

Standalone Next.js (App Router) site for GoHealTrail — trail discovery, permit & guide checker and monetisation for Peninsular Malaysia.

## Run it (Windows)

```powershell
git clone https://github.com/GoHealTrail/GoHealTrail.git
cd GoHealTrail
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the build
```

Requires Node.js 20.9+ (tested with Node 22).

> OneDrive tip: `node_modules` and `.next` are large and churn constantly. Consider pausing OneDrive sync or moving the project outside OneDrive while developing.

## What's on the page

| Section | Notes |
|---|---|
| Floating glass dock nav | Fixed at top |
| Hero | Drawn SVG sunrise ridge (swap for real photography), search → permit checker, trailhead forecast card |
| Trending Trails | Bento cards, difficulty filter, save toggle, weather + permit/MGP badges |
| Heat advisory | Computed from the trail forecast data |
| Permit & guide checker | All 258 locations from the Jabatan Perhutanan poster, search / state / requirement filters |
| Plans | Explorer (free), Trail Pro (waitlist), Healing Retreats |
| Partners | Guides, campsites/gear, sponsors |

## Data — keep it honest

- `lib/permits.ts` — transcribed from the Jabatan Perhutanan Semenanjung Malaysia poster *Lokasi Pendakian Dalam Hutan Simpanan Kekal Semenanjung Malaysia*. The poster is undated; re-check it against forestry.gov.my before launch and whenever a new version is published.
- `lib/trails.ts` — AllTrails stats and 7-day forecasts **captured 15 Oct 2026**. Forecasts go stale in days: replace with a live weather API before launch, or remove the forecast UI.
- Topo route drawings are illustrative, not GPS tracks.

## Monetisation built into the page

1. **MGP guide marketplace** — every guide-required location has *Find a guide*. Charge a booking fee/commission per trip; free guide profiles (supply side: *List as a guide*).
2. **Permit help (concierge)** — *Get permit help* on permit-required locations; a convenience fee for preparing the application + guide booking. Always state that permits are issued only by the State Forestry Department and that you're independent.
3. **Trail Pro subscription** — offline maps, heat/storm alerts, trip check-in / auto-SOS, checklists. Waitlist now to validate demand before building.
4. **Healing Retreats** — ticketed small-group weekends run with partner guides (fits the GoHealTrail "healing outdoors" positioning; highest margin per customer).
5. **Partner listings & sponsorship** — campsites, homestays, gear rental near trailheads; labelled sponsorship of alerts/state guides. Never mix paid placement into the safety/permit data.

Prices are left unset in `lib/site.ts` (`price: null` shows "Early access"). Set them when decided.

## Forms / leads

All forms POST to `app/api/lead/route.ts`. There is **no database**. Set an environment variable:

```
LEAD_WEBHOOK_URL=https://your-endpoint   # Google Apps Script → Sheet, Make, Zapier, Formspree, …
```

- Without it in **dev**: leads are logged to the terminal, not stored.
- Without it in **production**: forms return "Sign-ups open soon" (503) so no one is falsely told they're signed up.

Put it in `site/.env.local` locally, or in your host's environment settings.

## Before launch checklist

- [ ] Set `LEAD_WEBHOOK_URL`
- [ ] Set `SITE.contactEmail` and prices in `lib/site.ts`
- [ ] Replace hero SVG with licensed photography (optional)
- [ ] Replace static forecasts with a live source, or remove them
- [ ] Re-verify permit data with Jabatan Perhutanan
- [ ] Add privacy policy page (PDPA) since you collect emails
