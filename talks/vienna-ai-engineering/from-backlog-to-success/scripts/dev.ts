#!/usr/bin/env bun

import { $ } from 'bun'
import { join } from 'node:path'
import { homedir } from 'node:os'

interface Command {
  name: string
  cmd: string[]
  cwd?: string
  env?: Record<string, string>
}

const shell = process.env.TTYD_SHELL ?? process.env.SHELL ?? 'bash'

// Bun.spawnSync doesn't use PATH from env, so we need absolute path
const tmux = '/opt/homebrew/Cellar/tmux/3.5a/bin/tmux'

interface TerminalConfig {
  name: string
  port: string
  session: string
  cwd: string
}

function decode(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer)
}

async function ensureTmuxSession(session: string, cwd: string, command: string[] = [shell]) {
  const hasSession = await $`tmux has-session -t ${session}`.cwd(cwd).quiet().nothrow()

  if (hasSession.exitCode === 0) {
    // Recycle the session if it points at a different workspace
    const sessionPath = await $`tmux display-message -p -t ${session}:0 '#{pane_current_path}'`.cwd(cwd).quiet().nothrow()

    const currentPath = sessionPath.text().trim()
    if (sessionPath.exitCode === 0 && currentPath === cwd) return

    await $`tmux kill-session -t ${session}`.cwd(cwd).quiet().nothrow()
  }

  const cmdStr = command.length > 0 ? ` ${command.join(' ')}` : ''
  const created = await $`tmux new-session -d -s ${session}${cmdStr}`.cwd(cwd).nothrow()

  if (created.exitCode !== 0) {
    log('tmux', `failed to create session ${session} (exit ${created.exitCode})`)
  }
}

async function configureTmux(session: string, cwd: string) {
  await $`tmux set-option -t ${session} status off`.cwd(cwd).quiet().nothrow()
  await $`tmux set-option -t ${session} status-left ''`.cwd(cwd).quiet().nothrow()
  await $`tmux set-option -t ${session} status-right ''`.cwd(cwd).quiet().nothrow()
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

const codexDir = join(homedir(), 'projects/vienna-ai-engineering-demo-codex')
const claudeDir = join(homedir(), 'projects/vienna-ai-engineering-demo-claude')
Bun.spawnSync({ cmd: ['mkdir', codexDir] })
Bun.spawnSync({ cmd: ['mkdir', claudeDir] })

const terminals: TerminalConfig[] = [
  {
    name: 'ttyd-codex-primary',
    port: process.env.TTYD_PORT ?? '7681',
    session: 'backlog-codex-primary',
    cwd: codexDir,
  },
  {
    name: 'ttyd-codex-secondary',
    port: process.env.TTYD_BACKLOG_PORT ?? '7682',
    session: 'backlog-codex-secondary',
    cwd: codexDir,
  },
  {
    name: 'ttyd-claude',
    port: process.env.TTYD_CLAUDE_PORT ?? '7683',
    session: 'backlog-claude',
    cwd: claudeDir,
  },
]

const commands: Command[] = []

for (const terminal of terminals) {
  ensurePortFree(terminal.port)
  await ensureTmuxSession(terminal.session, terminal.cwd)
  await configureTmux(terminal.session, terminal.cwd)

  commands.push({
    name: terminal.name,
    cmd: [
      'ttyd',
      '-W',
      '--client-option',
      'rendererType=dom',
      '--client-option',
      'scrollback=0',
      '--port',
      terminal.port,
      tmux,
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
