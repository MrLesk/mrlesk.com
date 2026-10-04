import { execFile } from 'node:child_process'
import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

/*
  A scenario: agents working Backlog.md tasks for real in a git clone that a live Groma watches.

  The clone's HEAD is the "before" commit. Every step runs the real `backlog` command or writes the
  real source edit, and a finished task is committed under its ID and title, as the agent would.
  The folder stays a git repository, so Groma can compare the "before" commit with what the agents
  left, live. Slides ask for a phase; going back resets the clone and replays up to it at once.

  With a HISTORY in the script, phase 0 is the source's first commit instead: an empty folder, an empty
  map. The history phase then checks out every later commit in turn, so the map grows as it did, and
  ends back on the branch at the "before" commit, where the agents start.
*/

const run = promisify(execFile)

type StepKind = 'create' | 'take' | 'edit' | 'check' | 'done'

interface Step {
  phase: number
  task: string
  kind: StepKind
  edits?: string[]
  ref?: string
  check?: number[]
}

interface Plan {
  TASKS: Record<string, { agent: string, create: string[] }>
  AGENTS: Record<string, string>
  EDITS: Record<string, [string, string]>
  STEPS: Step[]
  HISTORY?: { phase: number, interval: number }
}

interface Progress {
  created: boolean
  taken: boolean
  done: boolean
  checked: Set<number>
  files: string[]
  file?: string
}

export interface AgentView {
  agent: string
  name: string
  task: string
  title: string
  status: 'idle' | 'working' | 'done'
  file?: string
  checked: number
  criteria: number
}

export interface HistoryView {
  /** The scenario phase that replays the history. */
  phase: number
  /** The commit checked out, from 1, of `total`. */
  commit: number
  total: number
  /** Subjects of the commit checked out and the few before it, newest first. */
  recent: string[]
}

const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

export class Scenario {
  phase = 0
  private target = 0
  private queue: Promise<void> = Promise.resolve()
  private progress: Record<string, Progress> = {}
  /** The history, oldest first, and which of its commits is checked out (with a HISTORY only). */
  private commits: { id: string, subject: string }[] = []
  private frame = 0
  readonly last: number

  private constructor(readonly work: string, readonly base: string, readonly branch: string, private readonly plan: Plan, private readonly interval: number) {
    this.last = Math.max(0, plan.HISTORY?.phase ?? 0, ...plan.STEPS.map(step => step.phase))
    this.forget()
  }

  /** Clones `source` into `work` (any previous copy must be gone) and loads the steps from `script`. */
  static async prepare(source: string, work: string, script: string, interval: number): Promise<Scenario> {
    await run('git', ['clone', '--quiet', source, work])
    const base = (await run('git', ['-C', work, 'rev-parse', 'HEAD'])).stdout.trim()
    const branch = (await run('git', ['-C', work, 'rev-parse', '--abbrev-ref', 'HEAD'])).stdout.trim()
    const plan = await import(pathToFileURL(script).href) as Plan
    const scenario = new Scenario(work, base, branch, plan, interval)
    if (plan.HISTORY !== undefined) {
      scenario.commits = (await run('git', ['-C', work, 'log', '--reverse', '--format=%H%x09%s', base])).stdout
        .split('\n').filter(Boolean).map((line) => {
          const [id, subject] = line.split('\t')
          return { id: id!, subject: subject ?? '' }
        })
    }
    await scenario.scannersOff()
    await scenario.toFirstCommit()
    return scenario
  }

  /** Works towards `phase` after whatever was asked before; repeated requests for the same phase do nothing. */
  request(phase: number): void {
    const to = Math.max(0, Math.min(this.last, phase))
    if (to === this.target) return
    this.target = to
    this.queue = this.queue.then(() => this.goTo(to)).catch(error => console.error('groma-live scenario', error))
  }

  /** What each agent is doing, for the slide's panel. */
  view(): { phase: number, last: number, base: string, agents: AgentView[], history?: HistoryView } {
    const agents = Object.entries(this.plan.TASKS).map(([task, { agent, create }]) => {
      const progress = this.progress[task]!
      return {
        agent,
        name: this.plan.AGENTS[agent] ?? agent,
        task,
        title: create[0]!,
        status: progress.done ? 'done' as const : progress.taken ? 'working' as const : 'idle' as const,
        file: progress.file,
        checked: progress.checked.size,
        criteria: create.filter(argument => argument === '--ac').length,
      }
    })
    const history = this.plan.HISTORY === undefined
      ? undefined
      : { phase: this.plan.HISTORY.phase, commit: this.frame + 1, total: this.commits.length, recent: this.commits.slice(Math.max(0, this.frame - 13), this.frame + 1).map(commit => commit.subject).reverse() }
    return { phase: this.phase, last: this.last, base: this.base, agents, history }
  }

  private async goTo(phase: number): Promise<void> {
    // Moving forward plays the new phase at the scenario's pace. Going back resets the clone and
    // replays up to the phase at once, so stepping back during a rehearsal never waits.
    const forward = phase > this.phase
    if (!forward) await this.reset()
    const history = this.plan.HISTORY
    if (history !== undefined && this.phase < history.phase && phase >= history.phase)
      await this.replay(forward && phase === history.phase ? history.interval : 0)
    for (const step of this.plan.STEPS.filter(item => item.phase > this.phase && item.phase <= phase)) {
      if (forward && step.phase === phase) await pause(this.interval)
      await this.step(step)
    }
    this.phase = phase
  }

  private async reset(): Promise<void> {
    await run('git', ['-C', this.work, 'checkout', '--quiet', '--force', this.branch])
    await run('git', ['-C', this.work, 'reset', '--quiet', '--hard', this.base])
    await run('git', ['-C', this.work, 'clean', '-fdq'])
    await this.scannersOff()
    this.forget()
    await this.toFirstCommit()
    this.phase = 0
  }

  /** Phase 0 with a history: the first commit, checked out on its own. */
  private async toFirstCommit(): Promise<void> {
    if (this.commits.length === 0) return
    await this.checkout(this.commits[0]!.id)
    this.frame = 0
  }

  /** Checks out the history one commit at a time, so the map grows as it did; with no interval it jumps to the end. */
  private async replay(interval: number): Promise<void> {
    if (interval > 0) {
      for (let frame = this.frame + 1; frame < this.commits.length; frame++) {
        await pause(interval)
        await this.checkout(this.commits[frame]!.id)
        this.frame = frame
      }
    }
    await this.checkout(this.branch)
    this.frame = this.commits.length - 1
  }

  private async checkout(ref: string): Promise<void> {
    await run('git', ['-C', this.work, 'checkout', '--quiet', '--force', ref])
    await this.scannersOff()
  }

  private forget(): void {
    this.progress = Object.fromEntries(Object.keys(this.plan.TASKS).map(task => [task, { created: false, taken: false, done: false, checked: new Set<number>(), files: [] }]))
  }

  /** The service's own scanner settings never run here: the map shows the curated architecture and the tasks. */
  private async scannersOff(): Promise<void> {
    const file = join(this.work, 'groma', 'scanners.json')
    const off = '{ "scanners": [] }\n'
    // Written only when it differs, so the history's checkouts do not touch Groma's scanner settings.
    if (await readFile(file, 'utf8').catch(() => '') !== off) await writeFile(file, off)
    // skip-worktree, not assume-unchanged: a forced checkout rewrites an assume-unchanged file.
    await run('git', ['-C', this.work, 'update-index', '--skip-worktree', 'groma/scanners.json'])
  }

  private backlog(...args: string[]) {
    return run('backlog', args, { cwd: this.work })
  }

  private async step(step: Step): Promise<void> {
    const { task } = step
    const { agent, create } = this.plan.TASKS[task]!
    const progress = this.progress[task]!
    const checks = (step.check ?? []).flatMap(number => ['--check-ac', String(number)])
    for (const number of step.check ?? []) progress.checked.add(number)
    if (step.kind === 'create') {
      await this.backlog('task', 'create', ...create, '--no-dod-defaults')
      progress.created = true
    } else if (step.kind === 'take') {
      await this.backlog('task', 'edit', task, '-a', agent, '-s', 'In Progress')
      progress.taken = true
    } else if (step.kind === 'edit') {
      for (const name of step.edits ?? []) {
        const [file, text] = this.plan.EDITS[name]!
        await appendFile(join(this.work, file), text)
        if (!progress.files.includes(file)) progress.files.push(file)
        progress.file = file
      }
      await this.backlog('task', 'edit', task, ...progress.files.flatMap(file => ['--modified-file', file]), ...(step.ref === undefined ? [] : ['--add-ref', step.ref]), ...checks)
    } else if (step.kind === 'check') {
      await this.backlog('task', 'edit', task, ...checks)
    } else {
      // The agent commits its task under the task's ID and title, so the finished task shows that commit.
      const record = (await run('git', ['-C', this.work, 'ls-files', '--others', '--modified', '--exclude-standard', 'backlog/tasks'])).stdout
        .split('\n').filter(file => file.startsWith(`backlog/tasks/${task.toLowerCase()} - `))
      await run('git', ['-C', this.work, 'add', '--', ...progress.files, ...record])
      const name = this.plan.AGENTS[agent] ?? agent
      await run('git', ['-C', this.work, '-c', `user.name=${name}`, '-c', `user.email=${agent.replace(/^@/, '')}@agents.invalid`, 'commit', '--quiet', '-m', `${task} - ${create[0]}`])
      await this.backlog('task', 'edit', task, ...checks, '-s', 'Done')
      progress.done = true
    }
  }
}
