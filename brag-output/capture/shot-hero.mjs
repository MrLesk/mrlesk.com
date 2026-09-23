// Shot 1, "hero": map only, in the 2D view. The camera glides over the flat plan and pulls back to the whole
// system. After lights on, the view switch appears, the cursor clicks Iso on a bar line, and the map rises out of
// 2D into the isometric view, in slow motion. Then the camera pushes in on the components, so the view reads as iso.
// Filmed twice with the same camera path: blueprint (the dark act) and light (after lights on).
import { startGroma, openStage, runShot, encode } from './rig.mjs'

const SCRATCH = process.env.SCRATCH
const OUT = process.env.OUT
const THEME = process.env.THEME              // blueprint | light
const FROM = Number(process.env.FROM ?? 0)   // first filmed frame
const TO = Number(process.env.TO ?? 600)     // one past the last filmed frame
const SCALE = Number(process.env.SCALE ?? 2) // 1 for a quick preview
const W = 1280, H = 720, C = { x: W / 2, y: H / 2 }

// Map-only mode hides the view switch; bring back just that bar, centred at the top and large enough to read
// in a phone-sized video. It stays invisible until lights on (the --film-bar hook below).
const BAR = 'body.hud-hidden #map-view { display: flex !important; left: 0 !important; right: 0 !important; max-width: none !important;'
  + ' top: 22px !important; zoom: 2; opacity: var(--film-bar, 0); }'

const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: `${SCRATCH}/groma-clean`, port: Number(process.env.PORT ?? 4811) })
const stage = await openStage({ width: W, height: H, scale: SCALE, css: BAR })
await stage.goto(`${groma.origin}/?theme=${THEME}&hud=off`)
await stage.page.click('#map-view [data-view="2d"]')
await stage.settle(2500)
const pinch = 0.01 // PINCH_RATE in camera.ts
const iso = await stage.page.evaluate(() => {
  const box = document.querySelector('#map-view [data-view="iso"]').getBoundingClientRect()
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
})

// The camera relative to the fitted view: screen = R * fitScreen + t.
let R = 1, t = { x: 0, y: 0 }
async function wheel(init) {
  await stage.page.evaluate(event => document.getElementById('map').dispatchEvent(new WheelEvent('wheel', { ...event, bubbles: true, cancelable: true })), init)
}
async function moveTo(targetR, focus) {
  const factor = targetR / R
  if (Math.abs(factor - 1) > 1e-9) {
    await wheel({ deltaY: -Math.log(factor) / pinch, ctrlKey: true, clientX: C.x, clientY: C.y })
    t = { x: C.x - (C.x - t.x) * factor, y: C.y - (C.y - t.y) * factor }
    R = targetR
  }
  const wanted = { x: C.x - R * focus.x, y: C.y - R * focus.y }
  const dx = wanted.x - t.x, dy = wanted.y - t.y
  if (Math.abs(dx) + Math.abs(dy) > 1e-9) { await wheel({ deltaX: -dx, deltaY: -dy }); t = wanted }
}
const ease = u => u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2
const mix = (a, b, u) => a + (b - a) * u

// Path over the flat plan: close on the scanning components top left, drift right to language analysis and the
// workers, pull back to the fitted view.
const START = { R: 3.4, focus: { x: 440, y: 230 } }
const MID = { R: 2.2, focus: { x: 690, y: 205 } }
const END = { R: 1.0, focus: { x: C.x, y: C.y } }
const PULL_END = 320 // frame where the camera reaches the fitted view
function pose(frame) {
  const u = Math.min(1, frame / PULL_END)
  // Two segments sharing one eased clock, so the glide never stops in the middle.
  const e = ease(u)
  if (e < 0.45) { const v = e / 0.45; return { R: mix(START.R, MID.R, v), focus: { x: mix(START.focus.x, MID.focus.x, v), y: mix(START.focus.y, MID.focus.y, v) } } }
  const v = (e - 0.45) / 0.55
  return { R: Math.exp(mix(Math.log(MID.R), Math.log(END.R), v)), focus: { x: mix(MID.focus.x, END.focus.x, v), y: mix(MID.focus.y, END.focus.y, v) } }
}

// Frames at 60 fps from the start of the film: lights on at 241 (4.02 s), the click at 361 (6.02 s, a bar line),
// the push-in from 450 to 570 (7.5 to 9.5 s), the cut to the walk at 601 (10.02 s).
const BAR_IN = [256, 274], CLICK = 361, RISE_END = 445
const PUSH = { from: 450, to: 570, R: 2.4, focus: { x: 615, y: 250 } } // the scanning and language analysis clusters
const hooks = {}
for (let frame = 0; frame <= PULL_END; frame++) hooks[frame] = async () => { const p = pose(frame); await moveTo(p.R, p.focus) }
// Groma frames the new projection on the switch, so the fitted iso view is the reference for the push.
for (let frame = PUSH.from; frame <= PUSH.to; frame++) {
  hooks[frame] = [].concat(hooks[frame] ?? [], async () => {
    if (frame === PUSH.from) { R = 1; t = { x: 0, y: 0 } }
    const u = ease((frame - PUSH.from) / (PUSH.to - PUSH.from))
    await moveTo(Math.exp(mix(0, Math.log(PUSH.R), u)), { x: mix(C.x, PUSH.focus.x, u), y: mix(C.y, PUSH.focus.y, u) })
  })
}
for (let frame = BAR_IN[0]; frame <= BAR_IN[1]; frame++) {
  const opacity = ease((frame - BAR_IN[0]) / (BAR_IN[1] - BAR_IN[0]))
  hooks[frame] = [].concat(hooks[frame] ?? [], page => page.evaluate(value => document.body.style.setProperty('--film-bar', String(value)), opacity))
}

stage.roll(`${SCRATCH}/frames/hero-${THEME}`)
await runShot(stage, {
  frames: TO,
  skipUntil: FROM,
  cursorScale: 1.9,
  start: { x: W + 60, y: H + 80 },
  moves: [
    { from: 286, to: 350, x: iso.x, y: iso.y },
    // After the click the hand rests beside the switch, off the map.
    { from: 392, to: 452, x: iso.x + 400, y: iso.y + 60 },
  ],
  clicks: [CLICK],
  hooks,
  // The rise runs at half speed, so Groma's projection change reads as one smooth lift.
  speed: frame => frame >= CLICK && frame < RISE_END ? 0.5 : 1,
})
await encode(`${SCRATCH}/frames/hero-${THEME}`, `${OUT}/hero-${THEME}.mp4`)
await stage.close(); groma.stop(); process.exit(0)
