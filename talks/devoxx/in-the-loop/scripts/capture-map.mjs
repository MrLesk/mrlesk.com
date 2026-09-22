// Re-captures the two Groma map backgrounds used by the surveyor slide (pages/18-surveyor.md).
//
//   1. bun run dev                    (starts Groma on port 4801 through the groma-live addon)
//   2. bun scripts/capture-map.mjs
//
// The viewport is exactly the slide size (980x552), so slide pixels equal capture pixels.
// SurveyorScene.vue aims its sight line at the front corner of "Web host" (585, 268).
// If Groma's layout changes, adjust ZOOM_OUT / PAN below until that corner lands there again,
// or update the coordinates in components/SurveyorScene.vue.
// Needs `cwebp` on the PATH (brew install webp).
import { chromium } from 'playwright-chromium'
import { $ } from 'bun'

const MAP_URL = 'http://localhost:4801/?theme=light&hud=off&component=web-server'
const ZOOM_OUT = 3
const PAN = { x: -300, y: 192 }
const publicDir = new URL('../public/', import.meta.url).pathname

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 980, height: 552 },
  deviceScaleFactor: 3,
  colorScheme: 'light',
})
const page = await context.newPage()

// Groma keeps a live channel open, so "networkidle" never fires.
await page.goto(MAP_URL, { waitUntil: 'load' })
await page.waitForTimeout(3000)
await page.mouse.move(490, 276)
for (let i = 0; i < ZOOM_OUT; i++) {
  await page.keyboard.press('-')
  await page.waitForTimeout(260)
}
await page.mouse.wheel(PAN.x, PAN.y)
await page.waitForTimeout(1000)

await page.screenshot({ path: `${publicDir}map-selected.png` })
// Escape clears the selection but keeps the camera, so both shots line up.
await page.keyboard.press('Escape')
await page.waitForTimeout(900)
await page.screenshot({ path: `${publicDir}map-plain.png` })
await browser.close()

for (const name of ['map-selected', 'map-plain']) {
  await $`cwebp -quiet -q 88 -resize 2400 0 ${publicDir}${name}.png -o ${publicDir}${name}.webp`
  await $`rm ${publicDir}${name}.png`
}
console.log('Updated public/map-selected.webp and public/map-plain.webp')
