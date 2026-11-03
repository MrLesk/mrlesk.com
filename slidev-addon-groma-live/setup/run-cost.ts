import { open, readdir } from 'node:fs/promises'
import { join } from 'node:path'

/*
  What a run of live agents has cost so far, from the sessions Codex saves in CODEX_HOME/sessions: every
  API response is logged there with its exact token counts (token_usage_record), and each session logs the
  model it runs on. Codex logs the speed tier only when a session's settings are applied again, on a resume,
  so a fresh `codex exec` (every planning round) never says it: those sessions take the tier the run is
  configured with, from CODEX_HOME's config.toml and the rehearsal overrides. Priced at OpenAI's list prices,
  so the figure is an estimate of the bill before any credits. Files are read from where the last read
  stopped, so asking often stays cheap.
*/

/** USD per 1M tokens at the standard tier: input, cached input, cache writes, output. */
export const PRICES: Record<string, readonly [number, number, number, number]> = {
  'gpt-6-astra': [10, 1, 12.5, 50],
  'gpt-6.1-sol': [2, 0.1, 2.5, 10],
  'gpt-6-sol': [2, 0.2, 2.5, 10],
  'gpt-6.1-terra': [0.5, 0.05, 0.625, 2.5],
  'gpt-6-luna': [0.1, 0.01, 0.125, 0.5],
}

/** Rate multipliers by service tier: Fast (priority) doubles the rates, Ultrafast is six times them. */
export const TIERS: Record<string, number> = { default: 1, priority: 2, fast: 2, ultrafast: 6, flex: 0.5 }

export interface RunCostView {
  usd: number
  tokens: number
  /** The model and tier of the sessions, as Codex logged them or as the run is configured: `gpt-6.1-sol`, `ultrafast`. */
  model?: string
  tier?: string
}

/** The model and speed tier a run is configured with, for sessions whose log doesn't say. */
export interface CodexRunSettings {
  model?: string
  tier?: string
}

interface Session {
  path: string
  offset: number
  rest: string
  seen: Set<string>
  /** Uncached input, cached input, cache writes, output. */
  tokens: [number, number, number, number]
  model?: string
  tier?: string
}

export class RunCost {
  private sessions = new Map<string, Session>()

  constructor(private readonly codexHome: string, private readonly configured: CodexRunSettings = {}) {}

  /** The cost of these Codex sessions (thread ids) so far. Sessions not on disk yet count as nothing. */
  async of(threads: Iterable<string>): Promise<RunCostView> {
    const total: RunCostView = { usd: 0, tokens: 0 }
    for (const thread of threads) {
      const session = await this.session(thread)
      if (session === undefined) continue
      await this.read(session)
      const [uncached, cached, writes, output] = session.tokens
      total.tokens += uncached + cached + writes + output
      const model = session.model ?? this.configured.model
      const tier = session.tier ?? this.configured.tier
      total.model ??= model
      total.tier ??= tier
      const price = model === undefined ? undefined : PRICES[model]
      if (price === undefined) continue
      const rate = TIERS[tier ?? 'default'] ?? 1
      total.usd += (uncached * price[0] + cached * price[1] + writes * price[2] + output * price[3]) / 1e6 * rate
    }
    return total
  }

  /** Codex names each session file rollout-<time>-<thread>.jsonl, in a folder per day. */
  private async session(thread: string): Promise<Session | undefined> {
    const known = this.sessions.get(thread)
    if (known !== undefined) return known
    const now = new Date()
    const today = join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0'))
    let file: string | undefined
    try {
      const todayFiles = await readdir(join(this.codexHome, 'sessions', today))
      const found = todayFiles.find(name => name.endsWith(`-${thread}.jsonl`))
      if (found !== undefined) file = join(today, found)
    } catch {}
    if (file === undefined) {
      let files: string[]
      try {
        files = await readdir(join(this.codexHome, 'sessions'), { recursive: true })
      } catch {
        return undefined
      }
      file = files.find(name => name.endsWith(`-${thread}.jsonl`))
    }
    if (file === undefined) return undefined
    const session: Session = { path: join(this.codexHome, 'sessions', file), offset: 0, rest: '', seen: new Set(), tokens: [0, 0, 0, 0] }
    this.sessions.set(thread, session)
    return session
  }

  private async read(session: Session): Promise<void> {
    let handle
    try {
      handle = await open(session.path, 'r')
      const { size } = await handle.stat()
      if (size <= session.offset) return
      const buffer = Buffer.alloc(size - session.offset)
      await handle.read(buffer, 0, buffer.length, session.offset)
      session.offset = size
      const lines = (session.rest + buffer.toString('utf8')).split('\n')
      session.rest = lines.pop() ?? ''
      for (const line of lines) this.line(session, line)
    } catch {
      // A session file that cannot be read now is read again on the next call.
    } finally {
      await handle?.close()
    }
  }

  private line(session: Session, line: string): void {
    if (!line.includes('token_usage_record') && !line.includes('thread_settings_applied') && !line.includes('"turn_context"')) return
    let entry: { type?: string, payload?: Record<string, any> }
    try {
      entry = JSON.parse(line)
    } catch {
      return
    }
    const payload = entry.payload ?? {}
    if (entry.type === 'turn_context') session.model ??= payload.model
    // The tier arrives after the session's first responses; every response in a session runs on it.
    if (payload.type === 'thread_settings_applied') {
      session.model ??= payload.thread_settings?.model
      session.tier ??= payload.thread_settings?.service_tier ?? undefined
    }
    if (entry.type === 'token_usage_record') {
      const id = payload.response_id
      if (id === undefined || session.seen.has(id)) return
      session.seen.add(id)
      const usage = payload.usage ?? {}
      const input = usage.input_tokens ?? 0
      const cached = usage.cached_input_tokens ?? 0
      const writes = usage.cache_write_input_tokens ?? 0
      session.tokens[0] += Math.max(0, input - cached - writes)
      session.tokens[1] += cached
      session.tokens[2] += writes
      session.tokens[3] += usage.output_tokens ?? 0
    }
  }
}
