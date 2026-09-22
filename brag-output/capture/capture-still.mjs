// Plays a deck's replay to its end and captures the fallback still the way check-views.mjs does (inset 37, 1633x920 at 1.5x).
import { createRequire } from 'node:module'
const require = createRequire('/Users/alex/projects/mrlesk.com/talks/groma/flash/package.json')
const { chromium } = require('playwright-chromium')
const DECK = process.env.DECK ?? 'http://localhost:3942', ORIGIN = process.env.ORIGIN ?? 'http://localhost:4804', NAME = 'orders', OUT = process.env.OUT
const post = query => fetch(`${DECK}/__groma-live/${NAME}${query}`, { method: 'POST' }).then(r => r.json())
await post('?rewind')
await post('?play')
for (let tries = 0; tries < 200; tries++) {
  const state = await fetch(`${DECK}/__groma-live/${NAME}`).then(r => r.json())
  if (!state.playing && state.frame === state.total - 1) break
  await new Promise(resolve => setTimeout(resolve, 250))
}
const browser = await chromium.launch()
const page = await (await browser.newContext({ viewport: { width: 1633, height: 920 }, deviceScaleFactor: 1.5, colorScheme: 'light' })).newPage()
await page.goto(`${ORIGIN}/?theme=light&inset=37`, { waitUntil: 'load' })
await page.waitForTimeout(2500)
await page.screenshot({ path: OUT })
console.log('container:', await page.evaluate(() => [...document.querySelectorAll('#map .slab text')].map(t => t.textContent).join(' | ').slice(0, 80)))
await browser.close()
