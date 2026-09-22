// Shot 1, "hero": map only. The camera glides over the map and pulls back to the whole system,
// then the map lifts into its C4 layers and orbits a little.
// Filmed twice with the same camera path: blueprint (the dark act) and light (after lights on).
import { startGroma, openStage, encode, FPS } from './rig.mjs'

const SCRATCH = process.env.SCRATCH
const OUT = process.env.OUT
const THEME = process.env.THEME            // blueprint | light
const FROM = Number(process.env.FROM ?? 0) // first filmed frame
const TO = Number(process.env.TO ?? 480)   // one past the last filmed frame
const W = 1280, H = 720, C = { x: W / 2, y: H / 2 }

const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: `${SCRATCH}/groma-clean`, port: Number(process.env.PORT ?? 4811) })
const stage = await openStage({ width: W, height: H, scale: 2 })
await stage.goto(`${groma.origin}/?theme=${THEME}&hud=off`)
const pinch = await stage.page.evaluate(() => 0.01) // PINCH_RATE in camera.ts

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

// Path: start close on the dense left side of the application, drift right, pull back to the fitted view.
const START = { R: 3.4, focus: { x: 470, y: 330 } }
const MID = { R: 2.2, focus: { x: 700, y: 300 } }
const END = { R: 1.0, focus: { x: C.x, y: C.y } }
const PULL_END = 330 // frame where the camera reaches the fitted view
function pose(frame) {
  const u = Math.min(1, frame / PULL_END)
  // Two segments sharing one eased clock, so the glide never stops in the middle.
  const e = ease(u)
  if (e < 0.45) { const v = e / 0.45; return { R: mix(START.R, MID.R, v), focus: { x: mix(START.focus.x, MID.focus.x, v), y: mix(START.focus.y, MID.focus.y, v) } } }
  const v = (e - 0.45) / 0.55
  return { R: Math.exp(mix(Math.log(MID.R), Math.log(END.R), v)), focus: { x: mix(MID.focus.x, END.focus.x, v), y: mix(MID.focus.y, END.focus.y, v) } }
}

stage.roll(`${SCRATCH}/frames/hero-${THEME}`)
const LAYERS_AT = 360, ORBIT_FROM = 390
let dragging = false
for (let frame = 0; frame < TO; frame++) {
  if (frame <= PULL_END) { const p = pose(frame); await moveTo(p.R, p.focus) }
  if (frame === LAYERS_AT) await stage.page.keyboard.press('F2')
  if (frame >= ORBIT_FROM) {
    // A slow drag: the exploded layers turn a few degrees, which sells the depth.
    const u = (frame - ORBIT_FROM) / (480 - ORBIT_FROM)
    const x = C.x + 34 * ease(u), y = C.y + 7 * ease(u)
    if (!dragging) { await stage.page.mouse.move(C.x, C.y); await stage.page.mouse.down(); dragging = true }
    await stage.page.mouse.move(x, y)
  }
  const speed = frame >= LAYERS_AT && frame < LAYERS_AT + 90 ? 0.55 : 1
  if (frame < FROM) await stage.page.evaluate(step => window.__advance(step), (1000 / FPS) * speed)
  else await stage.film(1, { speed })
}
if (dragging) await stage.page.mouse.up()
await encode(`${SCRATCH}/frames/hero-${THEME}`, `${OUT}/hero-${THEME}.mp4`)
await stage.close(); groma.stop(); process.exit(0)
