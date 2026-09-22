// Shot 5, "curate": the order service as a raw first scan, then the agent's curated architecture.
//
// The work folder starts with a fresh scan of the demo's final code: components named after files, one
// container, no people, no external systems, no groups. Then the curated Markdown from the demo history
// replaces it in one batch (Groma's watcher settles 150 ms, so it reloads once) and the map morphs into it.
// Film set only: the scanners are off, so Groma shows exactly the two stored states.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { startGroma, openStage, encode } from './rig.mjs'

const SCRATCH = process.env.SCRATCH, OUT = process.env.OUT
const RAW = `${SCRATCH}/orders-raw`, CURATED = `${SCRATCH}/orders-history/groma`, WORK = `${SCRATCH}/orders-curate-work`
const RAW_FRAMES = Number(process.env.RAW_FRAMES ?? 100)
const MORPH_FRAMES = Number(process.env.MORPH_FRAMES ?? 150)
const HOLD_FRAMES = Number(process.env.HOLD_FRAMES ?? 40)
const SPEED = Number(process.env.SPEED ?? 0.3)

rmSync(WORK, { recursive: true, force: true })
mkdirSync(WORK, { recursive: true })
for (const entry of ['src', 'package.json', 'tsconfig.json', 'groma']) cpSync(`${RAW}/${entry}`, `${WORK}/${entry}`, { recursive: true })
writeFileSync(`${WORK}/groma/scanners.json`, '{ "scanners": [] }\n')

const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: WORK, port: 4820 })
const stage = await openStage({
  scale: 2,
  css: '#scanner-warning { display: none !important; }',
  // Counts what arrives from the server, so the rig knows when the new architecture has reached the page.
  init: () => {
    window.__net = { events: 0 }
    const Native = window.EventSource
    window.EventSource = class extends Native {
      addEventListener(type, listener, options) { return super.addEventListener(type, event => { window.__net.events++; return listener.call(this, event) }, options) }
      set onmessage(listener) { super.addEventListener('message', event => { window.__net.events++; listener.call(this, event) }) }
    }
  },
})
const page = stage.page
await stage.goto(`${groma.origin}/?theme=light&hud=off`)

stage.roll(`${SCRATCH}/frames/curate`)
await stage.film(RAW_FRAMES)

// The agent's work lands: curated Markdown replaces the raw scan in one quick batch.
const before = await page.evaluate(() => window.__net.events)
rmSync(`${WORK}/groma/systems`, { recursive: true, force: true })
for (const entry of ['actors', 'externals', 'systems', 'index.md', 'project.md', 'relationships.md']) {
  cpSync(`${CURATED}/${entry}`, `${WORK}/groma/${entry}`, { recursive: true })
}
const started = Date.now()
let quietSince = Date.now(), last = before
while (Date.now() - started < 8000) {
  await new Promise(resolve => setTimeout(resolve, 60))
  const events = await page.evaluate(() => window.__net.events)
  if (events !== last) { last = events; quietSince = Date.now() }
  if (events > before && Date.now() - quietSince > 400) break
}
console.log('update events:', last - before, 'after', Date.now() - started, 'ms')

await stage.film(MORPH_FRAMES, { speed: SPEED })
await stage.film(HOLD_FRAMES)
await encode(`${SCRATCH}/frames/curate`, `${OUT}/curate.mp4`)
console.log('frames:', stage.frame)
await stage.close(); groma.stop(); process.exit(0)
