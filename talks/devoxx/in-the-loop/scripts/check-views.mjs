// Pre-talk check for the live map slides.
//
// Run it while `bun run dev` is up (that is what starts the Groma servers).
//
//   bun scripts/check-views.mjs            checks every <GromaFrame> and <GromaAgents> view against the running Groma
//   bun scripts/check-views.mjs --stills   also re-captures the fallback stills into public/demo
//   --deck http://localhost:3030           where `bun run dev` serves the deck (the default), for <GromaAgents>
//   --only 21b                             only the slides whose page file starts with this
//
// A view names ids (component, actor, flow, task...). Groma ignores ids it does not know, so a renamed
// component or an archived task would silently open the wrong thing on stage. This finds that early.
// <GromaAgents> slides depend on how far the agents got, so this moves their scenario first: to the end
// before checking ids (their tasks exist by then), and to each click's phase before its still.
import { readdirSync, readFileSync } from 'node:fs'
import { $ } from 'bun'

const root = new URL('..', import.meta.url).pathname
const captureStills = process.argv.includes('--stills')
const onlyFlag = process.argv.indexOf('--only')
const only = onlyFlag === -1 ? '' : process.argv[onlyFlag + 1]
const deckFlag = process.argv.indexOf('--deck')
const deck = deckFlag === -1 ? 'http://localhost:3030' : process.argv[deckFlag + 1]
const ID_PARAMS = ['actor', 'system', 'container', 'component', 'flow', 'task']

/** Every GromaFrame in pages/, with its origin, views and still names. */
function frames() {
  const found = []
  for (const name of readdirSync(`${root}pages`).filter(file => file.endsWith('.md') && file.startsWith(only)).sort()) {
    const text = readFileSync(`${root}pages/${name}`, 'utf8')
    const tag = text.match(/<Groma(?:Frame|Agents)[\s\S]*?\/>/)?.[0]
    if (tag === undefined) continue
    const list = attribute => [...(tag.match(new RegExp(`:${attribute}="\\[([\\s\\S]*?)\\]"`))?.[1] ?? '').matchAll(/'([^']*)'/g)].map(match => match[1])
    const phases = (tag.match(/:phases="\[([^\]]*)\]"/)?.[1] ?? '').split(',').map(Number).filter(Number.isFinite)
    const scenario = tag.startsWith('<GromaAgents') ? { name: tag.match(/name="([^"]+)"/)?.[1], phases, review: /\sreview[\s>\/]/.test(tag) } : undefined
    found.push({ page: name, origin: tag.match(/origin="([^"]+)"/)?.[1] ?? 'http://localhost:4747', views: list('views'), stills: list('stills'), scenario })
  }
  return found
}

async function world(origin) {
  const html = await (await fetch(origin, { signal: AbortSignal.timeout(4000) })).text()
  const boot = JSON.parse(html.match(/<script[^>]*id="world"[^>]*>([\s\S]*?)<\/script>/)[1])
  return new Set([...boot.world.elements.map(element => element.id), ...boot.world.flows.map(flow => flow.id), ...boot.work.items.map(task => task.id)])
}

/** Ports of maps that are built on stage (gromaLive entries with `steps`), so they may not answer yet. */
const builtOnStage = readFileSync(`${root}slides.md`, 'utf8').split(/^\s*- name:/m)
  .filter(entry => /^\s*steps:/m.test(entry)).map(entry => entry.match(/port:\s*(\d+)/)?.[1])

/** Moves a scenario to a phase ('end' for its last) and waits until the agents are there. */
async function phase(scenario, to) {
  const url = `${deck}/__groma-live/${scenario.name}`
  const { last } = await (await fetch(`${url}?to=${to}`, { method: 'POST' })).json()
  const wanted = to === 'end' ? last : to
  for (let tries = 0; tries < 160 && (await (await fetch(url)).json()).phase !== wanted; tries++) await Bun.sleep(250)
  await Bun.sleep(1500) // Groma's map glides for 700 ms after a change
}

let problems = 0
for (const frame of frames()) {
  let known
  try {
    if (frame.scenario !== undefined) await phase(frame.scenario, 'end')
    known = await world(frame.origin)
  } catch {
    const later = builtOnStage.includes(new URL(frame.origin).port)
    console.log(later ? `- ${frame.page}: ${frame.origin} is built on stage, not running yet` : `✗ ${frame.page}: nothing answers on ${frame.origin}`)
    if (!later) problems++
    continue
  }
  const unknown = frame.views.flatMap(view => [...new URLSearchParams(view)].filter(([name, id]) => ID_PARAMS.includes(name) && !known.has(id)).map(([name, id]) => `${name}=${id}`))
  if (unknown.length > 0) problems++
  console.log(`${unknown.length === 0 ? '✓' : '✗'} ${frame.page}: ${frame.views.length} views on ${frame.origin}${unknown.length === 0 ? '' : `, unknown: ${unknown.join(', ')}`}`)

  if (!captureStills || frame.stills.length === 0) continue
  const { chromium } = await import('playwright-chromium')
  const browser = await chromium.launch()
  const page = await (await browser.newContext({ viewport: { width: 1633, height: 920 }, deviceScaleFactor: 1.5, colorScheme: 'light' })).newPage()
  // Same inset the slides ask for (22 slide pixels at scale 0.6), so the stills match the live map.
  const search = view => `?theme=light&inset=37&${view}`
  // The slide embeds the map and posts each click's view to it, as below. Opening a view's URL directly
  // is not the same: with nothing selected, a freshly opened map selects its system by itself.
  await page.setContent(`<body style="margin:0"><script>addEventListener('message', event => { if (event.data && event.data.gromaReady) window.ready = true })</script><iframe id="map" src="${frame.origin}/${search(frame.views[0])}" style="width:1633px;height:920px;border:0"></iframe></body>`)
  await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 })
  for (const [index, still] of frame.stills.entries()) {
    if (frame.scenario !== undefined) await phase(frame.scenario, frame.scenario.review ? 'end' : frame.scenario.phases[Math.min(index, frame.scenario.phases.length - 1)])
    await page.evaluate(([view, origin]) => document.getElementById('map').contentWindow.postMessage({ gromaView: view }, origin), [search(frame.views[index]), frame.origin])
    await page.waitForTimeout(3500)
    const png = `${root}public/${still.replace(/\.webp$/, '.png')}`
    await page.screenshot({ path: png })
    await $`cwebp -quiet -q 84 ${png} -o ${root}public/${still}`
    await $`rm ${png}`
  }
  await browser.close()
  console.log(`  captured ${frame.stills.length} stills`)
}
process.exit(problems === 0 ? 0 : 1)
