import {
  LIVE_DECISION_PATH,
  LIVE_SESSION_PATH,
  SLIDE_DIRECTOR_DEBUG_PATH,
  type SlideDirectorState,
  type SlideDirectorToolName,
} from './slide-director'

export type SlideDirectorStatus = 'off' | 'connecting' | 'listening' | 'acting' | 'error'

export interface SlideDirectorDebugEntry {
  sessionId: string
  timestamp: string
  elapsedMs: number
  type: string
  state: SlideDirectorState
  details?: Record<string, unknown>
}

export interface SlideDecision {
  tool: SlideDirectorToolName
  callId: string
}

export interface RealtimeSlideDirectorOptions {
  getState: () => SlideDirectorState
  executeTool: (name: SlideDirectorToolName) => Promise<unknown>
  decisionIntervalMs?: number
  requestDecision?: (state: SlideDirectorState, transcript: string) => Promise<SlideDecision>
  debug?: boolean
  debugSessionId?: string
  onDebug?: (entry: SlideDirectorDebugEntry) => void
  onStatus?: (status: SlideDirectorStatus, message: string) => void
}

interface LiveSessionResponse {
  id?: string
  session?: { id?: string }
  transport?: { sdp?: string }
}

interface LiveTranscriptEvent {
  type: 'session.input_transcript.delta'
  delta?: string
  start_ms?: number
  end_ms?: number
}

interface LiveDelegationEvent {
  type: 'session.delegation.created'
  delegation?: {
    id?: string
    target?: string
  }
  offset_ms?: number
}

interface LiveErrorEvent {
  type: 'error'
  error?: { message?: string }
}

const DEFAULT_DECISION_INTERVAL_MS = 425
const MAX_TRANSCRIPT_CHARS = 24_000

function isToolName(value: unknown): value is SlideDirectorToolName {
  return value === 'next_slide' || value === 'previous_slide' || value === 'hold_slide'
}

function readHttpError(raw: string, status: number) {
  try {
    const payload = JSON.parse(raw) as { error?: unknown, detail?: unknown }
    const error = typeof payload.error === 'string' ? payload.error : `OpenAI request failed (${status})`

    if (typeof payload.detail !== 'string')
      return error

    try {
      const detail = JSON.parse(payload.detail) as { error?: { message?: unknown } }
      const message = detail.error?.message
      return typeof message === 'string' ? `${error}: ${message}` : error
    }
    catch {
      return error
    }
  }
  catch {
    return raw || `OpenAI request failed (${status})`
  }
}

async function waitForIceGathering(peerConnection: RTCPeerConnection) {
  if (peerConnection.iceGatheringState === 'complete')
    return

  await new Promise<void>((resolve) => {
    const finish = () => {
      clearTimeout(timeout)
      peerConnection.removeEventListener('icegatheringstatechange', handleChange)
      resolve()
    }
    const handleChange = () => {
      if (peerConnection.iceGatheringState === 'complete')
        finish()
    }
    const timeout = setTimeout(finish, 3_000)
    peerConnection.addEventListener('icegatheringstatechange', handleChange)
  })
}

export class RealtimeSlideDirector {
  private readonly options: RealtimeSlideDirectorOptions
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private mediaStream: MediaStream | null = null
  private state: SlideDirectorState
  private stateRevision = 0
  private lifecycleRevision = 0
  private transcript = ''
  private transcriptRevision = 0
  private lastRequestedTranscriptRevision = 0
  private decisionTimer: ReturnType<typeof setTimeout> | null = null
  private decisionInFlight = false
  private handledCallIds = new Set<string>()
  private pendingDelegationIds = new Set<string>()
  private lastDecisionTool: SlideDirectorToolName | null = null
  private readonly debugSessionId: string
  private readonly debugStartedAt = Date.now()

  constructor(options: RealtimeSlideDirectorOptions) {
    this.options = options
    this.state = { ...options.getState() }
    this.debugSessionId = options.debugSessionId ?? globalThis.crypto?.randomUUID?.() ?? `slide-debug-${Date.now()}`
  }

  async connect() {
    this.disconnect(false)
    this.lifecycleRevision += 1
    this.debug('session_connecting', { userAgent: navigator.userAgent })
    this.setStatus('connecting', 'Requesting microphone access…')

    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error('This browser does not support microphone capture')

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const track = this.mediaStream.getAudioTracks()[0]
      if (!track)
        throw new Error('No microphone audio track is available')

      const peerConnection = new RTCPeerConnection()
      this.peerConnection = peerConnection
      peerConnection.addTrack(track, this.mediaStream)

      const dataChannel = peerConnection.createDataChannel('oai-events')
      this.dataChannel = dataChannel
      dataChannel.addEventListener('open', () => this.debug('data_channel_open'))
      dataChannel.addEventListener('message', event => this.handleServerEvent(event.data))
      dataChannel.addEventListener('close', () => {
        this.debug('data_channel_closed')
        if (this.peerConnection)
          this.setStatus('off', 'Auto slides are off')
      })

      peerConnection.addEventListener('connectionstatechange', () => {
        this.debug('connection_state_changed', { connectionState: peerConnection.connectionState })
        if (peerConnection.connectionState === 'failed')
          this.setStatus('error', 'Live connection failed. Click to retry')
      })

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      await waitForIceGathering(peerConnection)

      this.state = { ...this.options.getState() }
      const url = new URL(LIVE_SESSION_PATH, window.location.origin)
      url.searchParams.set('currentSlide', String(this.state.currentSlide))
      url.searchParams.set('totalSlides', String(this.state.totalSlides))

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: peerConnection.localDescription?.sdp ?? offer.sdp }),
      })
      const responseBody = await response.text()
      if (!response.ok)
        throw new Error(readHttpError(responseBody, response.status))

      let session: LiveSessionResponse
      try {
        session = JSON.parse(responseBody) as LiveSessionResponse
      }
      catch {
        throw new Error('Live session response was not valid JSON')
      }

      const answerSdp = session.transport?.sdp
      if (!answerSdp)
        throw new Error('Live session response did not include an SDP answer')

      this.debug('session_created', { sessionId: session.session?.id ?? session.id ?? null })
      await peerConnection.setRemoteDescription({ type: 'answer', sdp: answerSdp })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start auto slides'
      this.debug('session_error', { message })
      this.disconnect(false)
      this.setStatus('error', message)
      throw error
    }
  }

  disconnect(notify = true) {
    this.lifecycleRevision += 1
    if (this.peerConnection || this.dataChannel || this.mediaStream)
      this.debug('session_disconnected', { notify })
    this.clearDecisionTimer()
    this.dataChannel?.close()
    this.peerConnection?.close()
    this.mediaStream?.getTracks().forEach(track => track.stop())
    this.dataChannel = null
    this.peerConnection = null
    this.mediaStream = null
    this.decisionInFlight = false
    this.handledCallIds.clear()
    this.pendingDelegationIds.clear()
    this.lastDecisionTool = null
    this.resetTranscript()

    if (notify)
      this.setStatus('off', 'Auto slides are off')
  }

  updateSlideState(state: SlideDirectorState) {
    const previousState = this.state
    const changed = state.currentSlide !== previousState.currentSlide
      || state.totalSlides !== previousState.totalSlides

    this.state = { ...state }
    if (!changed)
      return

    this.stateRevision += 1
    this.clearDecisionTimer()
    this.resetTranscript()
    this.debug('slide_state_updated', {
      previousSlide: previousState.currentSlide,
      currentSlide: state.currentSlide,
    })
    this.send({
      type: 'session.thinking.append',
      event_id: `slide_state_${this.stateRevision}_${Date.now()}`,
      delegation_id: null,
      content: `Presentation state: slide ${state.currentSlide} of ${state.totalSlides} is now visible. Continue listening silently and delegate when the presenter adds relevant meaning.`,
    })
  }

  private handleServerEvent(raw: unknown) {
    if (typeof raw !== 'string')
      return

    let event: LiveTranscriptEvent | LiveDelegationEvent | LiveErrorEvent | { type?: string, session?: { id?: string } }
    try {
      event = JSON.parse(raw) as typeof event
    }
    catch {
      this.debug('invalid_server_event', { raw: raw.slice(0, 500) })
      return
    }

    if (event.type === 'session.started') {
      this.debug('session_started', { sessionId: event.session?.id ?? null })
      this.setStatus('listening', 'Listening. Click to stop')
      return
    }

    if (event.type === 'error') {
      const error = event as LiveErrorEvent
      const message = error.error?.message ?? 'OpenAI Live returned an error'
      this.debug('live_error', { message })
      this.setStatus('error', message)
      return
    }

    if (event.type === 'session.input_transcript.delta') {
      const transcriptEvent = event as LiveTranscriptEvent
      const delta = transcriptEvent.delta ?? ''
      if (!delta)
        return

      this.transcript = `${this.transcript}${delta}`.slice(-MAX_TRANSCRIPT_CHARS)
      this.transcriptRevision += 1
      this.debug('transcription_delta', {
        delta,
        startMs: transcriptEvent.start_ms,
        endMs: transcriptEvent.end_ms,
      }, false)
      this.scheduleDecision()
      return
    }

    if (event.type === 'session.delegation.created') {
      const delegationEvent = event as LiveDelegationEvent
      const delegationId = delegationEvent.delegation?.id
      if (delegationId)
        this.pendingDelegationIds.add(delegationId)
      this.debug('delegation_created', {
        delegationId: delegationId ?? null,
        target: delegationEvent.delegation?.target ?? null,
        offsetMs: delegationEvent.offset_ms ?? null,
      })

      if (this.transcriptRevision > this.lastRequestedTranscriptRevision)
        this.scheduleDecision(0)
      else if (this.lastDecisionTool)
        this.flushDelegations(this.lastDecisionTool, true)
    }
  }

  private scheduleDecision(delayMs = this.options.decisionIntervalMs ?? DEFAULT_DECISION_INTERVAL_MS) {
    if (this.decisionInFlight || this.transcriptRevision <= this.lastRequestedTranscriptRevision)
      return

    if (this.decisionTimer !== null) {
      if (delayMs > 0)
        return
      clearTimeout(this.decisionTimer)
    }

    this.decisionTimer = setTimeout(() => {
      this.decisionTimer = null
      void this.runDecision()
    }, Math.max(0, delayMs))
  }

  private async runDecision() {
    if (this.decisionInFlight || this.transcriptRevision <= this.lastRequestedTranscriptRevision)
      return

    const transcript = this.transcript.trim()
    if (!transcript)
      return

    const state = { ...this.options.getState() }
    const stateRevision = this.stateRevision
    const lifecycleRevision = this.lifecycleRevision
    const transcriptRevision = this.transcriptRevision
    this.lastRequestedTranscriptRevision = transcriptRevision
    this.decisionInFlight = true
    const startedAt = Date.now()
    this.debug('decision_started', {
      transcriptChars: transcript.length,
      transcriptRevision,
    })

    try {
      const decision = this.options.requestDecision
        ? await this.options.requestDecision(state, transcript)
        : await this.requestDecision(state, transcript)

      const liveState = this.options.getState()
      if (lifecycleRevision !== this.lifecycleRevision
        || stateRevision !== this.stateRevision
        || liveState.currentSlide !== state.currentSlide
        || liveState.totalSlides !== state.totalSlides) {
        this.debug('stale_decision_ignored', {
          tool: decision.tool,
          requestedSlide: state.currentSlide,
          currentSlide: liveState.currentSlide,
          decisionLatencyMs: Date.now() - startedAt,
        })
        this.flushDelegations(decision.tool, false)
        return
      }

      this.debug('model_decision', {
        tool: decision.tool,
        callId: decision.callId,
        decisionLatencyMs: Date.now() - startedAt,
        transcriptRevision,
      })
      await this.handleDecision(decision)
      this.lastDecisionTool = decision.tool
      this.flushDelegations(decision.tool, true)
    }
    catch (error) {
      this.debug('decision_failed', {
        message: error instanceof Error ? error.message : 'Slide decision failed',
        decisionLatencyMs: Date.now() - startedAt,
      })
    }
    finally {
      this.decisionInFlight = false
      if (this.transcriptRevision > this.lastRequestedTranscriptRevision)
        this.scheduleDecision(0)
    }
  }

  private async requestDecision(state: SlideDirectorState, transcript: string): Promise<SlideDecision> {
    const response = await fetch(LIVE_DECISION_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...state, transcript }),
    })
    const responseBody = await response.text()
    if (!response.ok)
      throw new Error(readHttpError(responseBody, response.status))

    let payload: { tool?: unknown, callId?: unknown }
    try {
      payload = JSON.parse(responseBody) as typeof payload
    }
    catch {
      throw new Error('Slide decision response was not valid JSON')
    }

    if (!isToolName(payload.tool))
      throw new Error('Slide decision response did not include a valid tool')

    return {
      tool: payload.tool,
      callId: typeof payload.callId === 'string' ? payload.callId : `decision-${Date.now()}`,
    }
  }

  private async handleDecision(decision: SlideDecision) {
    if (this.handledCallIds.has(decision.callId))
      return

    this.handledCallIds.add(decision.callId)
    const beforeState = { ...this.options.getState() }
    const startedAt = Date.now()
    this.debug('tool_started', {
      tool: decision.tool,
      callId: decision.callId,
      beforeSlide: beforeState.currentSlide,
    })

    if (decision.tool !== 'hold_slide')
      this.setStatus('acting', decision.tool === 'next_slide' ? 'Advancing…' : 'Going back…')

    try {
      await this.options.executeTool(decision.tool)
      const afterState = { ...this.options.getState() }
      this.updateSlideState(afterState)
      this.debug('tool_completed', {
        tool: decision.tool,
        callId: decision.callId,
        beforeSlide: beforeState.currentSlide,
        afterSlide: afterState.currentSlide,
        changed: beforeState.currentSlide !== afterState.currentSlide,
        durationMs: Date.now() - startedAt,
      })
      this.setStatus('listening', 'Listening. Click to stop')
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Slide tool failed'
      this.debug('tool_failed', {
        tool: decision.tool,
        callId: decision.callId,
        message,
        durationMs: Date.now() - startedAt,
      })
      this.setStatus('error', 'A slide command failed. Click to retry')
    }
  }

  private flushDelegations(tool: SlideDirectorToolName, applied: boolean) {
    for (const delegationId of this.pendingDelegationIds) {
      this.send({
        type: 'session.thinking.append',
        event_id: `slide_decision_${Date.now()}_${delegationId}`,
        delegation_id: delegationId,
        content: applied
          ? `The slide backend chose ${tool}; the application checked the current slide before applying it. Continue listening silently.`
          : 'The slide backend result was stale because the presentation state changed. Continue listening silently from the current slide.',
      })
    }
    this.pendingDelegationIds.clear()
  }

  private resetTranscript() {
    this.transcript = ''
    this.transcriptRevision = 0
    this.lastRequestedTranscriptRevision = 0
  }

  private clearDecisionTimer() {
    if (this.decisionTimer !== null)
      clearTimeout(this.decisionTimer)
    this.decisionTimer = null
  }

  private send(event: unknown) {
    if (this.dataChannel?.readyState === 'open')
      this.dataChannel.send(JSON.stringify(event))
  }

  private debug(type: string, details?: Record<string, unknown>, persist = true) {
    if (!this.options.debug)
      return

    const entry: SlideDirectorDebugEntry = {
      sessionId: this.debugSessionId,
      timestamp: new Date().toISOString(),
      elapsedMs: Date.now() - this.debugStartedAt,
      type,
      state: { ...this.state },
      ...(details ? { details } : {}),
    }
    this.options.onDebug?.(entry)

    if (!persist || typeof window === 'undefined')
      return

    void fetch(SLIDE_DIRECTOR_DEBUG_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(error => console.warn('Could not persist slide-director debug event', error))
  }

  private setStatus(status: SlideDirectorStatus, message: string) {
    this.options.onStatus?.(status, message)
  }
}
