import { type ChildProcess, execFileSync, spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'

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
*/

interface InstanceConfig {
  name: string
  port: number
  cwd?: string
  steps?: string[]
  replay?: { source: string, interval?: number }
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
  cleanup: boolean
}

// Vite re-runs this file when the deck's config changes. The state lives on globalThis so a
// restart neither loses the servers it started nor starts them twice.
const state: State = ((globalThis as any).__gromaLive ??= { servers: new Map(), runs: new Map(), replays: new Map(), cleanup: false })
state.replays ??= new Map()

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
    const child = spawn('sh', ['-c', command], { cwd: sandbox(instance.name), stdio: ['ignore', 'pipe', 'pipe'] })
    // Progress output rewrites its own line ("Updating files: 42%"), so it replaces the last line
    // instead of filling the slide with a hundred percentages.
    const progress = (line: string | undefined) => line?.match(/^([A-Za-z ]+):\s+\d+%/)?.[1]
    const collect = (data: unknown) => {
      for (const line of String(data).split(/[\r\n]+/).map(text => text.trimEnd()).filter(text => text !== '')) {
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
      if (index === 0) {
        await rm(sandbox(instance.name), { recursive: true, force: true })
        await mkdir(sandbox(instance.name), { recursive: true })
      }
      await runStep(instance, run, index)
      if (!run.failed && index === instance.steps!.length - 1) {
        run.lines.push(`$ groma web --port ${instance.port}`)
        await serve(instance, sandbox(instance.name))
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

export default function gromaLive(options: { mode?: string, userRoot: string, data: { headmatter: Record<string, unknown> } }) {
  const instances = (options.data.headmatter.gromaLive ?? []) as InstanceConfig[]
  if (options.mode !== 'dev' || instances.length === 0) return []

  return [{
    name: 'groma-live',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any) => void) => void }, httpServer?: { once: (event: string, listener: () => void) => void } | null }) {
      for (const instance of instances) {
        try {
          if (instance.replay !== undefined) prepareReplay(instance, options.userRoot)
          else if (instance.steps === undefined && instance.cwd !== undefined) void serve(instance, expand(instance.cwd))
        } catch (error) {
          say(instance.name, `could not start: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      if (!state.cleanup) {
        state.cleanup = true
        process.once('exit', stopAll)
        for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { stopAll(); process.exit(0) })
      }

      // GET  /__groma-live/<name>          what the run printed so far
      // POST /__groma-live/<name>?to=<n>   make sure steps 0..n have run
      // POST /__groma-live/<name>?reset    start over
      // For a timelapse: GET its position, POST ?play to run it, POST ?rewind to go back to the first commit.
      server.middlewares.use('/__groma-live', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const named = instances.find(item => item.name === url.pathname.slice(1))
        res.setHeader('Content-Type', 'application/json')
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
