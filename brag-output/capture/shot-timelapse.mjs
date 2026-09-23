// Shot 4, "timelapse": replay the demo order service's history into a folder that a real Groma watches.
// Components and task pins appear on the map because their files really appear. Commits land on an
// eighth-note grid (120 BPM), so the build moves with the music.
// The film set shows the map, its task pins and the work island: the header and the element filters are hidden, the
// empty map's card keeps its title without the scanner setup step, and the camera follows the service itself (its
// islands, buildings and pins) instead of fitting the whole sheet, so the map never shrinks to a crowded miniature.
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { startGroma, openStage, encode } from './rig.mjs'

const SCRATCH = process.env.SCRATCH, OUT = process.env.OUT
const HISTORY = `${SCRATCH}/orders-history`, WORK = `${SCRATCH}/orders-work`
const git = (...args) => execFileSync('git', ['-C', HISTORY, ...args], { encoding: 'utf8', maxBuffer: 64e6 })
const commits = git('log', '--reverse', '--format=%H%x09%s').trim().split('\n').map(line => { const [hash, subject] = line.split('\t'); return { hash, subject } })
const SKIP = 'groma/scanners.json' // the film set keeps the scanners off: the history already holds the scan results

function write(hash, file) {
  if (file === SKIP) return
  mkdirSync(path.dirname(`${WORK}/${file}`), { recursive: true })
  writeFileSync(`${WORK}/${file}`, execFileSync('git', ['-C', HISTORY, 'show', `${hash}:${file}`], { maxBuffer: 64e6 }))
}
function apply(index) {
  const { hash } = commits[index]
  if (index === 0) { for (const file of git('ls-tree', '-r', '--name-only', hash).trim().split('\n')) write(hash, file); return }
  for (const line of git('diff', '--name-status', '--no-renames', commits[index - 1].hash, hash).trim().split('\n')) {
    const [status, file] = line.split('\t')
    if (status === 'D') { try { unlinkSync(`${WORK}/${file}`) } catch {} } else write(hash, file)
  }
}

rmSync(WORK, { recursive: true, force: true })
mkdirSync(`${WORK}/groma`, { recursive: true })
apply(0)
writeFileSync(`${WORK}/groma/scanners.json`, '{ "scanners": [] }\n')

const groma = await startGroma({ groma: `${SCRATCH}/groma-clean`, cwd: WORK, port: 4817 })
const stage = await openStage({
  scale: Number(process.env.SCALE ?? 1.5),
  css: '#scanner-warning, #empty .empty-action { display: none !important; }'
    + ' #header, #hierarchy, #c4-filter { visibility: hidden !important; }'
    + ' #empty .hint { font-size: 0 !important; } #empty .hint::before { content: "Add code when you\'re ready."; font-size: 14px; }',
  // Counts what arrives from the server, so the rig knows when a commit has reached the page.
  init: () => {
    window.__net = { events: 0, pending: 0 }
    const Native = window.EventSource
    window.EventSource = class extends Native {
      addEventListener(type, listener, options) { return super.addEventListener(type, event => { window.__net.events++; return listener.call(this, event) }, options) }
      set onmessage(listener) { super.addEventListener('message', event => { window.__net.events++; listener.call(this, event) }) }
    }
    const fetchNative = window.fetch.bind(window)
    window.fetch = async (...args) => { window.__net.pending++; try { return await fetchNative(...args) } finally { window.__net.pending-- } }
  },
})
const page = stage.page
await stage.goto(`${groma.origin}/?theme=light`)
await page.click('#hierarchy-toggle').catch(() => {})
await page.click('#details-close').catch(() => {})
await stage.settle(1200)

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
async function arrived(before) {
  const started = Date.now()
  let last = before, quietSince = Date.now()
  while (Date.now() - started < 3500) {
    await sleep(60)
    const net = await page.evaluate(() => ({ ...window.__net }))
    if (net.events !== last || net.pending > 0) { last = net.events; quietSince = Date.now() }
    if (net.events > before && Date.now() - quietSince > 260) return true
  }
  return false
}

// The camera: each frame it eases toward the framing that fits the service into AREA (CSS pixels, clear of the view
// switch above and the work island below), never closer than K_MAX. Moving it once also stops Groma's own fitting.
const AREA = { left: 60, top: 128, right: 1220, bottom: 604 }, K_MAX = 0.6, EASE = 0.07, PINCH = 0.01
const C = { x: 640, y: 360 }
const wheel = init => page.evaluate(event => document.getElementById('map').dispatchEvent(new WheelEvent('wheel', { ...event, bubbles: true, cancelable: true })), init)
async function follow() {
  const state = await page.evaluate(() => {
    const pose = document.querySelector('#map g.world')?.getAttribute('transform')?.match(/translate\(([-\d.e]+)[ ,]+([-\d.e]+)\) scale\(([-\d.e]+)\)/)
    // A pin is a zero-size anchor; its badge and stem hang off it, so measure its parts.
    const boxes = [...document.querySelectorAll('#map g.islands, #map g.items, #map .pin *')]
      .map(element => element.getBoundingClientRect()).filter(box => box.width > 0 && box.height > 0)
    if (!pose || boxes.length === 0) return null
    return {
      x: Number(pose[1]), y: Number(pose[2]), k: Number(pose[3]),
      left: Math.min(...boxes.map(box => box.left)), top: Math.min(...boxes.map(box => box.top)),
      right: Math.max(...boxes.map(box => box.right)), bottom: Math.max(...boxes.map(box => box.bottom)),
    }
  })
  if (state === null) return
  const fit = Math.min((AREA.right - AREA.left) / (state.right - state.left), (AREA.bottom - AREA.top) / (state.bottom - state.top))
  const factor = Math.min(K_MAX, state.k * fit) / state.k
  // The service's centre goes to the area's centre: offset = areaCentre - factor * (serviceCentre - offset).
  const target = {
    x: (AREA.left + AREA.right) / 2 - factor * ((state.left + state.right) / 2 - state.x),
    y: (AREA.top + AREA.bottom) / 2 - factor * ((state.top + state.bottom) / 2 - state.y),
  }
  const step = Math.pow(factor, EASE)
  if (Math.abs(step - 1) > 1e-4) await wheel({ deltaY: -Math.log(step) / PINCH, ctrlKey: true, clientX: C.x, clientY: C.y })
  const zoomed = { x: C.x - step * (C.x - state.x), y: C.y - step * (C.y - state.y) }
  const dx = zoomed.x + EASE * (target.x - zoomed.x) - zoomed.x, dy = zoomed.y + EASE * (target.y - zoomed.y) - zoomed.y
  if (Math.abs(dx) + Math.abs(dy) > 0.02) await wheel({ deltaX: -dx, deltaY: -dy })
}

// One second of the empty map, then 22 slots of an eighth note each, then a long look at the finished service.
const SLOTS = Number(process.env.SLOTS ?? 22), SLOT_FRAMES = 15, PRE = 60, HOLD = 110
const marks = []
stage.roll(`${SCRATCH}/frames/timelapse`)
await stage.film(PRE, { each: follow })
let applied = 0
for (let slot = 0; slot < SLOTS; slot++) {
  const upTo = Math.round(((slot + 1) * (commits.length - 1)) / SLOTS)
  const before = (await page.evaluate(() => window.__net.events))
  const first = applied + 1
  while (applied < upTo) apply(++applied)
  const seen = first <= applied ? await arrived(before) : true
  marks.push({ frame: stage.frame, from: first, to: applied, subject: commits[applied].subject, seen })
  await stage.film(Math.round((slot + 1) * SLOT_FRAMES) - Math.round(slot * SLOT_FRAMES), { each: follow })
}
await stage.film(HOLD, { each: follow })
writeFileSync(`${OUT}/timelapse.json`, JSON.stringify({ fps: 60, pre: PRE, total: commits.length, marks }, null, 1))
await encode(`${SCRATCH}/frames/timelapse`, `${OUT}/timelapse.mp4`)
console.log('unseen slots:', marks.filter(mark => !mark.seen).length, 'frames:', stage.frame)
await stage.close(); groma.stop(); process.exit(0)
