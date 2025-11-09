#!/usr/bin/env bun

import { join } from 'node:path'
import { homedir } from 'node:os'

interface Command {
  name: string
  cmd: string[]
  cwd?: string
  env?: Record<string, string>
}

const shell = process.env.TTYD_SHELL ?? process.env.SHELL ?? 'bash'

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

const backlogDir = join(homedir(), 'projects', 'Backlog.md')
const backlogStartupCommand = process.env.BACKLOG_START_COMMAND ?? 'bun run cli board'
const backlogTtydPort = process.env.TTYD_BACKLOG_PORT ?? process.env.TTYD_PORT ?? '7681'

const commands: Command[] = [
  {
    name: 'ttyd-backlog',
    cmd: [
      'ttyd',
      '-W',
      '--client-option',
      'rendererType=dom',
      '--port',
      backlogTtydPort,
      shell,
      '-lc',
      backlogStartupCommand,
    ],
    cwd: backlogDir,
  },
  {
    name: 'slidev',
    cmd: ['bun', 'x', 'slidev', '--open'],
    cwd: process.cwd(),
  },
]

ensurePortFree(backlogTtydPort)

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
    } catch {
      // ignore - process may already be closed
    }
  }
  process.exit(code)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

await Promise.all(commands.map(start))
