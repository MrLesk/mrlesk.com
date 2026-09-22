// Records the flash deck's timelapse Groma (port 4804) while the addon replays the history, real time.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire('/Users/alex/projects/mrlesk.com/talks/groma/flash/package.json')
const { chromium } = require('playwright-chromium')
const OUT = process.env.OUT, DECK = process.env.DECK ?? 'http://localhost:3942', ORIGIN = process.env.ORIGIN ?? 'http://localhost:4804', NAME = process.env.NAME ?? 'orders'
mkdirSync(OUT, { recursive: true })
const post = query => fetch(`${DECK}/__groma-live/${NAME}${query}`, { method: 'POST' }).then(r => r.json())
console.log('rewind', JSON.stringify(await post('?rewind')))
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } }, colorScheme: 'light' })
const page = await context.newPage()
page.on('pageerror', error => console.error('page error:', error.message))
page.on('console', message => { if (message.type() === 'error') console.error('console error:', message.text()) })
await page.goto(`${ORIGIN}/?theme=light`, { waitUntil: 'load' })
await page.waitForTimeout(1500)
console.log('play', JSON.stringify(await post('?play')))
const seconds = Number(process.env.SECONDS ?? 18)
await page.waitForTimeout(seconds * 1000)
const state = await fetch(`${DECK}/__groma-live/${NAME}`).then(r => r.json())
console.log('state', JSON.stringify(state))
await context.close(); await browser.close()
