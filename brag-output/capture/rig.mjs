// Camera rig for filming the real Groma web map, frame by frame.
//
// The page gets a virtual clock before any Groma script runs: requestAnimationFrame, performance.now,
// Date.now, timers, and every CSS animation or transition only move when the rig says so. Each video
// frame is "advance the clock, take a screenshot", so a slow machine still gives perfectly even motion,
// and the rig can run Groma's own 220 ms camera flights in slow motion. The film set's Groma commits its
// crisp SVG redraw with a zero delay, and the clock runs that timer inside the same frame, so no frame
// shows the scaled bitmap Groma uses while a real camera is still moving.
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire('/Users/alex/projects/mrlesk.com/talks/groma/flash/package.json')
const { chromium } = require('playwright-chromium')

export const FPS = 60
export const FRAME_MS = 1000 / FPS

/** Starts `groma web` from a given Groma checkout in a given project folder. */
export async function startGroma({ groma, cwd, port }) {
  const server = spawn('bun', [`${groma}/src/cli.ts`, 'web', '--port', String(port)], { cwd, stdio: 'ignore' })
  const stop = () => { try { server.kill('SIGTERM') } catch {} }
  process.on('exit', stop)
  // Groma first serves a startup page that navigates to the map once the world is built; wait for the map itself.
  for (let attempt = 0; attempt < 360; attempt++) {
    try {
      const response = await fetch(`http://localhost:${port}/`)
      if (response.ok && (await response.text()).includes('id="world"')) return { stop, origin: `http://localhost:${port}` }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  stop()
  throw new Error(`Groma did not answer on port ${port}`)
}

function virtualClock() {
  let now = 0
  const epoch = Date.now()
  let frames = new Map()
  let nextFrame = 1
  const timers = new Map()
  let nextTimer = 1
  const seen = new WeakMap()
  window.__real = { setTimeout: window.setTimeout.bind(window) }
  window.requestAnimationFrame = callback => { const id = nextFrame++; frames.set(id, callback); return id }
  window.cancelAnimationFrame = id => { frames.delete(id) }
  performance.now = () => now
  Date.now = () => epoch + now
  window.setTimeout = (run, delay = 0, ...args) => { const id = nextTimer++; timers.set(id, { at: now + Number(delay), run, args }); return id }
  window.setInterval = (run, delay = 0, ...args) => { const id = nextTimer++; timers.set(id, { at: now + Number(delay), run, args, every: Math.max(4, Number(delay)) }); return id }
  window.clearTimeout = window.clearInterval = id => { timers.delete(id) }
  window.__advance = milliseconds => {
    now += milliseconds
    for (const [id, timer] of [...timers]) {
      if (timer.at > now) continue
      if (timer.every === undefined) timers.delete(id)
      else timer.at += timer.every
      try { typeof timer.run === 'function' && timer.run(...timer.args) } catch (error) { console.error(error) }
    }
    const due = [...frames.values()]
    frames = new Map()
    for (const callback of due) try { callback(now) } catch (error) { console.error(error) }
    // A zero-delay timer set by an animation frame (Groma's camera commit on the film set) lands in this same frame.
    for (const [id, timer] of [...timers]) {
      if (timer.at > now || timer.every !== undefined) continue
      timers.delete(id)
      try { typeof timer.run === 'function' && timer.run(...timer.args) } catch (error) { console.error(error) }
    }
    // CSS transitions and animations run on the compositor's real clock; pin them to the virtual one.
    for (const animation of document.getAnimations()) {
      let state = seen.get(animation)
      if (state === undefined) {
        state = { at: Number(animation.currentTime ?? 0) }
        seen.set(animation, state)
        try { animation.pause() } catch {}
      } else state.at += milliseconds
      const end = animation.effect?.getComputedTiming().endTime ?? Infinity
      try {
        if (Number.isFinite(end) && state.at >= end) animation.finish()
        else animation.currentTime = state.at
      } catch {}
    }
    return now
  }
}

/** Opens a page with the virtual clock installed. */
export async function openStage({ width = 1280, height = 720, scale = 1.5, css = '', init } = {}) {
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text'] })
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: 'light' })
  await context.addInitScript(virtualClock)
  if (init !== undefined) await context.addInitScript(init)
  const page = await context.newPage()
  page.on('pageerror', error => console.error('page error:', error.message))
  const stage = {
    page,
    browser,
    frame: 0,
    dir: undefined,
    async goto(url) {
      await page.goto(url, { waitUntil: 'load' })
      // Groma's startup page reloads itself into the map; keep waiting for the map across that reload.
      for (let attempt = 0; ; attempt++) {
        try { await page.waitForSelector('#map svg', { timeout: 60000 }); break } catch (error) {
          if (attempt === 5) throw error
          await page.waitForLoadState('load').catch(() => {})
        }
      }
      if (css !== '') await page.addStyleTag({ content: css })
      await stage.settle(1500)
    },
    /** Lets the page work for a while without filming: real time for the network, virtual time for the app. */
    async settle(milliseconds) {
      for (let spent = 0; spent < milliseconds; spent += 50) {
        await page.evaluate(step => window.__advance(step), 50)
        await new Promise(resolve => setTimeout(resolve, 15))
      }
    },
    /** Starts a new clip: frames are written as numbered JPEGs into `dir`. */
    roll(dir) {
      rmSync(dir, { recursive: true, force: true })
      mkdirSync(dir, { recursive: true })
      stage.dir = dir
      stage.frame = 0
    },
    /** Films `count` frames. `speed` is how fast Groma's clock runs against the video clock (0.25 = slow motion). */
    async film(count, { speed = 1, each } = {}) {
      for (let index = 0; index < count; index++) {
        if (each !== undefined) await each(index, count)
        await page.evaluate(step => window.__advance(step), FRAME_MS * speed)
        await page.screenshot({ path: `${stage.dir}/${String(stage.frame++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 96 })
      }
    },
    async close() { await browser.close() },
  }
  return stage
}

/** Turns a folder of numbered frames into an H.264 clip. */
export async function encode(dir, output) {
  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}/%05d.jpg`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p', '-g', '30', '-movflags', '+faststart', output], { stdio: 'inherit' })
    ffmpeg.on('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)))
  })
}

const easeInOut = u => u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2

/**
 * Adds a drawn mouse pointer to the page. Screenshots do not include the system cursor, so the film needs its own.
 * It has the arrow, the pointing hand for anything clickable, and the text cursor; `runShot` shows the one the page
 * asks for under the pointer. `scale` enlarges it for shots whose page is shown smaller than its own pixels.
 */
export async function installCursor(page, start, scale = 1) {
  await page.evaluate(({ x, y, scale }) => {
    const cursor = document.createElement('div')
    cursor.id = 'film-cursor'
    cursor.style.cssText = `position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;transform:translate(${x}px,${y}px)`
    const shadow = 'filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))'
    cursor.innerHTML = `<div style="transform:scale(${scale});transform-origin:0 0">`
      + '<i style="position:absolute;left:-23px;top:-23px;width:46px;height:46px;border-radius:50%;border:3px solid #1d9e75;opacity:0;box-sizing:border-box"></i>'
      + `<svg data-shape="arrow" width="30" height="30" viewBox="0 0 24 24" style="position:absolute;left:-5px;top:-3px;${shadow}"><path d="M5 2.5v17.2l4.6-4.3 2.9 6.6 2.7-1.2-2.9-6.5 6.2-.4z" fill="#171b1a" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`
      + `<svg data-shape="hand" width="30" height="30" viewBox="0 0 24 24" style="position:absolute;left:-12px;top:-2px;display:none;${shadow}"><path d="M8 3.2a1.7 1.7 0 0 1 3.4 0v7a1.6 1.6 0 0 1 3.2.3v.5a1.6 1.6 0 0 1 3.2.4v.6a1.5 1.5 0 0 1 3 .4v4.1c0 3-2.3 5.5-5.4 5.5h-2.6c-1.9 0-3.4-.9-4.4-2.4l-3.8-4.1c-.6-.9-.3-2 .6-2.4.8-.4 1.7-.2 2.3.5L8 14z" fill="#fff" stroke="#171b1a" stroke-width="1.3" stroke-linejoin="round"/><path d="M11.4 10.4v3.4M14.6 10.8v3M17.8 11.8v2.4" stroke="#171b1a" stroke-width="1.1" stroke-linecap="round"/></svg>`
      + `<svg data-shape="text" width="30" height="30" viewBox="0 0 24 24" style="position:absolute;left:-15px;top:-15px;display:none;${shadow}"><path d="M9 3.5h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H9M15 3.5h-2a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h2" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M9 3.5h2a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H9M15 3.5h-2a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h2" fill="none" stroke="#171b1a" stroke-width="1.6" stroke-linecap="round"/></svg>`
      + '</div>'
    document.body.append(cursor)
  }, { ...start, scale })
}

/**
 * Runs a scripted shot. `moves` are cursor legs ({ from, to, x, y } in frames and CSS pixels), `clicks` are
 * frame numbers where the mouse really clicks at the cursor, `hooks` run just before their frame is filmed,
 * `speed(frame)` is how fast Groma's clock runs on that frame, and `cursorScale` enlarges the drawn pointer.
 */
export async function runShot(stage, { frames, start, moves = [], clicks = [], hooks = {}, speed = () => 1, skipUntil = 0, cursorScale = 1 }) {
  const page = stage.page
  let at = { ...start }
  await installCursor(page, at, cursorScale)
  await page.mouse.move(at.x, at.y)
  const rippleFrames = 22
  for (let frame = 0; frame < frames; frame++) {
    const leg = moves.find(move => frame >= move.from && frame <= move.to)
    if (leg !== undefined) {
      if (frame === leg.from) leg.origin = { ...at }
      const u = easeInOut((frame - leg.from) / Math.max(1, leg.to - leg.from))
      at = { x: leg.origin.x + (leg.x - leg.origin.x) * u, y: leg.origin.y + (leg.y - leg.origin.y) * u }
      await page.mouse.move(at.x, at.y)
    }
    if (clicks.includes(frame)) await page.mouse.click(at.x, at.y)
    for (const hook of [].concat(hooks[frame] ?? [])) await hook(page)
    const clicked = clicks.filter(click => frame >= click && frame < click + rippleFrames).at(-1)
    await page.evaluate(({ x, y, ripple }) => {
      const cursor = document.getElementById('film-cursor')
      if (cursor === null) return
      cursor.style.transform = `translate(${x}px,${y}px)`
      // The shape the page asks for under the pointer. The map's own grab hand stays an arrow, so the cursor reads
      // as a mouse while it travels; buttons, links and components show the pointing hand, text fields the I-beam.
      const under = document.elementFromPoint(x, y)
      const wanted = under === null ? 'auto' : getComputedStyle(under).cursor
      const field = under?.matches('input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]')
      const shape = wanted === 'pointer' ? 'hand' : wanted === 'text' || (wanted === 'auto' && field) ? 'text' : 'arrow'
      for (const svg of cursor.querySelectorAll('svg[data-shape]')) svg.style.display = svg.dataset.shape === shape ? '' : 'none'
      const ring = cursor.querySelector('i')
      ring.style.opacity = ripple === null ? '0' : String(0.9 * (1 - ripple))
      ring.style.transform = ripple === null ? 'scale(0.3)' : `scale(${0.35 + 1.1 * ripple})`
    }, { x: at.x, y: at.y, ripple: clicked === undefined ? null : (frame - clicked) / rippleFrames })
    if (frame < skipUntil) await page.evaluate(step => window.__advance(step), FRAME_MS * speed(frame))
    else await stage.film(1, { speed: speed(frame) })
  }
}
