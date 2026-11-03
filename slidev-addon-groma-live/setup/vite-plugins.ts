import { type ChildProcess, execFile, execFileSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { type LiveAgentConfig, LiveAgents } from './live-agents'
import { Scenario } from './scenario'

/*
  Starts the Groma servers a deck needs, so `bun run dev` is the only command to run.

  The deck lists them in its headmatter:

    gromaLive:
      - name: groma            # a map that is ready when the deck opens
        cwd: ~/projects/groma3
        port: 4801
      - name: keycloak         # a map that is built on stage, one step per slide click
        port: 4803
        steps:
          - git clone ~/projects/keycloak .

  A plain instance runs `groma web --port <port>` in `cwd` as soon as Slidev starts. A port that
  already answers is left alone, so a Groma you started yourself keeps running.

  An instance with `replay` is a timelapse, driven by <GromaTimelapse name="...">. Its `source`
  is a git repository or bundle whose history holds Groma architecture and Backlog tasks. The
  first commit is laid out in ~/.groma-live/<name>/work, Groma serves that folder, and each later
  commit is applied on top at `interval` milliseconds, so the real map follows the history live.
  Scanners are switched off there: the map shows exactly what each commit stored.

  An instance with `steps` is driven by <GromaRun name="...">. Its steps run in a throwaway folder,
  ~/.groma-live/<name>, which is wiped before the first step. That folder is fixed on purpose: a
  configurable path next to "wipe it first" would be one typo away from deleting a real repository.
  Only the commands written in the headmatter can run; the browser sends a step number, never text.

  An instance with `scenario` is driven by <GromaAgents name="...">. Its `source` is cloned into
  ~/.groma-live/<name>/work and Groma serves that clone; `script` lists what the agents do, phase by
  phase (see demo/agents.mjs). Each slide click asks for a phase, and the steps run for real there:
  `backlog` commands, source edits, the agent's commit. The clone's HEAD stays the "before" commit,
  so Groma can compare it with what the agents left.

  An instance with `live` is driven by <GromaAgents name="..."> too, but its agents are real: its
  `template` repository (at `branch`) is cloned into ~/.groma-live/<name>/work, Groma serves that
  clone, and one `codex exec` per entry in `agents` starts right away with the `prompt` file (its
  {task} and {agent} filled in): read the task and plan, change nothing yet. Asking for phase 1
  resumes those sessions with the `go` text, all at once. CODEX_HOME is set to `codexHome`, so the
  demo's model and key stay apart from your own Codex setup (see setup/live-agents.ts). With the
  GROMA_LIVE_REHEARSAL environment variable set, the instance's `rehearsal` settings (Codex config keys,
  such as `model: gpt-6-luna`) override that setup for every run, for cheaper rehearsals.

  An instance with `snapshot` is a copy that nothing changes: its `template` repository (at `branch`) is
  cloned into ~/.groma-live/<name>/work, the `patch` file is applied to the working tree (Backlog task files
  left out), and Groma serves that folder. It backs up a live instance: the same baseline with the result
  of a recorded run.
*/

interface InstanceConfig {
  name: string
  port: number
  cwd?: string
  steps?: string[]
  replay?: { source: string, interval?: number }
  scenario?: { source: string, script: string, interval?: number }
  live?: { template: string, branch?: string, prompt: string, go?: string, codexHome: string, rehearsal?: Record<string, string>, setup?: string[], anyOrder?: boolean, agents: LiveAgentConfig[] }
  snapshot?: { template: string, branch?: string, patch: string }
}

interface Replay {
  history: string
  work: string
  commits: { id: string, subject: string }[]
  frame: number
  timer?: ReturnType<typeof setInterval>
}

interface Run {
  lines: string[]
  /** Index of the last step that was started; -1 before the first click. */
  started: number
  /** Index of the last step that finished successfully. */
  finished: number
  failed: boolean
  serving: boolean
  queue: Promise<void>
}

interface State {
  servers: Map<number, ChildProcess>
  runs: Map<string, Run>
  replays: Map<string, Replay>
  scenarios: Map<string, Scenario>
  lives: Map<string, LiveAgents>
  snapshots: Set<string>
  cleanup: boolean
}

// Vite re-runs this file when the deck's config changes. The state lives on globalThis so a
// restart neither loses the servers it started nor starts them twice.
const state: State = ((globalThis as any).__gromaLive ??= { servers: new Map(), runs: new Map(), replays: new Map(), cleanup: false })
state.replays ??= new Map()
state.scenarios ??= new Map()
state.lives ??= new Map()
state.snapshots ??= new Set()

const sandbox = (name: string) => join(homedir(), '.groma-live', name.replace(/[^a-z0-9-]/gi, '-'))
const expand = (path: string) => path.startsWith('~') ? join(homedir(), path.slice(1)) : path
const say = (name: string, text: string) => console.log(`  \x1B[32mgroma-live\x1B[0m \x1B[2m${name}\x1B[0m ${text}`)

/** The page title of whatever answers on the port, so a wrong project on it is visible at startup. */
async function answers(port: number): Promise<string | undefined> {
  try {
    const page = await (await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(800) })).text()
    return page.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'unknown page'
  } catch {
    return undefined
  }
}

async function serve(instance: InstanceConfig, cwd: string): Promise<void> {
  if (state.servers.has(instance.port)) return
  const running = await answers(instance.port)
  if (running !== undefined) return say(instance.name, `:${instance.port} already answers ("${running}"), left alone`)
  const child = spawn('groma', ['web', '--port', String(instance.port)], { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
  state.servers.set(instance.port, child)
  say(instance.name, `starting groma web on :${instance.port} in ${cwd}`)
  child.on('error', error => say(instance.name, `could not start groma: ${error.message}`))
  child.stderr?.on('data', data => say(instance.name, String(data).trim()))
  child.on('exit', code => {
    state.servers.delete(instance.port)
    if (code !== null && code !== 0) say(instance.name, `groma web stopped with code ${code}`)
  })
}

function stopAll(): void {
  for (const child of state.servers.values()) child.kill()
  state.servers.clear()
  for (const live of state.lives.values()) live.stop()
}

function runOf(name: string): Run {
  let run = state.runs.get(name)
  if (run === undefined) {
    run = { lines: [], started: -1, finished: -1, failed: false, serving: false, queue: Promise.resolve() }
    state.runs.set(name, run)
  }
  return run
}

function runStep(instance: InstanceConfig, run: Run, index: number): Promise<void> {
  return new Promise(resolve => {
    const command = instance.steps![index]!
    run.lines.push(`$ ${command}`)
    const cwd = instance.cwd !== undefined ? expand(instance.cwd) : sandbox(instance.name)
    const child = spawn('sh', ['-c', command], { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    // Progress output rewrites its own line ("Updating files: 42%"), so it replaces the last line
    // instead of filling the slide with a hundred percentages.
    const progress = (line: string | undefined) => line?.match(/^([A-Za-z ]+):\s+\d+%/)?.[1]
    const collect = (data: unknown) => {
      const clean = String(data).replace(/\x1B\[[0-9;]*[A-Za-z]/g, '')
      for (const line of clean.split(/[\r\n]+/).map(text => text.trimEnd()).filter(text => text !== '')) {
        if (progress(line) !== undefined && progress(run.lines.at(-1)) === progress(line)) run.lines[run.lines.length - 1] = line
        else run.lines.push(line)
      }
    }
    child.stdout?.on('data', collect)
    child.stderr?.on('data', collect)
    child.on('error', error => run.lines.push(String(error.message)))
    child.on('exit', code => {
      if (code === 0) run.finished = index
      else run.failed = true
      resolve()
    })
  })
}

/** Runs every step up to `to` exactly once, in order, however many windows ask for it. */
function advance(instance: InstanceConfig, to: number): void {
  const run = runOf(instance.name)
  const last = Math.min(to, instance.steps!.length - 1)
  while (run.started < last) {
    const index = ++run.started
    run.queue = run.queue.then(async () => {
      if (run.failed) return
      if (index === 0 && instance.cwd === undefined) {
        await rm(sandbox(instance.name), { recursive: true, force: true })
        await mkdir(sandbox(instance.name), { recursive: true })
      }
      await runStep(instance, run, index)
      if (!run.failed && index === instance.steps!.length - 1) {
        if (instance.port) {
          run.lines.push(`$ groma web --port ${instance.port}`)
          await serve(instance, instance.cwd !== undefined ? expand(instance.cwd) : sandbox(instance.name))
        }
        run.serving = true
      }
    })
  }
}

/** Forgets a run and stops its map, so the beat can be rehearsed again. */
function reset(instance: InstanceConfig): void {
  state.servers.get(instance.port)?.kill()
  state.servers.delete(instance.port)
  state.runs.delete(instance.name)
}

const git = (repository: string, ...args: string[]) => execFileSync('git', ['-C', repository, ...args], { maxBuffer: 64 * 1024 * 1024 })

/** Turns the work folder from one commit into another by writing only what differs between them. */
function applyCommit(replay: Replay, from: string | undefined, to: string): void {
  // Scanners stay off in the work folder, so the history's own scanner settings are never applied.
  const changes = from === undefined
    ? String(git(replay.history, 'ls-tree', '-r', '--name-only', to)).split('\n').filter(Boolean).map(path => ['A', path] as const)
    : String(git(replay.history, 'diff', '--name-status', '--no-renames', from, to)).split('\n').filter(Boolean).map(line => line.split('\t') as [string, string])
  for (const [status, path] of changes) {
    if (path === 'groma/scanners.json') continue
    const target = join(replay.work, path)
    if (status === 'D') rmSync(target, { force: true })
    else {
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, git(replay.history, 'show', `${to}:${path}`))
    }
  }
}

/** Clones the history, lays out its first commit, and serves that folder. */
function prepareReplay(instance: InstanceConfig, deckRoot: string): void {
  if (state.replays.has(instance.name)) return
  const root = sandbox(instance.name)
  const replay: Replay = { history: join(root, 'history'), work: join(root, 'work'), commits: [], frame: 0 }
  rmSync(root, { recursive: true, force: true })
  mkdirSync(replay.work, { recursive: true })
  const source = instance.replay!.source
  execFileSync('git', ['clone', '--quiet', source.startsWith('~') ? expand(source) : resolve(deckRoot, source), replay.history])
  replay.commits = String(git(replay.history, 'log', '--reverse', '--format=%H%x09%s')).split('\n').filter(Boolean)
    .map(line => ({ id: line.slice(0, line.indexOf('\t')), subject: line.slice(line.indexOf('\t') + 1) }))
  applyCommit(replay, undefined, replay.commits[0]!.id)
  mkdirSync(join(replay.work, 'groma'), { recursive: true })
  writeFileSync(join(replay.work, 'groma', 'scanners.json'), '{ "scanners": [] }\n')
  state.replays.set(instance.name, replay)
  say(instance.name, `timelapse of ${replay.commits.length} commits ready`)
  void serve(instance, replay.work)
}

function moveTo(replay: Replay, frame: number): void {
  applyCommit(replay, replay.commits[replay.frame]!.id, replay.commits[frame]!.id)
  replay.frame = frame
}

function play(instance: InstanceConfig, replay: Replay): void {
  if (replay.timer !== undefined || replay.frame >= replay.commits.length - 1) return
  replay.timer = setInterval(() => {
    moveTo(replay, replay.frame + 1)
    if (replay.frame >= replay.commits.length - 1) stop(replay)
  }, instance.replay!.interval ?? 700)
}

function stop(replay: Replay): void {
  clearInterval(replay.timer)
  replay.timer = undefined
}

/** Clones the scenario's service, loads its steps, and serves the clone. */
async function prepareScenario(instance: InstanceConfig, deckRoot: string): Promise<void> {
  if (state.scenarios.has(instance.name)) return
  const root = sandbox(instance.name)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  const { source, script, interval } = instance.scenario!
  const from = (path: string) => path.startsWith('~') ? expand(path) : resolve(deckRoot, path)
  const scenario = await Scenario.prepare(from(source), join(root, 'work'), from(script), interval ?? 600)
  state.scenarios.set(instance.name, scenario)
  say(instance.name, `scenario ready, ${scenario.last} phases from ${scenario.base.slice(0, 7)}`)
  await serve(instance, scenario.work)
}

/**
 * The setup steps a slide can press, each with the form actions Groma has used for it, newest first.
 * Groma 0.7 renamed the scanner step's form from /scanners to /plugins when that screen started to offer
 * Backlog.md too; slides keep saying 'scanners'.
 */
const SETUP_FORMS = new Map<string, readonly string[]>([
  ['initialize', ['initialize']],
  ['scanners', ['plugins', 'scanners']],
])

function unescaped(text: string): string {
  return text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/**
 * Presses the button of a Groma setup screen, as a click on it would: reads the form Groma shows on
 * `port` and, if it belongs to `step` ('initialize' for Continue, 'scanners' for Install & scan), sends it
 * with the values the screen shows. Any other screen is left alone, so a second window asking for the same
 * press does nothing. Groma answers that request only when the step is done, and the scan can take a
 * while; the setup page shows that progress itself, so this returns once the press is on its way.
 */
export async function pressSetup(port: number, step: string): Promise<boolean> {
  const actions = SETUP_FORMS.get(step)
  if (actions === undefined) return false
  const origin = `http://localhost:${port}`
  const page = await (await fetch(`${origin}/`, { signal: AbortSignal.timeout(3000) })).text()
  const action = actions.find(name => page.includes(`action="/${name}"`))
  if (action === undefined) return false
  const shown = page.match(new RegExp(`<form[^>]*action="/${action}"[^>]*>([\\s\\S]*?)</form>`))?.[1]
  if (shown === undefined) return false
  const fields = new URLSearchParams()
  for (const [tag] of shown.matchAll(/<input\b[^>]*>/g)) {
    const name = tag.match(/\bname="([^"]*)"/)?.[1]
    const type = tag.match(/\btype="([^"]*)"/)?.[1] ?? 'text'
    // A browser sends neither search boxes, disabled fields, nor unchecked boxes.
    if (name === undefined || type === 'search' || /\sdisabled\b/.test(tag)) continue
    if ((type === 'radio' || type === 'checkbox') && !/\schecked\b/.test(tag)) continue
    fields.append(name, unescaped(tag.match(/\bvalue="([^"]*)"/)?.[1] ?? ''))
  }
  void fetch(`${origin}/${action}`, { method: 'POST', body: fields }).catch(() => {})
  await new Promise(resolve => setTimeout(resolve, 400))
  return true
}

/** The model, effort and speed tier the agents' Codex uses, from CODEX_HOME's config.toml and the overrides. */
function codexConfig(codexHome: string, overrides: Record<string, string>): { model?: string, effort?: string, tier?: string } {
  let toml = ''
  try {
    toml = readFileSync(join(codexHome, 'config.toml'), 'utf8')
  } catch {}
  const value = (key: string) => overrides[key] ?? toml.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, 'm'))?.[1]
  return { model: value('model'), effort: value('model_reasoning_effort'), tier: value('service_tier') }
}

/** The same settings, for the console. */
function codexSettings(codexHome: string, overrides: Record<string, string>): string {
  const { model, effort, tier } = codexConfig(codexHome, overrides)
  return `${model ?? 'default model'}, ${effort ?? 'default'} effort, ${tier ?? 'standard'} tier`
}

async function prepareLive(instance: InstanceConfig, deckRoot: string): Promise<void> {
  if (state.lives.has(instance.name)) return
  const root = sandbox(instance.name)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  const { template, branch, prompt, go, codexHome, rehearsal, setup, anyOrder, agents } = instance.live!
  const from = (path: string) => path.startsWith('~') ? expand(path) : resolve(deckRoot, path)
  const isRehearsal = Boolean(process.env.GROMA_LIVE_REHEARSAL)
  const { codexHome: rehearsalHome, ...rehearsalOverrides } = rehearsal ?? {}
  const activeHome = from(isRehearsal ? (rehearsalHome ?? '~/.codex') : codexHome)
  const overrides = isRehearsal ? rehearsalOverrides : {}
  const codexArgs = [
    ...(isRehearsal ? ['-c', 'notify=[]'] : []),
    ...Object.entries(overrides).flatMap(([key, value]) => ['-c', `${key}=${JSON.stringify(value)}`]),
  ]
  // Codex logs a session's speed tier only on a resume, so the cost counter prices the rest at the configured one.
  const { model, tier } = codexConfig(activeHome, overrides)
  const live = await LiveAgents.prepare(from(template), branch, join(root, 'work'), agents, from(prompt), go ?? 'Implement your plan now. Do not ask any questions.', activeHome, codexArgs, { model, tier })
  live.port = instance.port
  live.anyOrder = anyOrder === true
  live.log = text => say(instance.name, text)
  state.lives.set(instance.name, live)
  // Setup commands run in the clone before it is served or planned on, such as installing the dependencies its
  // scanners need. A reset keeps their output: it cleans untracked files, not ignored ones.
  for (const command of setup ?? []) {
    say(instance.name, `running "${command}" in the clone`)
    try {
      await run('sh', ['-c', command], { cwd: live.work, maxBuffer: 64 * 1024 * 1024 })
    } catch (error) {
      say(instance.name, `"${command}" failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  live.plan()
  const mode = isRehearsal ? (rehearsal === undefined ? ' (rehearsal, but no rehearsal settings)' : ' (rehearsal)') : ''
  say(instance.name, `${agents.length} live agents planning on ${live.base.slice(0, 7)} with ${codexSettings(activeHome, overrides)}${mode}`)
  await serve(instance, live.work)
}

const run = promisify(execFile)

/** Clones the template, applies the patch to its working tree and serves it: a copy that nothing changes. */
async function prepareSnapshot(instance: InstanceConfig, deckRoot: string): Promise<void> {
  if (state.snapshots.has(instance.name)) return
  state.snapshots.add(instance.name)
  const root = sandbox(instance.name)
  rmSync(root, { recursive: true, force: true })
  mkdirSync(root, { recursive: true })
  const { template, branch, patch } = instance.snapshot!
  const from = (path: string) => path.startsWith('~') ? expand(path) : resolve(deckRoot, path)
  const work = join(root, 'work')
  await run('git', ['clone', '--quiet', ...(branch === undefined ? [] : ['--branch', branch]), from(template), work])
  // Backlog task files stay out: a comparison shows architecture and code, never tasks, and a recorded run's task
  // edits stop applying as soon as the deck's tasks are rewritten.
  await run('git', ['-C', work, 'apply', '--binary', '--exclude=backlog/*', from(patch)])
  const changed = (await run('git', ['-C', work, 'status', '--short'])).stdout.split('\n').filter(Boolean).length
  say(instance.name, `snapshot ready: ${changed} changed files from ${patch}`)
  await serve(instance, work)
}

export default function gromaLive(options: { mode?: string, userRoot: string, data: { headmatter: Record<string, unknown> } }) {
  const instances = (options.data.headmatter.gromaLive ?? []) as InstanceConfig[]
  if (options.mode !== 'dev' || instances.length === 0) return []

  return [{
    name: 'groma-live',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any) => void) => void }, httpServer?: { once: (event: string, listener: () => void) => void } | null }) {
      for (const instance of instances) {
        try {
          if (instance.scenario !== undefined) {
            prepareScenario(instance, options.userRoot).catch(error => say(instance.name, `could not start: ${error instanceof Error ? error.message : String(error)}`))
          }
          else if (instance.live !== undefined) {
            prepareLive(instance, options.userRoot).catch(error => say(instance.name, `could not start: ${error instanceof Error ? error.message : String(error)}`))
          }
          else if (instance.snapshot !== undefined) {
            prepareSnapshot(instance, options.userRoot).catch(error => say(instance.name, `could not start: ${error instanceof Error ? error.message : String(error)}`))
          }
          else if (instance.replay !== undefined) prepareReplay(instance, options.userRoot)
          else if (instance.steps === undefined && instance.cwd !== undefined) void serve(instance, expand(instance.cwd))
        } catch (error) {
          say(instance.name, `could not start: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      if (!state.cleanup) {
        state.cleanup = true
        process.once('exit', stopAll)
        // SIGHUP is the terminal closing: the agents run in their own process groups and would carry on without it.
        for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) process.once(signal, () => { stopAll(); process.exit(0) })
      }

      // GET  /__groma-live/<name>          what the run printed so far
      // POST /__groma-live/<name>?to=<n>   make sure steps 0..n have run
      // POST /__groma-live/<name>?reset    start over
      // For a timelapse: GET its position, POST ?play to run it, POST ?rewind to go back to the first commit.
      // For a scenario: GET what each agent is doing, POST ?to=<phase> (or ?to=end) to move there.
      // For any instance: POST ?setup=initialize|scanners presses that Groma setup screen's button.
      server.middlewares.use('/__groma-live', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const named = instances.find(item => item.name === url.pathname.slice(1))
        res.setHeader('Content-Type', 'application/json')
        if (named !== undefined && req.method === 'POST' && url.searchParams.has('setup')) {
          pressSetup(named.port, url.searchParams.get('setup') ?? '').then(
            submitted => res.end(JSON.stringify({ submitted })),
            () => res.end(JSON.stringify({ submitted: false })),
          )
          return
        }
        const live = named === undefined ? undefined : state.lives.get(named.name)
        if (live !== undefined && named !== undefined) {
          void serve(named, live.work)
          // Only a number starts the agents; 'end' (a review slide) and 0 never start or reset anything.
          const to = Number(url.searchParams.get('to'))
          const done = () => live.view().then(view => res.end(JSON.stringify(view)), () => res.end('{}'))
          if (req.method === 'POST' && url.searchParams.has('reset')) return void live.reset().then(done, done)
          if (req.method === 'POST' && to >= 1) live.start()
          return void done()
        }
        const scenario = named === undefined ? undefined : state.scenarios.get(named.name)
        if (scenario !== undefined) {
          const to = url.searchParams.get('to')
          if (req.method === 'POST' && to !== null) scenario.request(to === 'end' ? scenario.last : Number(to))
          return res.end(JSON.stringify(scenario.view()))
        }
        const replay = named === undefined ? undefined : state.replays.get(named.name)
        if (named !== undefined && replay !== undefined) {
          if (req.method === 'POST' && url.searchParams.has('play')) play(named, replay)
          if (req.method === 'POST' && url.searchParams.has('rewind')) { stop(replay); moveTo(replay, 0) }
          return res.end(JSON.stringify({ frame: replay.frame, total: replay.commits.length, subject: replay.commits[replay.frame]!.subject, playing: replay.timer !== undefined }))
        }
        const instance = named?.steps === undefined ? undefined : named
        if (instance === undefined) {
          res.statusCode = 404
          return res.end('{}')
        }
        if (req.method === 'POST' && url.searchParams.has('reset')) reset(instance)
        else if (req.method === 'POST') advance(instance, Number(url.searchParams.get('to') ?? -1))
        const run = runOf(instance.name)
        res.end(JSON.stringify({ lines: run.lines, finished: run.finished, failed: run.failed, serving: run.serving, steps: instance.steps!.length }))
      })
    },
  }]
}
