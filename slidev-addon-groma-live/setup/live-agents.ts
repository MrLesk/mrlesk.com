import { type ChildProcess, execFile, spawn } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { promisify } from 'node:util'
import { type CodexRunSettings, RunCost, type RunCostView } from './run-cost'

/*
  Live agents: real coding agents working Backlog.md tasks in a fresh copy of a prepared repository
  that a live Groma watches. Nothing is scripted: each agent works on its own, and the slide shows
  what it is doing from the events it prints.

  Each agent with an initial task starts as soon as the copy is ready, with the `prompt`: read the
  task, plan, change nothing yet. The slide's click resumes that same Codex session with the `go`
  prompt, so on stage the first wave starts from its plan instead of from reading. When a task
  finishes, the orchestrator marks it Done, updates the Groma map if `.groma-curate.mjs` is present,
  and queries `backlog task list --ready --status "To Do" --unassigned --plain` to dispatch newly
  unblocked tasks to free worker slots until all ready tasks in the dependency graph are Done.
  With `anyOrder`, it leaves out `--ready`: a free slot takes the next To Do task whether its
  dependencies are Done or not, so every slot keeps working.
*/

const run = promisify(execFile)

/**
 * The title in a task file's frontmatter, in every form Backlog.md writes it: plain, single or double quoted, or, for a
 * title longer than one YAML line, a folded block (`title: >-` with the text on the indented lines below).
 */
export function frontmatterTitle(text: string): string | undefined {
  const frontmatter = text.replaceAll('\r\n', '\n').match(/^---\n([\s\S]*?)\n---/)?.[1]
  if (frontmatter === undefined) return undefined
  const lines = frontmatter.split('\n')
  const index = lines.findIndex(line => line.startsWith('title:'))
  if (index < 0) return undefined
  const value = lines[index].slice('title:'.length).trim()
  let title = value
  if (/^[>|][+-]?$/.test(value)) {
    const block: string[] = []
    for (const line of lines.slice(index + 1)) {
      if (line.trim() !== '' && !/^\s/.test(line)) break
      block.push(line.trim())
    }
    title = block.join(' ')
  } else if (value.length > 1 && value.startsWith("'") && value.endsWith("'")) {
    title = value.slice(1, -1).replaceAll("''", "'")
  } else if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
    try { title = JSON.parse(value) } catch { title = value.slice(1, -1) }
  }
  title = title.replace(/\s+/g, ' ').trim()
  return title === '' ? undefined : title
}

export interface LiveAgentConfig {
  /** The initial Backlog.md task the agent works on, such as TASK-1, or empty string if waiting for ready tasks. */
  task?: string
  /** The assignee name without @. Groma's pin shows the vendor's logo for codex, claude or antigravity,
      and the first two letters of any other name. */
  name: string
  /** What the panel calls the agent; the assignee name when left out. `{n}` in it is the agent's number in the
      run (see `AgentRun.number`): six cards labelled `Codex {n}` start as Codex 1 to 6 and count on from there. */
  label?: string
}

type AgentStatus = 'planning' | 'idle' | 'working' | 'done' | 'failed'

export interface LiveAgentView {
  agent: string
  name: string
  /** The agent's number in the run (see `AgentRun.number`). */
  number: number
  task: string
  title: string
  /** `queued` is only in `everyAgent`: an agent that will start once a card is free. */
  status: AgentStatus | 'queued'
  file?: string
  action?: string
  waiting: boolean
  seconds: number
  checked: number
  criteria: number
  /** The colour of this agent's task pin on the map, read from Groma, so the card matches it. */
  colour?: string
}

interface AgentRun {
  task: string
  /** This agent's number in the run. The first wave counts 1, 2, 3 in panel order. Every task a card takes after
      that starts a new Codex session, so it is a new agent with the next number. 0 while the card has no task. */
  number: number
  child?: ChildProcess
  status: AgentStatus
  /** The Codex session that read the task and planned; the click resumes it. */
  thread?: string
  /** Every Codex session this worker slot started across waves, for its cost. */
  threads: string[]
  /** The plan is done and its session waits for the go. */
  planned: boolean
  /** The stage said go: an agent still planning starts the moment its plan is done. */
  go: boolean
  started?: number
  ended?: number
  file?: string
  action?: string
  waiting: boolean
  timer?: ReturnType<typeof setTimeout>
}

/** An agent that finished, kept after its card took the next task, so `everyAgent` still lists it. */
interface PastAgent {
  number: number
  /** The card (index in the configured agents) it ran in, for its label. */
  slot: number
  task: string
  status: AgentStatus
  seconds: number
  action?: string
  /** Its task's acceptance criteria, read once when the list first shows it: the task no longer changes. */
  ticks?: { checked: number, criteria: number }
}

/** A shell command as the panel shows it: the program and its first argument, without the shell wrapper. */
function summarize(command: string): string {
  const inner = command.match(/^\/bin\/\w+ -lc ['"](.*)['"]$/s)?.[1] ?? command
  return inner.replace(/\s+/g, ' ').trim().slice(0, 60)
}

export class LiveAgents {
  private runs: AgentRun[] = []
  /** The agents that finished and whose card has moved on to a new agent, oldest first. */
  private pastAgents: PastAgent[] = []
  private files = new Map<string, string>()
  private titles = new Map<string, string>()
  private colours = new Map<string, string>()
  private coloursRead = 0
  private claimedTasks = new Set<string>()
  private completedTasks = 0
  /** How many agents this run has numbered so far; the next agent gets the next number. */
  private agentsNumbered = 0
  private curationQueue: Promise<void> = Promise.resolve()
  private dispatchQueue: Promise<void> = Promise.resolve()
  private readonly costs: RunCost
  private costView?: RunCostView
  private costRead = 0
  /** The Groma that watches the copy, to read the pin colours from. */
  port = 0
  /** Where to report how the plans went, for the dev server's console. */
  log: (text: string) => void = () => {}
  /** Free slots take any To Do task, not only the ones whose dependencies are Done. */
  anyOrder = false
  started = false

  private constructor(
    readonly work: string,
    /** The baseline commit; RESET moves it to the template's latest main. */
    public base: string,
    private readonly agents: LiveAgentConfig[],
    private readonly prompt: string,
    private readonly goPrompt: string,
    private readonly env: NodeJS.ProcessEnv,
    private readonly codexArgs: string[],
    configured: CodexRunSettings,
  ) {
    this.costs = new RunCost(env.CODEX_HOME ?? '', configured)
    this.forget()
  }

  /** Clones `template` (at `branch`) into `work`, which must not exist yet, and reads the prompt every agent plans with.
      `codexArgs` go to every Codex run, such as `-c model="..."` overrides for a rehearsal; `configured` is the model
      and speed tier they amount to, for pricing sessions whose log doesn't name them. */
  static async prepare(template: string, branch: string | undefined, work: string, agents: LiveAgentConfig[], promptFile: string, goPrompt: string, codexHome: string, codexArgs: string[] = [], configured: CodexRunSettings = {}): Promise<LiveAgents> {
    await run('git', ['clone', '--quiet', ...(branch === undefined ? [] : ['--branch', branch]), template, work])
    const base = (await run('git', ['-C', work, 'rev-parse', 'HEAD'])).stdout.trim()
    const prompt = await readFile(promptFile, 'utf8')
    const live = new LiveAgents(work, base, agents, prompt, goPrompt, { ...process.env, CODEX_HOME: codexHome }, codexArgs, configured)
    await live.readAllTasks()
    return live
  }

  /** Every agent with an initial task reads its task and plans, changing nothing; a reset calls it again. */
  plan(): void {
    for (let i = 0; i < this.agents.length; i++) {
      if (this.runs[i]!.task !== '') this.planOne(i)
    }
  }

  /** The stage's go: every agent with a pre-assigned task starts at once, and ready tasks are dispatched. */
  start(): void {
    if (this.started) return
    this.started = true
    const seedTypes = join(this.work, '.seed/types.txt')
    if (existsSync(seedTypes)) {
      mkdirSync(join(this.work, 'src'), { recursive: true })
      copyFileSync(seedTypes, join(this.work, 'src/types.ts'))
      this.curationQueue = this.curationQueue.then(() => this.curateTask('INIT')).catch(() => {})
    }
    for (let i = 0; i < this.agents.length; i++) {
      if (this.runs[i]!.task !== '') void this.begin(i)
    }
    this.scheduleDispatch()
  }

  /** Stops every agent, puts the copy back on the baseline, tasks included, and plans again. */
  async reset(): Promise<void> {
    this.stop()
    this.started = false
    this.forget()
    await run('git', ['-C', this.work, 'fetch', '--quiet', 'origin']).catch(() => {})
    const head = await run('git', ['-C', this.work, 'rev-parse', 'origin/main']).catch(() => undefined)
    if (head?.stdout.trim()) this.base = head.stdout.trim()
    await run('git', ['-C', this.work, 'reset', '--quiet', '--hard', this.base])
    await run('git', ['-C', this.work, 'clean', '-fdq'])
    await run('groma', ['scan'], { cwd: this.work }).catch(() => {})
    await this.readAllTasks()
    this.plan()
  }

  stop(): void {
    for (const record of this.runs) {
      if (record.timer !== undefined) {
        clearTimeout(record.timer)
        record.timer = undefined
      }
      if (record.child?.pid !== undefined) {
        try {
          process.kill(-record.child.pid, 'SIGTERM')
        } catch {}
      }
    }
  }

  /**
   * What the panel shows. `agents` has one entry per card, each showing the agent working in it now.
   * `everyAgent` lists every agent of the run by number: the finished ones whose card moved on, the ones in the
   * cards now, then one `queued` agent per task nobody has taken yet.
   */
  async view(): Promise<{ live: true, phase: number, last: number, base: string, agents: LiveAgentView[], everyAgent: LiveAgentView[], cost?: RunCostView, completed?: number, totalTasks?: number }> {
    const now = Date.now()
    await this.readColours(now)
    const cost = await this.readCost(now)
    const agents = await Promise.all(this.agents.map(async (agent, index): Promise<LiveAgentView> => {
      const record = this.runs[index]!
      const { checked, criteria } = record.task === '' ? { checked: 0, criteria: 0 } : await this.criteria(record.task)
      return {
        agent: `@${agent.name}`,
        name: this.nameOf(agent, record.number),
        number: record.number,
        task: record.task,
        title: record.task === '' ? '' : (this.titles.get(record.task) ?? record.task),
        status: record.status,
        file: record.file,
        action: record.action,
        waiting: record.waiting,
        seconds: record.started === undefined ? 0 : Math.round(((record.ended ?? now) - record.started) / 1000),
        checked,
        criteria,
        colour: record.task === '' ? undefined : this.colours.get(record.task),
      }
    }))
    const totalTasks = this.titles.size
    const allClaimed = totalTasks > 0 ? this.claimedTasks.size >= totalTasks : true
    const finished = this.started && allClaimed && agents.every(agent => agent.status === 'done' || agent.status === 'failed')
    const past = await Promise.all(this.pastAgents.map(agent => this.pastView(agent)))
    const queued = Array.from({ length: Math.max(0, totalTasks - this.claimedTasks.size) }, (_, k) => this.queuedView(this.agentsNumbered + 1 + k))
    const everyAgent = [...past, ...agents.filter(agent => agent.task !== ''), ...queued].sort((a, b) => a.number - b.number)
    return {
      live: true,
      phase: !this.started ? 0 : finished ? 2 : 1,
      last: 2,
      base: this.base,
      agents,
      everyAgent,
      cost,
      completed: this.completedTasks,
      totalTasks,
    }
  }

  /** What this run has cost so far, planning included, read from Codex's saved sessions (see run-cost.ts)
      every two seconds at most, since the live slide asks several times a second. */
  private async readCost(now: number): Promise<RunCostView | undefined> {
    if (now - this.costRead < 2000) return this.costView
    this.costRead = now
    const threads = this.runs.flatMap(record => record.threads)
    this.costView = await this.costs.of(threads).catch(() => this.costView)
    return this.costView
  }

  /** Groma colours each task's pin by its place in the list, already before an agent takes the task, so the
      colours are read back per task, every few seconds at most: a card has its pin's colour from the start. */
  private async readColours(now: number): Promise<void> {
    if (this.port === 0 || now - this.coloursRead < 2000) return
    this.coloursRead = now
    try {
      const world = await (await fetch(`http://localhost:${this.port}/world.json`, { signal: AbortSignal.timeout(1500) })).json() as { pins?: { taskId: string, colour: string }[] }
      for (const pin of world.pins ?? []) this.colours.set(pin.taskId, pin.colour)
    } catch {}
  }

  /** Fresh records: a run that ends after this belongs to a record nobody holds any more, and is ignored. */
  private forget(): void {
    this.claimedTasks = new Set()
    this.completedTasks = 0
    this.agentsNumbered = 0
    this.pastAgents = []
    this.runs = this.agents.map((agent) => {
      const task = (agent.task ?? '').trim()
      if (task !== '') this.claimedTasks.add(task)
      return {
        task,
        number: task !== '' ? ++this.agentsNumbered : 0,
        status: task !== '' ? 'planning' as const : 'idle' as const,
        threads: [],
        planned: false,
        go: false,
        waiting: false,
      }
    })
    this.costView = undefined
    this.costRead = 0
  }

  private current(index: number, record: AgentRun): boolean {
    return this.runs[index] === record
  }

  /** What the panel and the log call agent `number` working in a card configured as `agent`: its label, with `{n}`
      filled in. */
  private nameOf(agent: LiveAgentConfig, number: number): string {
    const label = agent.label ?? agent.name
    return label.replaceAll('{n}', number === 0 ? '' : String(number)).trim()
  }

  private async pastView(past: PastAgent): Promise<LiveAgentView> {
    const agent = this.agents[past.slot]!
    past.ticks ??= await this.criteria(past.task)
    return {
      agent: `@${agent.name}`,
      name: this.nameOf(agent, past.number),
      number: past.number,
      task: past.task,
      title: this.titles.get(past.task) ?? past.task,
      status: past.status,
      action: past.action,
      waiting: false,
      seconds: past.seconds,
      checked: past.ticks.checked,
      criteria: past.ticks.criteria,
      colour: this.colours.get(past.task),
    }
  }

  /** An agent that has not started yet. Which card it will run in is not known, so it takes the first card's label. */
  private queuedView(number: number): LiveAgentView {
    const agent = this.agents[0]!
    return { agent: `@${agent.name}`, name: this.nameOf(agent, number), number, task: '', title: '', status: 'queued', waiting: false, seconds: 0, checked: 0, criteria: 0 }
  }

  private fill(text: string, agent: LiveAgentConfig, task: string): string {
    return text.replaceAll('{task}', task).replaceAll('{agent}', `@${agent.name}`)
  }

  private backlog(...args: string[]) {
    return run('backlog', args, { cwd: this.work })
  }

  private async readAllTasks(): Promise<void> {
    this.files.clear()
    this.titles.clear()
    const { stdout } = await run('git', ['-C', this.work, 'ls-files', '--', 'backlog/tasks'])
    for (const relPath of stdout.split('\n').filter(Boolean)) {
      const match = relPath.match(/^backlog\/tasks\/(task-\d+)\s-\s/i)
      if (!match) continue
      const taskId = match[1]!.toUpperCase()
      const fullPath = join(this.work, relPath)
      this.files.set(taskId, fullPath)
      const text = await readFile(fullPath, 'utf8').catch(() => '')
      const title = frontmatterTitle(text)
      if (title !== undefined) this.titles.set(taskId, title)
    }
  }

  /** Acceptance criteria ticked so far, read from the task file the agent updates. */
  private async criteria(task: string): Promise<{ checked: number, criteria: number }> {
    const file = this.files.get(task.toUpperCase())
    const text = file === undefined ? '' : await readFile(file, 'utf8').catch(() => '')
    const section = text.match(/<!-- AC:BEGIN -->([\s\S]*?)<!-- AC:END -->/)?.[1] ?? ''
    return { checked: (section.match(/^- \[x\]/gm) ?? []).length, criteria: (section.match(/^- \[[ x]\]/gm) ?? []).length }
  }

  /** Runs Codex in the copy for `record` and calls `ended` once, with the exit code and the last line it printed on stderr. */
  private codex(record: AgentRun, args: string[], ended: (code: number | null, said: string) => void): void {
    // stdin closed: with an open stdin, codex exec waits for more prompt text forever.
    const child = spawn('codex', args, { cwd: this.work, env: this.env, stdio: ['ignore', 'pipe', 'pipe'], detached: true })
    record.child = child
    let pending = ''
    let said = ''
    child.stdout?.on('data', (data) => {
      pending += String(data)
      const lines = pending.split('\n')
      pending = lines.pop() ?? ''
      for (const line of lines) this.event(record, line)
    })
    // Read, so a chatty stderr never fills its pipe and stalls the agent.
    child.stderr?.on('data', (data) => {
      said = `${said}${String(data)}`.slice(-1000)
    })
    let done = false
    const end = (code: number | null) => {
      if (done) return
      done = true
      if (record.child === child) record.child = undefined
      ended(code, said.trim().split('\n').at(-1) ?? '')
    }
    child.on('error', (error) => {
      said = error.message
      end(null)
    })
    child.on('exit', code => end(code))
  }

  private planOne(index: number): void {
    const agent = this.agents[index]!
    const record = this.runs[index]!
    const task = record.task
    if (task === '') return
    const name = this.nameOf(agent, record.number)
    const began = Date.now()
    this.codex(record, ['exec', ...this.codexArgs, '--json', '--skip-git-repo-check', '-C', this.work, this.fill(this.prompt, agent, task)], (code, said) => {
      if (!this.current(index, record) || record.task !== task) return
      record.planned = code === 0 && record.thread !== undefined
      if (record.planned) this.log(`${name} planned ${task} in ${Math.round((Date.now() - began) / 1000)} s`)
      else {
        record.thread = undefined
        this.log(`${name} could not plan ${task} (${code === null ? said : `code ${code}`}), so the click starts it from scratch${code === null || said === '' ? '' : `: ${said}`}`)
      }
      if (record.go) this.implement(index, record)
      else record.status = 'idle'
    })
  }

  private async begin(index: number): Promise<void> {
    const agent = this.agents[index]!
    const record = this.runs[index]!
    const task = record.task
    if (task === '') return
    record.status = 'working'
    record.started = Date.now()
    record.ended = undefined
    record.file = undefined
    record.action = record.planned ? 'implementing the plan' : record.child !== undefined ? 'planning' : 'reading the task'
    await this.backlog('task', 'edit', task, '-s', 'In Progress', '-a', `@${agent.name}`).catch(() => {})
    if (!this.current(index, record) || record.task !== task) return
    record.go = true
    // Still planning: the plan's end starts it.
    if (record.child === undefined) this.implement(index, record)
  }

  /** Resumes the agent's planning session with the go; without a plan, starts from scratch with both prompts. */
  private implement(index: number, record: AgentRun): void {
    const agent = this.agents[index]!
    const task = record.task
    const name = this.nameOf(agent, record.number)
    const args = record.thread !== undefined
      ? ['exec', 'resume', ...this.codexArgs, '--json', '--skip-git-repo-check', record.thread, this.goPrompt]
      : ['exec', ...this.codexArgs, '--json', '--skip-git-repo-check', '-C', this.work, `${this.fill(this.prompt, agent, task)}\n\n${this.goPrompt}`]
    this.codex(record, args, async (code, said) => {
      if (!this.current(index, record) || record.task !== task) return
      record.ended = Date.now()
      if (code === 0) {
        const { checked, criteria } = await this.criteria(task)
        if (checked < criteria) {
          const checkArgs = Array.from({ length: criteria }, (_, i) => ['--check-ac', String(i + 1)]).flat()
          await this.backlog('task', 'edit', task, ...checkArgs).catch(() => {})
        }
        await this.backlog('task', 'edit', task, '-s', 'Done').catch(() => {})
        this.completedTasks += 1
        this.log(`${name} finished ${task} (${this.completedTasks}/${this.titles.size})`)
        this.curationQueue = this.curationQueue.then(() => this.curateTask(task)).catch(() => {})
        record.status = 'done'
        record.action = undefined
        this.scheduleDispatch()
      }
      else {
        record.status = 'failed'
        record.action = code === null ? said : `stopped with code ${code}`
        this.scheduleDispatch()
      }
    })
  }

  private async curateTask(task: string): Promise<void> {
    const script = join(this.work, '.groma-curate.mjs')
    if (!existsSync(script)) return
    await run('bun', [script, task], { cwd: this.work }).catch(() => {})
  }

  private scheduleDispatch(): void {
    if (!this.started) return
    this.dispatchQueue = this.dispatchQueue.then(() => this.dispatchReady()).catch(() => {})
  }

  /** Queries Backlog.md for `--ready` tasks whose dependencies are all Done (any To Do task with `anyOrder`) and
      assigns them to free workers. */
  private async dispatchReady(): Promise<void> {
    if (!this.started) return
    const freeSlots: number[] = []
    for (let i = 0; i < this.runs.length; i++) {
      const r = this.runs[i]!
      if (r.child === undefined && r.timer === undefined && ((r.status === 'idle' && r.task === '') || r.status === 'done')) {
        freeSlots.push(i)
      }
    }
    if (freeSlots.length === 0) return

    // Prefer slots that have not run a task yet so all agent cards wake up before finished cards rotate.
    freeSlots.sort((a, b) => (this.runs[a]!.task === '' ? 0 : 1) - (this.runs[b]!.task === '' ? 0 : 1))

    let stdout = ''
    try {
      const ready = this.anyOrder ? [] : ['--ready']
      const res = await this.backlog('task', 'list', ...ready, '--status', 'To Do', '--unassigned', '--plain')
      stdout = res.stdout
    } catch {
      return
    }
    const readyTasks = [...new Set([...stdout.matchAll(/\b(TASK-\d+)\b/gi)].map(m => m[1]!.toUpperCase()))]
      .filter(taskId => !this.claimedTasks.has(taskId))

    if (readyTasks.length === 0) return

    const count = Math.min(freeSlots.length, readyTasks.length)
    for (let k = 0; k < count; k++) {
      const slotIndex = freeSlots[k]!
      const nextTask = readyTasks[k]!
      const record = this.runs[slotIndex]!
      const agent = this.agents[slotIndex]!
      const wasNeverUsed = record.task === ''
      if (!wasNeverUsed) {
        const seconds = record.started === undefined ? 0 : Math.round(((record.ended ?? Date.now()) - record.started) / 1000)
        this.pastAgents.push({ number: record.number, slot: slotIndex, task: record.task, status: record.status, seconds, action: record.action })
      }
      this.claimedTasks.add(nextTask)
      record.task = nextTask
      // A new Codex session, so a new agent: the card counts on.
      record.number = ++this.agentsNumbered
      record.thread = undefined
      record.planned = false
      record.go = true
      record.status = 'working'
      record.started = Date.now()
      record.ended = undefined
      record.file = undefined
      record.action = 'spawning agent'

      const delay = wasNeverUsed ? k * 1200 : 150
      record.timer = setTimeout(async () => {
        record.timer = undefined
        if (!this.current(slotIndex, record) || !this.started || record.task !== nextTask) return
        record.started = Date.now()
        record.action = 'reading the task'
        await this.backlog('task', 'edit', nextTask, '-s', 'In Progress', '-a', `@${agent.name}`).catch(() => {})
        if (!this.current(slotIndex, record) || !this.started || record.task !== nextTask) return
        this.implement(slotIndex, record)
      }, delay)
    }
  }

  private event(record: AgentRun, line: string): void {
    let event: { type?: string, thread_id?: string, message?: string, item?: { type?: string, command?: string, changes?: { path: string }[] } }
    try {
      event = JSON.parse(line)
    }
    catch {
      return
    }
    if (event.type === 'thread.started' && event.thread_id !== undefined) {
      record.thread ??= event.thread_id
      if (!record.threads.includes(event.thread_id)) record.threads.push(event.thread_id)
      return
    }
    if (event.type === 'error') {
      record.waiting = /rate limit/i.test(event.message ?? '')
      return
    }
    record.waiting = false
    const item = event.item ?? {}
    if (event.type === 'item.started' && item.type === 'command_execution' && item.command !== undefined)
      record.action = summarize(item.command)
    if (item.type === 'file_change') {
      const path = item.changes?.at(-1)?.path
      if (path !== undefined) {
        record.file = relative(this.work, path)
        record.action = `editing ${record.file.split('/').slice(-1)[0]}`
      }
    }
  }
}
