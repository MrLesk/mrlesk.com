import { randomUUID } from 'node:crypto'
import { appendFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'
import {
  LIVE_DECISION_PATH,
  LIVE_SESSION_PATH,
  SLIDE_DIRECTOR_DEBUG_FILE,
  SLIDE_DIRECTOR_DEBUG_PATH,
  buildLiveSession,
  buildSlideDecisionRequest,
  type LiveSessionOptions,
  type SlideDirectorToolName,
} from './slide-director'

export type SlideControlAction = 'next' | 'previous'

interface SlideControlCommand {
  action: SlideControlAction
  requestId: string
}

interface SlideControlState {
  currentSlide: number
  totalSlides: number
  updatedAt: string
}

interface SlideControlAck extends SlideControlState {
  requestId: string
}

export interface SlidevControlPluginOptions extends LiveSessionOptions {
  apiKey?: string
  debugLogPath?: string
}

const CONTROL_PATH = '/__slidev-control'
const PRESENTER_ROOT_PATH = '/presenter/'
const COMMAND_EVENT = 'slidev-control:command'
const ACK_EVENT = 'slidev-control:ack'
const STATE_EVENT = 'slidev-control:state'
const MAX_BODY_BYTES = 1_024
const MAX_LIVE_SESSION_BODY_BYTES = 256 * 1_024
const MAX_DECISION_BODY_BYTES = 64 * 1_024
const MAX_DEBUG_BODY_BYTES = 64 * 1_024
const ACK_TIMEOUT_MS = 1_500

function isLoopbackRequest(req: IncomingMessage) {
  const address = req.socket.remoteAddress
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

async function readText(req: IncomingMessage, maxBytes: number) {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length

    if (size > maxBytes)
      throw new Error('Request body is too large')

    chunks.push(buffer)
  }

  return Buffer.concat(chunks).toString('utf8')
}

async function readJson(req: IncomingMessage, maxBytes = MAX_BODY_BYTES) {
  return JSON.parse(await readText(req, maxBytes)) as unknown
}

function isAction(value: unknown): value is SlideControlAction {
  return value === 'next' || value === 'previous'
}

function isToolName(value: unknown): value is SlideDirectorToolName {
  return value === 'next_slide' || value === 'previous_slide' || value === 'hold_slide'
}

function readFunctionCall(value: unknown) {
  if (!value || typeof value !== 'object')
    return null

  const response = value as { output?: unknown[] }
  for (const item of response.output ?? []) {
    if (!item || typeof item !== 'object')
      continue

    const call = item as { type?: unknown, name?: unknown, call_id?: unknown }
    if (call.type === 'function_call' && isToolName(call.name)) {
      return {
        tool: call.name,
        callId: typeof call.call_id === 'string' ? call.call_id : randomUUID(),
      }
    }
  }

  return null
}

function isAck(value: unknown): value is SlideControlAck {
  if (!value || typeof value !== 'object')
    return false

  const ack = value as Partial<SlideControlAck>
  return typeof ack.requestId === 'string'
    && typeof ack.currentSlide === 'number'
    && typeof ack.totalSlides === 'number'
    && typeof ack.updatedAt === 'string'
}

function isState(value: unknown): value is SlideControlState {
  if (!value || typeof value !== 'object')
    return false

  const state = value as Partial<SlideControlState>
  return typeof state.currentSlide === 'number'
    && typeof state.totalSlides === 'number'
    && typeof state.updatedAt === 'string'
}

function parsePositiveInteger(value: string | null) {
  if (!value)
    return null

  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function slidevControlPlugin(options: SlidevControlPluginOptions = {}): Plugin {
  let latestState: SlideControlState | null = null
  const pending = new Map<string, (ack: SlideControlAck | null) => void>()

  function waitForAck(server: ViteDevServer, command: SlideControlCommand) {
    return new Promise<SlideControlAck | null>((resolve) => {
      const timeout = setTimeout(() => {
        pending.delete(command.requestId)
        resolve(null)
      }, ACK_TIMEOUT_MS)

      pending.set(command.requestId, (ack) => {
        clearTimeout(timeout)
        pending.delete(command.requestId)
        resolve(ack)
      })

      server.ws.send(COMMAND_EVENT, command)
    })
  }

  return {
    name: 'slidev-control-bridge',
    apply: 'serve',
    configureServer(server) {
      server.ws.on(ACK_EVENT, (payload) => {
        if (!isAck(payload))
          return

        latestState = {
          currentSlide: payload.currentSlide,
          totalSlides: payload.totalSlides,
          updatedAt: payload.updatedAt,
        }
        pending.get(payload.requestId)?.(payload)
      })

      server.ws.on(STATE_EVENT, (payload) => {
        if (isState(payload))
          latestState = payload
      })

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? '/', 'http://localhost')
        const pathname = requestUrl.pathname

        // Slidev 52.14.2 advertises /presenter/ but only registers /presenter
        // and /presenter/:no. Without this normalization the trailing-slash
        // URL is interpreted as play mode with "presenter" as the slide id.
        if (pathname === PRESENTER_ROOT_PATH && req.method === 'GET') {
          res.statusCode = 302
          res.setHeader('Location', `/presenter/1${requestUrl.search}`)
          res.setHeader('Cache-Control', 'no-store')
          res.end()
          return
        }

        if (pathname !== CONTROL_PATH
          && pathname !== LIVE_SESSION_PATH
          && pathname !== LIVE_DECISION_PATH
          && pathname !== SLIDE_DIRECTOR_DEBUG_PATH) {
          next()
          return
        }

        if (!isLoopbackRequest(req)) {
          sendJson(res, 403, { ok: false, error: 'Slide control accepts loopback requests only' })
          return
        }

        if (pathname === SLIDE_DIRECTOR_DEBUG_PATH) {
          if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST')
            sendJson(res, 405, { ok: false, error: 'Method not allowed' })
            return
          }

          let entry: unknown
          try {
            entry = JSON.parse(await readText(req, MAX_DEBUG_BODY_BYTES)) as unknown
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid debug event'
            sendJson(res, 400, { ok: false, error: message })
            return
          }

          if (!entry || typeof entry !== 'object') {
            sendJson(res, 400, { ok: false, error: 'Debug event must be a JSON object' })
            return
          }

          const debugLogPath = options.debugLogPath ?? resolve(process.cwd(), SLIDE_DIRECTOR_DEBUG_FILE)
          try {
            await appendFile(debugLogPath, `${JSON.stringify({
              ...entry,
              receivedAt: new Date().toISOString(),
            })}\n`, 'utf8')
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Could not write debug trace'
            sendJson(res, 500, { ok: false, error: message })
            return
          }

          sendJson(res, 202, { ok: true })
          return
        }

        if (pathname === LIVE_SESSION_PATH) {
          if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST')
            sendJson(res, 405, { ok: false, error: 'Method not allowed' })
            return
          }

          const apiKey = options.apiKey?.trim()
          if (!apiKey) {
            sendJson(res, 503, {
              ok: false,
              error: 'OPENAI_API_KEY is not configured. Add it to .env or export it before starting Slidev.',
            })
            return
          }

          const contentType = req.headers['content-type'] ?? ''
          if (!contentType.startsWith('application/json')) {
            sendJson(res, 415, { ok: false, error: 'Content-Type must be application/json' })
            return
          }

          let body: unknown
          try {
            body = await readJson(req, MAX_LIVE_SESSION_BODY_BYTES)
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Could not read live session request'
            sendJson(res, 400, { ok: false, error: message })
            return
          }

          const sdp = (body as { sdp?: unknown } | null)?.sdp
          if (typeof sdp !== 'string' || !sdp.trim()) {
            sendJson(res, 400, { ok: false, error: 'An SDP offer is required' })
            return
          }

          const requestedTotal = parsePositiveInteger(requestUrl.searchParams.get('totalSlides'))
          const totalSlides = requestedTotal ?? latestState?.totalSlides ?? 14
          const requestedCurrent = parsePositiveInteger(requestUrl.searchParams.get('currentSlide'))
          const currentSlide = Math.min(requestedCurrent ?? latestState?.currentSlide ?? 1, totalSlides)
          const session = buildLiveSession(
            { currentSlide, totalSlides },
            {
              liveModel: options.liveModel,
              decisionModel: options.decisionModel,
              decisionServiceTier: options.decisionServiceTier,
            },
          )

          let openAiResponse: Response
          try {
            openAiResponse = await fetch('https://api.openai.com/v1/live/sessions', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                session,
                transport: { type: 'webrtc', sdp },
              }),
            })
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Could not reach OpenAI'
            sendJson(res, 502, { ok: false, error: message })
            return
          }

          const responseBody = await openAiResponse.text()
          if (!openAiResponse.ok) {
            sendJson(res, openAiResponse.status, {
              ok: false,
              error: 'OpenAI Live session creation failed',
              detail: responseBody.slice(0, 2_000),
            })
            return
          }

          let responseJson: unknown
          try {
            responseJson = JSON.parse(responseBody) as unknown
          }
          catch {
            sendJson(res, 502, { ok: false, error: 'OpenAI Live returned invalid JSON' })
            return
          }

          sendJson(res, 201, responseJson)
          return
        }

        if (pathname === LIVE_DECISION_PATH) {
          if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST')
            sendJson(res, 405, { ok: false, error: 'Method not allowed' })
            return
          }

          const apiKey = options.apiKey?.trim()
          if (!apiKey) {
            sendJson(res, 503, {
              ok: false,
              error: 'OPENAI_API_KEY is not configured. Add it to .env or export it before starting Slidev.',
            })
            return
          }

          const contentType = req.headers['content-type'] ?? ''
          if (!contentType.startsWith('application/json')) {
            sendJson(res, 415, { ok: false, error: 'Content-Type must be application/json' })
            return
          }

          let body: unknown
          try {
            body = await readJson(req, MAX_DECISION_BODY_BYTES)
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Invalid slide decision request'
            sendJson(res, 400, { ok: false, error: message })
            return
          }

          const decision = body as { currentSlide?: unknown, totalSlides?: unknown, transcript?: unknown } | null
          if (!decision
            || !Number.isInteger(decision.currentSlide)
            || !Number.isInteger(decision.totalSlides)
            || (decision.currentSlide as number) < 1
            || (decision.totalSlides as number) < 1
            || (decision.currentSlide as number) > (decision.totalSlides as number)
            || typeof decision.transcript !== 'string'
            || !decision.transcript.trim()) {
            sendJson(res, 400, {
              ok: false,
              error: 'currentSlide, totalSlides, and a non-empty transcript are required',
            })
            return
          }

          const responseRequest = buildSlideDecisionRequest(
            {
              currentSlide: decision.currentSlide as number,
              totalSlides: decision.totalSlides as number,
            },
            decision.transcript,
            {
              decisionModel: options.decisionModel,
              decisionServiceTier: options.decisionServiceTier,
            },
          )

          let openAiResponse: Response
          try {
            openAiResponse = await fetch('https://api.openai.com/v1/responses', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(responseRequest),
            })
          }
          catch (error) {
            const message = error instanceof Error ? error.message : 'Could not reach OpenAI'
            sendJson(res, 502, { ok: false, error: message })
            return
          }

          const responseBody = await openAiResponse.text()
          if (!openAiResponse.ok) {
            sendJson(res, openAiResponse.status, {
              ok: false,
              error: 'OpenAI slide decision failed',
              detail: responseBody.slice(0, 2_000),
            })
            return
          }

          let responseJson: unknown
          try {
            responseJson = JSON.parse(responseBody) as unknown
          }
          catch {
            sendJson(res, 502, { ok: false, error: 'OpenAI slide decision returned invalid JSON' })
            return
          }

          const toolCall = readFunctionCall(responseJson)
          if (!toolCall) {
            sendJson(res, 502, { ok: false, error: 'OpenAI slide decision did not call a slide tool' })
            return
          }

          sendJson(res, 200, toolCall)
          return
        }

        if (req.method === 'GET') {
          sendJson(res, 200, { ok: true, state: latestState })
          return
        }

        if (req.method !== 'POST') {
          res.setHeader('Allow', 'GET, POST')
          sendJson(res, 405, { ok: false, error: 'Method not allowed' })
          return
        }

        let body: unknown
        try {
          body = await readJson(req)
        }
        catch (error) {
          const message = error instanceof Error ? error.message : 'Invalid JSON body'
          sendJson(res, 400, { ok: false, error: message })
          return
        }

        const action = (body as { action?: unknown } | null)?.action
        if (!isAction(action)) {
          sendJson(res, 400, { ok: false, error: 'action must be "next" or "previous"' })
          return
        }

        const command: SlideControlCommand = {
          action,
          requestId: randomUUID(),
        }
        const ack = await waitForAck(server, command)

        if (!ack) {
          sendJson(res, 503, {
            ok: false,
            error: 'No active Slidev slideshow acknowledged the command',
            state: latestState,
          })
          return
        }

        sendJson(res, 200, { ok: true, action, state: ack })
      })

      server.httpServer?.once('close', () => {
        for (const resolve of pending.values())
          resolve(null)
        pending.clear()
      })
    },
  }
}
