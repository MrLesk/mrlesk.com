// Shot 3, "flow": step through the "Scan project source" flow with the Next button, one step per beat.
import { startGroma, openStage, runShot, encode } from './rig.mjs'
const SCRATCH = process.env.SCRATCH, OUT = process.env.OUT
const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: `${SCRATCH}/groma-clean`, port: 4816 })
const stage = await openStage({ scale: 2, css: '#scanner-warning { display: none !important; }' })
const page = stage.page
await stage.goto(`${groma.origin}/?theme=light&flow=scan-project-source&step=1`)
// More room for the map: fold the hierarchy away, as a reader following a flow would.
await page.click('#hierarchy-toggle')
await stage.settle(1200)
const next = await page.evaluate(() => { const b = [...document.querySelectorAll('#details button')].find(el => el.textContent.trim() === 'Next').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } })
const PRE = 18, B = beat => PRE + beat * 60
stage.roll(`${SCRATCH}/frames/flow`)
await runShot(stage, {
  frames: PRE + 252,
  start: { x: next.x - 170, y: next.y + 120 },
  moves: [{ from: 6, to: B(1) - 8, x: next.x + 4, y: next.y + 3 }],
  clicks: [B(1), B(2), B(3)],
  speed: frame => [1, 2, 3].some(beat => frame >= B(beat) && frame < B(beat) + 40) ? 0.32 : 1,
})
await encode(`${SCRATCH}/frames/flow`, `${OUT}/flow.mp4`)
await stage.close(); groma.stop(); process.exit(0)
