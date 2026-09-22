// Shot 2, "walk": search for a component, fly to it, read how it is built, open its source.
import { startGroma, openStage, runShot, encode } from './rig.mjs'
const SCRATCH = process.env.SCRATCH, OUT = process.env.OUT
const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: `${SCRATCH}/groma-clean`, port: 4815 })
const stage = await openStage({ scale: 2, css: '#scanner-warning { display: none !important; }' })
const page = stage.page
await stage.goto(`${groma.origin}/?theme=light`)

const center = async (find, arg) => page.evaluate(({ find, arg }) => {
  const el = new Function('arg', `return (${find})(arg)`)(arg)
  if (!el) return null
  const box = el.getBoundingClientRect()
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}, { find, arg })

const search = await center(`() => document.querySelector('#web-search')`)
const PRE = 18                     // frames before the first beat
const B = beat => PRE + beat * 60  // one beat is one second at 120 BPM
const type = (text, from, every) => Object.fromEntries([...text].map((char, index) => [from + index * every, p => p.keyboard.type(char)]))
let howTab, sourceFile
stage.roll(`${SCRATCH}/frames/walk`)
await runShot(stage, {
  frames: PRE + 252,
  start: { x: 760, y: 420 },
  moves: [
    { from: 0, to: PRE - 2, x: search.x - 30, y: search.y + 2 },
    { from: B(1) + 50, to: B(2) - 6, get x() { return howTab.x }, get y() { return howTab.y } },
    { from: B(2) + 22, to: B(3) - 6, get x() { return sourceFile.x }, get y() { return sourceFile.y } },
  ],
  clicks: [PRE, B(2), B(3)],
  hooks: {
    ...type('web h', PRE + 6, 7),
    [B(1)]: p => p.keyboard.press('Enter'),
    // The panel is laid out once the component is selected; look the targets up just before the cursor leaves.
    [B(1) + 48]: async () => { howTab = await center(`() => [...document.querySelectorAll('#details [role=tab]')].find(tab => tab.textContent.includes('How'))`) },
    [B(2) + 20]: async () => { sourceFile = await center(`() => [...document.querySelectorAll('#details .source-file')].find(el => el.textContent.includes('src/viewers/web/server.ts'))`) },
  },
  // Groma's camera flight takes 220 ms; in slow motion the dive lasts most of a beat.
  speed: frame => frame >= B(1) && frame < B(1) + 44 ? 0.3 : 1,
})
await encode(`${SCRATCH}/frames/walk`, `${OUT}/walk.mp4`)
await stage.close(); groma.stop(); process.exit(0)
