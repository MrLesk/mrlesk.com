// Shot 4, "timelapse": replay the demo order service's history into a folder that a real Groma watches.
// Components and task pins appear on the map because their files really appear. Commits land on a
// sixteenth-note grid (120 BPM), so the build moves with the music.
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
  css: '#scanner-warning { display: none !important; }',
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

const SLOTS = Number(process.env.SLOTS ?? 28), SLOT_FRAMES = 7.5, PRE = 12, HOLD = 90
const marks = []
stage.roll(`${SCRATCH}/frames/timelapse`)
await stage.film(PRE)
let applied = 0
for (let slot = 0; slot < SLOTS; slot++) {
  const upTo = Math.round(((slot + 1) * (commits.length - 1)) / SLOTS)
  const before = (await page.evaluate(() => window.__net.events))
  const first = applied + 1
  while (applied < upTo) apply(++applied)
  const seen = first <= applied ? await arrived(before) : true
  marks.push({ frame: stage.frame, from: first, to: applied, subject: commits[applied].subject, seen })
  await stage.film(Math.round((slot + 1) * SLOT_FRAMES) - Math.round(slot * SLOT_FRAMES))
}
await stage.film(HOLD)
writeFileSync(`${OUT}/timelapse.json`, JSON.stringify({ fps: 60, pre: PRE, total: commits.length, marks }, null, 1))
await encode(`${SCRATCH}/frames/timelapse`, `${OUT}/timelapse.mp4`)
console.log('unseen slots:', marks.filter(mark => !mark.seen).length, 'frames:', stage.frame)
await stage.close(); groma.stop(); process.exit(0)
