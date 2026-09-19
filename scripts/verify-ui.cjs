/* Visual verification: desktop + mobile render, interactions, layout checks. */
const { chromium } = require('playwright')
const fs = require('fs')

const BASE = process.env.GHT_BASE ?? 'http://localhost:3100'
const OUT = '/tmp/ght-shots'
fs.mkdirSync(OUT, { recursive: true })

const findings = []

function report(ok, label, detail = '') {
  findings.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
}

;(async () => {
  const browser = await chromium.launch()

  /* ---------------- Desktop 1440x900 ---------------- */
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const consoleErrors = []
  desktop.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
  desktop.on('pageerror', (e) => consoleErrors.push(String(e)))
  // Skip the optional live-API probe (backend intentionally not running in verification)
  await desktop.addInitScript(() => {
    window.__GHT_SKIP_API__ = true
  })

  await desktop.goto(BASE, { waitUntil: 'networkidle' })
  await desktop.waitForTimeout(2500) // let framer animations settle

  // Hero
  const h1 = await desktop.locator('h1').first().innerText()
  report(h1.includes('Wild Side'), 'desktop: hero headline renders', JSON.stringify(h1))

  // Horizontal overflow check (layout bug classic)
  const overflowX = await desktop.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  report(overflowX <= 0, 'desktop: no horizontal overflow', `overflow=${overflowX}px`)

  // Navbar
  const navLinks = await desktop.locator('header nav a').allInnerTexts()
  report(navLinks.some((t) => /trails/i.test(t)), 'desktop: navbar links render', navLinks.join('|'))

  await desktop.screenshot({ path: `${OUT}/desktop-hero.png` })

  // Trail explorer
  await desktop.locator('#trails').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(1200)
  const cards = await desktop.locator('#trails article, #trails [class*="card"], #trails button').count()
  const trailNames = await desktop.locator('#trails h3').allInnerTexts()
  report(trailNames.length >= 3, 'desktop: trail cards render', `${trailNames.length} cards: ${trailNames.slice(0, 3).join(' | ')}`)
  await desktop.screenshot({ path: `${OUT}/desktop-trails.png` })

  // Card titles live inside <button> cards; the detail panel h3 does not.
  const cardTitles = '#trails button h3'
  const search = desktop.locator('#trails input[placeholder*="Search" i]').first()
  if (await search.count()) {
    await search.fill('nuang')
    await desktop.waitForTimeout(600)
    const filtered = await desktop.locator(cardTitles).allInnerTexts()
    report(filtered.length === 1 && /nuang/i.test(filtered[0] ?? ''), 'desktop: search filters trails', JSON.stringify(filtered))
    await search.fill('')
    await desktop.waitForTimeout(600)
  } else {
    report(false, 'desktop: search input exists')
  }

  // Select a trail -> detail panel
  const firstCard = desktop.locator('#trails h3').first()
  await firstCard.click()
  await desktop.waitForTimeout(800)
  const svgChart = await desktop.locator('#trails svg').count()
  report(svgChart > 0, 'desktop: elevation SVG chart renders', `${svgChart} svg(s)`)

  // Elevation hover scrub
  const chart = desktop.locator('#trails svg').first()
  if (await chart.count()) {
    const box = await chart.boundingBox()
    if (box) {
      await desktop.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5)
      await desktop.waitForTimeout(400)
      await desktop.screenshot({ path: `${OUT}/desktop-elevation-hover.png` })
    }
  }

  // Planner section — checklist items are plain toggle buttons labelled with item text
  await desktop.locator('#planner').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(1000)
  const checklistBtn = desktop.locator('#planner button:has-text("Water (2L min)")').first()
  const checklistCount = await desktop.locator('#planner button').count()
  report(await checklistBtn.count() > 0 && checklistCount >= 8, 'desktop: checklist items render', `${checklistCount} buttons in planner`)
  await desktop.screenshot({ path: `${OUT}/desktop-planner.png` })

  // Toggle a checklist item and confirm visual state flips
  if (await checklistBtn.count()) {
    const clsBefore = await checklistBtn.getAttribute('class') ?? ''
    await checklistBtn.click()
    await desktop.waitForTimeout(500)
    const clsAfter = await checklistBtn.getAttribute('class') ?? ''
    report(clsBefore !== clsAfter, 'desktop: checklist toggles visual state')
  }

  // Offline package download smoke test
  const dlBtn = desktop.locator('#planner button:has-text("Download offline")').first()
  if (await dlBtn.count()) {
    const [download] = await Promise.all([
      desktop.waitForEvent('download', { timeout: 8000 }),
      dlBtn.click(),
    ])
    const fname = download.suggestedFilename()
    report(/gohealttrail.*\.json/i.test(fname), 'desktop: offline package downloads JSON', fname)
  } else {
    report(false, 'desktop: download offline package button exists')
  }

  // Community
  await desktop.locator('#community').scrollIntoViewIfNeeded()
  await desktop.waitForTimeout(1000)
  const updates = await desktop.locator('#community article').count()
  report(updates >= 3, 'desktop: community updates render', `${updates} updates`)
  await desktop.screenshot({ path: `${OUT}/desktop-community.png` })

  // Safety + SOS modal — trigger is the big round siren button beside the "Emergency SOS" heading
  const sosHeading = desktop.locator('#safety h3:has-text("Emergency SOS")')
  report(await sosHeading.count() > 0, 'desktop: Emergency SOS section renders')
  const sosBtn = desktop.locator('#safety button:has(svg)').last()
  // force: the SOS button has an infinite pulse animation, so it never reaches
  // Playwright's "stable" state — a real user can click it fine.
  await sosBtn.click({ force: true })
  await desktop.waitForTimeout(700)
  const modalText = await desktop.locator('text=SOS request recorded').count()
  report(modalText > 0, 'desktop: SOS opens confirmation modal (no alert())')
  await desktop.screenshot({ path: `${OUT}/desktop-sos-modal.png` })
  await desktop.keyboard.press('Escape')
  await desktop.locator('button:has-text("Dismiss")').click().catch(() => {})

  // Full page
  await desktop.locator('body').evaluate(() => window.scrollTo(0, 0))
  await desktop.waitForTimeout(500)
  await desktop.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true })

  report(consoleErrors.length === 0, 'desktop: no console/page errors', consoleErrors.slice(0, 3).join(' ;; '))

  /* ---------------- Mobile 390x844 (iPhone 14) ---------------- */
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mErrors = []
  mobile.on('console', (m) => m.type() === 'error' && mErrors.push(m.text()))
  mobile.on('pageerror', (e) => mErrors.push(String(e)))
  await mobile.addInitScript(() => {
    window.__GHT_SKIP_API__ = true
  })

  await mobile.goto(BASE, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(2500)

  const mOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  report(mOverflow <= 0, 'mobile: no horizontal overflow', `overflow=${mOverflow}px`)

  await mobile.screenshot({ path: `${OUT}/mobile-hero.png` })

  // Hamburger menu — the mobile-only toggle (desktop session chip also carries aria-expanded)
  const burger = mobile.locator('header button[class*="md:hidden"]').first()
  if (await burger.count()) {
    await burger.click()
    await mobile.waitForTimeout(500)
    const menuLinks = await mobile.locator('header a').allInnerTexts()
    report(menuLinks.some((t) => /trails/i.test(t)), 'mobile: hamburger menu opens with links', menuLinks.join('|'))
    await mobile.screenshot({ path: `${OUT}/mobile-menu.png` })
    await burger.click()
  } else {
    report(false, 'mobile: hamburger button exists')
  }

  await mobile.locator('#trails').scrollIntoViewIfNeeded()
  await mobile.waitForTimeout(1000)
  await mobile.screenshot({ path: `${OUT}/mobile-trails.png` })

  await mobile.locator('#planner').scrollIntoViewIfNeeded()
  await mobile.waitForTimeout(800)
  await mobile.screenshot({ path: `${OUT}/mobile-planner.png` })

  await mobile.locator('#safety').scrollIntoViewIfNeeded()
  await mobile.waitForTimeout(800)
  await mobile.screenshot({ path: `${OUT}/mobile-safety.png` })

  await mobile.locator('body').evaluate(() => window.scrollTo(0, 0))
  await mobile.waitForTimeout(400)
  await mobile.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true })

  report(mErrors.length === 0, 'mobile: no console/page errors', mErrors.slice(0, 3).join(' ;; '))

  await browser.close()

  console.log('\n===== VISUAL VERIFICATION REPORT =====')
  findings.forEach((f) => console.log(f))
  const fails = findings.filter((f) => f.startsWith('FAIL')).length
  console.log(`\n${findings.length - fails}/${findings.length} checks passed`)
  process.exit(fails ? 1 : 0)
})().catch((e) => {
  console.error('VERIFY SCRIPT CRASHED:', e)
  findings.forEach((f) => console.log(f))
  process.exit(2)
})
