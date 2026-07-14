import type { SlideControlAction } from './slidev-control-plugin'

const defaultBaseUrl = 'http://localhost:3030'

export async function sendSlideCommand(
  action: SlideControlAction,
  baseUrl = process.env.SLIDEV_CONTROL_URL ?? defaultBaseUrl,
) {
  const response = await fetch(new URL('/__slidev-control', baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  const result = await response.json() as unknown

  if (!response.ok)
    throw new Error(`Slidev control failed (${response.status}): ${JSON.stringify(result)}`)

  return result
}

export async function getSlideState(
  baseUrl = process.env.SLIDEV_CONTROL_URL ?? defaultBaseUrl,
) {
  const response = await fetch(new URL('/__slidev-control', baseUrl))
  const result = await response.json() as unknown

  if (!response.ok)
    throw new Error(`Slidev control failed (${response.status}): ${JSON.stringify(result)}`)

  return result
}

async function main() {
  const command = process.argv[2]

  if (command === 'state') {
    console.log(JSON.stringify(await getSlideState(), null, 2))
    return
  }

  if (command !== 'next' && command !== 'previous')
    throw new Error('Usage: bun run control <next|previous|state>')

  console.log(JSON.stringify(await sendSlideCommand(command), null, 2))
}

const entrypoint = process.argv[1]
if (entrypoint && import.meta.url === new URL(entrypoint, 'file:').href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
