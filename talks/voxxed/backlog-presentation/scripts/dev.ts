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

interface TerminalConfig {
  name: string
  port: string
  session: string
  cwd: string
  command?: string[]
}

function decode(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer)
}

function ensureTmuxSession(session: string, cwd: string, command: string[] = [shell]) {
  const hasSession = Bun.spawnSync({
    cmd: ['tmux', 'has-session', '-t', session],
    cwd,
    stdout: 'ignore',
    stderr: 'ignore',
  })

  if (hasSession.exitCode === 0) {
    const sessionPath = Bun.spawnSync({
      cmd: ['tmux', 'display-message', '-p', '-t', `${session}:0`, '#{pane_current_path}'],
      cwd,
      stdout: 'pipe',
      stderr: 'ignore',
    })

    const currentPath = decode(sessionPath.stdout).trim()
    if (sessionPath.exitCode === 0 && currentPath === cwd) return

    Bun.spawnSync({
      cmd: ['tmux', 'kill-session', '-t', session],
      cwd,
      stdout: 'ignore',
      stderr: 'ignore',
    })
  }

  const created = Bun.spawnSync({
    cmd: ['tmux', 'new-session', '-d', '-s', session, ...command],
    cwd,
    stdout: 'inherit',
    stderr: 'inherit',
  })

  if (created.exitCode !== 0) {
    log('tmux', `failed to create session ${session} (exit ${created.exitCode})`)
  }
}

function configureTmux(session: string, cwd: string) {
  Bun.spawnSync({
    cmd: ['tmux', 'set-option', '-t', session, 'status', 'off'],
    cwd,
    stdout: 'ignore',
    stderr: 'ignore',
  })

  Bun.spawnSync({
    cmd: ['tmux', 'set-option', '-t', session, 'status-left', ''],
    cwd,
    stdout: 'ignore',
    stderr: 'ignore',
  })

  Bun.spawnSync({
    cmd: ['tmux', 'set-option', '-t', session, 'status-right', ''],
    cwd,
    stdout: 'ignore',
    stderr: 'ignore',
  })
}

function killTmuxSession(session: string) {
  const hasSession = Bun.spawnSync({
    cmd: ['tmux', 'has-session', '-t', session],
    stdout: 'ignore',
    stderr: 'ignore',
  })

  if (hasSession.exitCode !== 0) return

  Bun.spawnSync({
    cmd: ['tmux', 'kill-session', '-t', session],
    stdout: 'ignore',
    stderr: 'ignore',
  })
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
const backlogDirConference = backlogDir//join(homedir(), 'projects', 'Backlog.md-conference')
const backlogStartupCommand = process.env.BACKLOG_START_COMMAND ?? 'bun run cli board'
const terminals: TerminalConfig[] = [
  {
    name: 'ttyd-backlog-shell',
    port: process.env.TTYD_BACKLOG_PORT ?? process.env.TTYD_PORT ?? '7681',
    session: 'voxxed-backlog-shell',
    cwd: backlogDir,
    command: [shell, '-lc', backlogStartupCommand],
  },
  {
    name: 'ttyd-claude-shell',
    port: process.env.TTYD_CLAUDE_PORT ?? '7682',
    session: 'voxxed-claude-shell',
    cwd: backlogDir,
    command: [shell, '-lc', 'claude --dangerously-skip-permissions'],
  },
  {
    name: 'ttyd-backlog-refresh',
    port: process.env.TTYD_BACKLOG_REFRESH_PORT ?? '7683',
    session: 'voxxed-backlog-refresh',
    cwd: backlogDirConference,
    command: [shell, '-l'],
  },
]

const commands: Command[] = []

for (const terminal of terminals) {
  ensurePortFree(terminal.port)
  ensureTmuxSession(terminal.session, terminal.cwd, terminal.command ?? [shell])
  configureTmux(terminal.session, terminal.cwd)

  commands.push({
    name: terminal.name,
    cmd: [
      'ttyd',
      '-W',
      '--client-option',
      'rendererType=dom',
      '--port',
      terminal.port,
      'tmux',
      'attach-session',
      '-t',
      terminal.session,
    ],
    cwd: terminal.cwd,
  })
}

commands.push({
  name: 'slidev',
  cmd: ['bun', 'x', 'slidev', '--open'],
  cwd: process.cwd(),
})

const running: { name: string; proc: Bun.Subprocess }[] = []
let shuttingDown = false
let cleanedUp = false

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
  cleanup()
  process.exit(code)
}

function cleanup() {
  if (cleanedUp) return
  cleanedUp = true
  log('dev', 'shutting down child processes...')
  for (const { proc } of running) {
    try {
      proc.kill()
    } catch {
      // ignore - process may already be closed
    }
  }
  for (const terminal of terminals) {
    killTmuxSession(terminal.session)
  }
  if (process.env.TMUX_KILL_SERVER === '1') {
    Bun.spawnSync({ cmd: ['tmux', 'kill-server'], stdout: 'ignore', stderr: 'ignore' })
  }
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
process.on('SIGHUP', () => shutdown(0))
process.on('exit', () => cleanup())
process.on('uncaughtException', (error) => {
  console.error(error)
  shutdown(1)
})

await Promise.all(commands.map(start))
