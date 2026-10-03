import { execFile } from 'node:child_process'
import { appendFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

/*
  A scenario: agents working Backlog.md tasks for real in a git clone that a live Groma watches.

  The clone's HEAD is the "before" commit. Every step runs the real `backlog` command or writes the
  real source edit, and a finished task is committed under its ID and title, as the agent would.
  The folder stays a git repository, so Groma can compare the "before" commit with what the agents
  left, live. Slides ask for a phase; going back resets the clone and replays up to it at once.
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

const pause = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

export class Scenario {
  phase = 0
  private target = 0
  private queue: Promise<void> = Promise.resolve()
  private progress: Record<string, Progress> = {}
  readonly last: number

  private constructor(readonly work: string, readonly base: string, private readonly plan: Plan, private readonly interval: number) {
    this.last = Math.max(0, ...plan.STEPS.map(step => step.phase))
    this.forget()
  }

  /** Clones `source` into `work` (any previous copy must be gone) and loads the steps from `script`. */
  static async prepare(source: string, work: string, script: string, interval: number): Promise<Scenario> {
    await run('git', ['clone', '--quiet', source, work])
    const base = (await run('git', ['-C', work, 'rev-parse', 'HEAD'])).stdout.trim()
    const plan = await import(pathToFileURL(script).href) as Plan
    const scenario = new Scenario(work, base, plan, interval)
    await scenario.scannersOff()
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
  view(): { phase: number, last: number, base: string, agents: AgentView[] } {
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
    return { phase: this.phase, last: this.last, base: this.base, agents }
  }

  private async goTo(phase: number): Promise<void> {
    // Moving forward plays the new phase at the scenario's pace. Going back resets the clone and
    // replays up to the phase at once, so stepping back during a rehearsal never waits.
    const forward = phase > this.phase
    if (!forward) await this.reset()
    for (const step of this.plan.STEPS.filter(item => item.phase > this.phase && item.phase <= phase)) {
      if (forward && step.phase === phase) await pause(this.interval)
      await this.step(step)
    }
    this.phase = phase
  }

  private async reset(): Promise<void> {
    await run('git', ['-C', this.work, 'reset', '--quiet', '--hard', this.base])
    await run('git', ['-C', this.work, 'clean', '-fdq'])
    await this.scannersOff()
    this.forget()
    this.phase = 0
  }

  private forget(): void {
    this.progress = Object.fromEntries(Object.keys(this.plan.TASKS).map(task => [task, { created: false, taken: false, done: false, checked: new Set<number>(), files: [] }]))
  }

  /** The service's own scanner settings never run here: the map shows the curated architecture and the tasks. */
  private async scannersOff(): Promise<void> {
    await writeFile(join(this.work, 'groma', 'scanners.json'), '{ "scanners": [] }\n')
    await run('git', ['-C', this.work, 'update-index', '--assume-unchanged', 'groma/scanners.json'])
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
