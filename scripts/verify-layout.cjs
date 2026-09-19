/* Quantitative layout inspection: overflow, visibility, contrast-risk, ARIA. */
const { chromium } = require('playwright')

const findings = []
function report(ok, label, detail = '') {
  findings.push(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`)
}

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.addInitScript(() => { window.__GHT_SKIP_API__ = true })
  await page.goto('http://localhost:3100', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2200)

  // 1. Any element wider than its parent (text overflow / clipping risk)
  const overflowing = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX === 'visible') {
        const cls = (el.className?.toString() ?? '').slice(0, 60)
        out.push(`${el.tagName}.${cls} scrollW=${el.scrollWidth} clientW=${el.clientWidth} text="${el.textContent?.slice(0, 40)}"`)
      }
    })
    return out.slice(0, 8)
  })
  report(overflowing.length === 0, 'no unclipped text overflow', overflowing.join(' | ') || 'none')

  // 2. Interactive elements with zero accessible name
  const unnamed = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('button, a, input, select, textarea').forEach((el) => {
      const name = el.getAttribute('aria-label') || el.textContent?.trim() || el.getAttribute('placeholder') || el.getAttribute('value')
      if (!name) out.push(`${el.tagName}#${el.id} classes=${(el.className?.toString() ?? '').slice(0, 50)}`)
    })
    return out
  })
  report(unnamed.length <= 1, 'interactive elements have accessible names', `${unnamed.length} unnamed: ${unnamed.slice(0, 3).join(' | ')}`)

  // 3. Contrast-risk: elements whose text color is close to background (computed).
  // Skip gradient-clipped text (color:transparent + background-clip:text) — its
  // legibility comes from the gradient, measured separately below.
  const lowContrast = await page.evaluate(() => {
    function lum(rgb) {
      const [r, g, b] = rgb.match(/\d+/g).map(Number).slice(0, 3).map((v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const out = []
    const checked = new Set()
    document.querySelectorAll('p, h1, h2, h3, h4, span, a, button, li, label').forEach((el) => {
      if (!el.textContent?.trim() || el.children.length > 0) return
      const style = getComputedStyle(el)
      if (style.webkitBackgroundClip === 'text' || style.backgroundClip === 'text') return
      const fg = style.color
      // walk up for effective background
      let bg = 'rgb(4, 17, 12)'
      let node = el
      while (node) {
        const b = getComputedStyle(node).backgroundColor
        if (b && !b.includes('rgba(0, 0, 0, 0)') && b !== 'transparent') { bg = b; break }
        node = node.parentElement
      }
      const key = fg + '|' + bg
      if (checked.has(key)) return
      checked.add(key)
      const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05)
      if (ratio < 3 && el.getBoundingClientRect().width > 0) {
        out.push(`"${el.textContent.trim().slice(0, 30)}" ratio=${ratio.toFixed(2)} fg=${fg} bg=${bg}`)
      }
    })
    return out.slice(0, 8)
  })
  report(lowContrast.length === 0, 'no text below 3:1 contrast (large-text floor)', lowContrast.join(' | ') || 'none')

  // 3b. Gradient headline actually paints a bright gradient (not invisible)
  const gradientOk = await page.evaluate(() => {
    const el = document.querySelector('.text-gradient')
    if (!el) return { found: false }
    const s = getComputedStyle(el)
    return {
      found: true,
      clip: s.webkitBackgroundClip || s.backgroundClip,
      image: s.backgroundImage.slice(0, 60),
      color: s.color,
    }
  })
  report(
    gradientOk.found && gradientOk.clip === 'text' && gradientOk.image.includes('gradient'),
    'gradient headline: background-clip:text + gradient paint',
    JSON.stringify(gradientOk),
  )

  // 4. Images/SVGs have alt or aria-hidden
  const badImgs = await page.evaluate(() => {
    const out = []
    document.querySelectorAll('img').forEach((el) => {
      if (!el.alt && el.getAttribute('aria-hidden') !== 'true') out.push(el.src.slice(-40))
    })
    return out
  })
  report(badImgs.length === 0, 'all <img> have alt or aria-hidden', `${badImgs.length} violations`)

  // 5. Section landmark structure
  const sections = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]')).map((s) => s.id),
  )
  report(sections.length >= 5, 'semantic section landmarks', sections.join(', '))

  // 6. Headings hierarchy (no skipped levels)
  const headingLevels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((h) => +h.tagName[1]),
  )
  let skips = 0
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) skips++
  }
  report(skips === 0, 'no skipped heading levels', `h-count=${headingLevels.length}, skips=${skips}`)

  await browser.close()
  console.log('\n===== LAYOUT/A11Y QUANTITATIVE REPORT =====')
  findings.forEach((f) => console.log(f))
  const fails = findings.filter((f) => f.startsWith('FAIL')).length
  console.log(`\n${findings.length - fails}/${findings.length} checks passed`)
  process.exit(fails ? 1 : 0)
})().catch((e) => { console.error('CRASHED:', e); findings.forEach((f) => console.log(f)); process.exit(2) })
