// Pre-talk check for the live map slides.
//
// Run it while `bun run dev` is up (that is what starts the Groma servers).
//
//   bun scripts/check-views.mjs            checks every <GromaFrame> view against the running Groma
//   bun scripts/check-views.mjs --stills   also re-captures the fallback stills into public/demo
//
// A view names ids (component, actor, flow, task...). Groma ignores ids it does not know, so a renamed
// component or an archived task would silently open the wrong thing on stage. This finds that early.
import { readdirSync, readFileSync } from 'node:fs'
import { $ } from 'bun'

const root = new URL('..', import.meta.url).pathname
const captureStills = process.argv.includes('--stills')
const ID_PARAMS = ['actor', 'system', 'container', 'component', 'flow', 'task']

/** Every GromaFrame in pages/, with its origin, views and still names. */
function frames() {
  const found = []
  for (const name of readdirSync(`${root}pages`).filter(file => file.endsWith('.md')).sort()) {
    const text = readFileSync(`${root}pages/${name}`, 'utf8')
    const tag = text.match(/<GromaFrame[\s\S]*?\/>/)?.[0]
    if (tag === undefined) continue
    const list = attribute => [...(tag.match(new RegExp(`:${attribute}="\\[([\\s\\S]*?)\\]"`))?.[1] ?? '').matchAll(/'([^']*)'/g)].map(match => match[1])
    found.push({ page: name, origin: tag.match(/origin="([^"]+)"/)?.[1] ?? 'http://localhost:4747', views: list('views'), stills: list('stills') })
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

let problems = 0
for (const frame of frames()) {
  let known
  try {
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
  for (const [index, still] of frame.stills.entries()) {
    // Same inset the slides ask for (22 slide pixels at scale 0.6), so the stills match the live map.
    await page.goto(`${frame.origin}/?theme=light&inset=37&${frame.views[index]}`, { waitUntil: 'load' })
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
