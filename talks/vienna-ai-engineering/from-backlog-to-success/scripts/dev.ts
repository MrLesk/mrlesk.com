#!/usr/bin/env bun

import { join } from 'node:path'

interface Command {
  name: string
  cmd: string[]
  cwd?: string
  env?: Record<string, string>
}

const ttydPort = process.env.TTYD_PORT ?? '7681'
const splittingPort = process.env.TTYD_SPLITTING_PORT ?? '7682'
const shell = process.env.TTYD_SHELL ?? process.env.SHELL ?? 'bash'

const splittingPrompt = [
  '# Backlog.md Task Splitter',
  '',
  'You act as an AI engineering project manager.',
  'Given the backlog item:',
  '- Title: "Backlog.md splitting demo"',
  '- Context: Show how we transform a PRD into tasks during the talk.',
  '',
  'Instructions:',
  '1. Produce exactly 5 tasks.',
  '2. Each task lists `Task`, `Why`, and `Owner`.',
  '3. Format the result as a markdown table with those columns.',
  '4. Keep each task within 2 hours of work.',
  '',
  'Sign off with "Backlog.md FTW" on the last line.',
].join('\n')

const resumeShell = JSON.stringify(shell)
const splittingCommand = `codex --yolo --search ${JSON.stringify(splittingPrompt)}; printf '\n'; exec ${resumeShell}`

function decode(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer)
}

function ensurePortFree(port: string) {
  const result = Bun.spawnSync({
    cmd: ['lsof', '-ti', `tcp:${port}`],
    stdout: 'pipe',
    stderr: 'pipe',
  })

  if (result.exitCode !== 0) {
    const err = decode(result.stderr).trim()
    if (err && !err.includes('No such file or directory')) {
      log('dev', `warning: unable to inspect port ${port}: ${err}`)
    }
    return
  }

  const pids = decode(result.stdout)
    .split(/\s+/)
    .map((pid) => pid.trim())
    .filter(Boolean)

  if (!pids.length) return

  log('dev', `terminating processes on port ${port}: ${pids.join(', ')}`)
  for (const pid of pids) {
    Bun.spawnSync({ cmd: ['kill', '-TERM', pid] })
  }

  // Verify the port is free; escalate if needed.
  const verify = Bun.spawnSync({
    cmd: ['lsof', '-ti', `tcp:${port}`],
    stdout: 'pipe',
    stderr: 'pipe',
  })

  const stillBusy = decode(verify.stdout)
    .split(/\s+/)
    .map((pid) => pid.trim())
    .filter(Boolean)

  if (stillBusy.length) {
    log('dev', `force killing stubborn processes on port ${port}: ${stillBusy.join(', ')}`)
    for (const pid of stillBusy) {
      Bun.spawnSync({ cmd: ['kill', '-KILL', pid] })
    }
  }
}

ensurePortFree(ttydPort)

const commands: Command[] = [
  {
    name: 'ttyd',
    cmd: [
      'ttyd',
      '-W',
      '--client-option',
      'rendererType=dom',
      '--client-option',
      'scrollback=0',
      '--port',
      ttydPort,
      shell,
    ],
    cwd: join(process.cwd(), 'projects/vienna-ai-engineering-demo'),
  },
  {
    name: 'ttyd-splitting',
    cmd: [
      'ttyd',
      '-W',
      '--client-option',
      'rendererType=dom',
      '--client-option',
      'scrollback=0',
      '--port',
      splittingPort,
      shell,
      '-lc',
      splittingCommand,
    ],
    cwd: join(process.cwd(), 'projects/vienna-ai-engineering-demo'),
  },
  {
    name: 'slidev',
    cmd: ['bun', 'x', 'slidev', '--open'],
    cwd: process.cwd(),
  },
]

const running: { name: string; proc: Bun.Subprocess }[] = []
let shuttingDown = false

function log(name: string, message: string) {
  console.log(`\x1b[2m[${name}]\x1b[0m ${message}`)
}

async function start(command: Command) {
  log(command.name, `starting: ${command.cmd.join(' ')}`)
  const proc = Bun.spawn({
    cmd: command.cmd,
    cwd: command.cwd,
    env: {
      ...process.env,
      ...command.env,
    },
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  })

  running.push({ name: command.name, proc })

  const code = await proc.exited
  if (shuttingDown) return
  log(command.name, `exited with code ${code}`)
  shutdown(code ?? 0)
}

function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  log('dev', 'shutting down child processes...')
  for (const { proc } of running) {
    try {
      proc.kill()
    } catch (error) {
      // ignore - process may already be closed
    }
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

await Promise.all(commands.map(start))
