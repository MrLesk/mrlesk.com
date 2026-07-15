import {
  REALTIME_SESSION_PATH,
  SLIDE_DIRECTOR_DEBUG_PATH,
  buildSlideDirectorInstructions,
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

interface RealtimeSlideDirectorOptions {
  getState: () => SlideDirectorState
  executeTool: (name: SlideDirectorToolName) => Promise<unknown>
  silenceAdvanceMs?: number | null
  debug?: boolean
  debugSessionId?: string
  onDebug?: (entry: SlideDirectorDebugEntry) => void
  onStatus?: (status: SlideDirectorStatus, message: string) => void
}

interface FunctionCallItem {
  type: 'function_call'
  name: string
  call_id: string
}

interface ResponseDoneEvent {
  type: 'response.done'
  response?: {
    output?: unknown[]
  }
}

interface ErrorEvent {
  type: 'error'
  error?: {
    message?: string
  }
}

interface SpeechEvent {
  type: 'input_audio_buffer.speech_started' | 'input_audio_buffer.speech_stopped'
}

interface TranscriptionEvent {
  type: 'conversation.item.input_audio_transcription.delta'
    | 'conversation.item.input_audio_transcription.completed'
    | 'conversation.item.input_audio_transcription.failed'
  item_id?: string
  delta?: string
  transcript?: string
  error?: {
    message?: string
  }
}

function isFunctionCallItem(value: unknown): value is FunctionCallItem {
  if (!value || typeof value !== 'object')
    return false

  const item = value as Partial<FunctionCallItem>
  return item.type === 'function_call'
    && typeof item.name === 'string'
    && typeof item.call_id === 'string'
}

function isToolName(value: string): value is SlideDirectorToolName {
  return value === 'next_slide' || value === 'previous_slide' || value === 'hold_slide'
}

function readHttpError(raw: string, status: number) {
  try {
    const payload = JSON.parse(raw) as { error?: unknown, detail?: unknown }
    const error = typeof payload.error === 'string' ? payload.error : `Realtime session failed (${status})`

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
    return raw || `Realtime session failed (${status})`
  }
}

export class RealtimeSlideDirector {
  private readonly options: RealtimeSlideDirectorOptions
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private mediaStream: MediaStream | null = null
  private handledCallIds = new Set<string>()
  private silenceTimer: ReturnType<typeof setTimeout> | null = null
  private lastSpeechStoppedAt: number | null = null
  private state: SlideDirectorState
  private readonly debugSessionId: string
  private readonly debugStartedAt = Date.now()

  constructor(options: RealtimeSlideDirectorOptions) {
    this.options = options
    this.state = { ...options.getState() }
    this.debugSessionId = options.debugSessionId ?? globalThis.crypto?.randomUUID?.() ?? `slide-debug-${Date.now()}`
  }

  async connect() {
    this.disconnect(false)
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
      dataChannel.addEventListener('open', () => {
        this.debug('session_open')
        this.setStatus('listening', 'Listening. Click to stop')
        this.updateSlideState(this.options.getState())
      })
      dataChannel.addEventListener('message', event => this.handleServerEvent(event.data))
      dataChannel.addEventListener('close', () => {
        this.debug('data_channel_closed')
        if (this.peerConnection)
          this.setStatus('off', 'Auto slides are off')
      })

      peerConnection.addEventListener('connectionstatechange', () => {
        this.debug('connection_state_changed', { connectionState: peerConnection.connectionState })
        if (peerConnection.connectionState === 'failed')
          this.setStatus('error', 'Realtime connection failed. Click to retry')
      })

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      this.state = { ...this.options.getState() }
      const url = new URL(REALTIME_SESSION_PATH, window.location.origin)
      url.searchParams.set('currentSlide', String(this.state.currentSlide))
      url.searchParams.set('totalSlides', String(this.state.totalSlides))
      if (this.options.debug)
        url.searchParams.set('debug', '1')

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: peerConnection.localDescription?.sdp ?? offer.sdp,
      })

      if (!response.ok) {
        const detail = await response.text()
        throw new Error(readHttpError(detail, response.status))
      }

      await peerConnection.setRemoteDescription({
        type: 'answer',
        sdp: await response.text(),
      })
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
    if (this.peerConnection || this.dataChannel || this.mediaStream)
      this.debug('session_disconnected', { notify })
    this.dataChannel?.close()
    this.peerConnection?.close()
    this.mediaStream?.getTracks().forEach(track => track.stop())
    this.dataChannel = null
    this.peerConnection = null
    this.mediaStream = null
    this.handledCallIds.clear()
    this.clearSilenceAdvance()
    this.lastSpeechStoppedAt = null

    if (notify)
      this.setStatus('off', 'Auto slides are off')
  }

  updateSlideState(state: SlideDirectorState) {
    const previousState = this.state
    if (state.currentSlide !== this.state.currentSlide) {
      this.clearSilenceAdvance()
      this.lastSpeechStoppedAt = null
    }

    this.state = { ...state }
    if (state.currentSlide !== previousState.currentSlide || state.totalSlides !== previousState.totalSlides) {
      this.debug('slide_state_updated', {
        previousSlide: previousState.currentSlide,
        currentSlide: state.currentSlide,
      })
    }
    this.send({
      type: 'session.update',
      session: {
        type: 'realtime',
        instructions: buildSlideDirectorInstructions(state),
      },
    })
  }

  private handleServerEvent(raw: unknown) {
    if (typeof raw !== 'string')
      return

    let event: ResponseDoneEvent | ErrorEvent | SpeechEvent | TranscriptionEvent | { type?: string }
    try {
      event = JSON.parse(raw) as ResponseDoneEvent | ErrorEvent | SpeechEvent | TranscriptionEvent | { type?: string }
    }
    catch {
      this.debug('invalid_server_event', { raw: raw.slice(0, 500) })
      return
    }

    if (event.type === 'error') {
      const error = event as ErrorEvent
      this.debug('realtime_error', { message: error.error?.message ?? 'Unknown Realtime error' })
      this.clearSilenceAdvance()
      this.setStatus('error', error.error?.message ?? 'OpenAI Realtime returned an error')
      return
    }

    if (event.type === 'input_audio_buffer.speech_started') {
      this.debug('speech_started')
      this.clearSilenceAdvance()
      this.lastSpeechStoppedAt = null
      return
    }

    if (event.type === 'input_audio_buffer.speech_stopped') {
      this.lastSpeechStoppedAt = Date.now()
      this.debug('speech_stopped')
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.delta') {
      const transcription = event as TranscriptionEvent
      this.debug('transcription_delta', {
        itemId: transcription.item_id,
        delta: transcription.delta ?? '',
      }, false)
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const transcription = event as TranscriptionEvent
      this.debug('transcription_completed', {
        itemId: transcription.item_id,
        transcript: transcription.transcript ?? '',
      })
      return
    }

    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      const transcription = event as TranscriptionEvent
      this.debug('transcription_failed', {
        itemId: transcription.item_id,
        message: transcription.error?.message ?? 'Input transcription failed',
      })
      return
    }

    if (event.type !== 'response.done')
      return

    const response = event as ResponseDoneEvent
    const calls = (response.response?.output ?? []).filter(isFunctionCallItem)
    if (calls.length > 0) {
      this.debug('model_decision', {
        tools: calls.map(call => ({ name: call.name, callId: call.call_id })),
        decisionLatencyMs: this.lastSpeechStoppedAt === null ? null : Date.now() - this.lastSpeechStoppedAt,
      })
    }
    else {
      this.debug('model_continuation_completed')
    }
    for (const call of calls)
      void this.handleFunctionCall(call)
  }

  private async handleFunctionCall(call: FunctionCallItem) {
    if (this.handledCallIds.has(call.call_id))
      return

    this.handledCallIds.add(call.call_id)
    const beforeState = { ...this.options.getState() }
    const startedAt = Date.now()
    this.debug('tool_started', {
      tool: call.name,
      callId: call.call_id,
      beforeSlide: beforeState.currentSlide,
    })

    if (!isToolName(call.name)) {
      this.sendToolOutput(call.call_id, {
        ok: false,
        error: `Unknown slide tool: ${call.name}`,
        state: this.options.getState(),
      })
      this.debug('tool_failed', {
        tool: call.name,
        callId: call.call_id,
        message: `Unknown slide tool: ${call.name}`,
      })
      return
    }

    if (call.name !== 'hold_slide')
      this.setStatus('acting', call.name === 'next_slide' ? 'Advancing…' : 'Going back…')
    else
      this.clearSilenceAdvance()

    try {
      const result = await this.options.executeTool(call.name)
      const afterState = { ...this.options.getState() }
      this.updateSlideState(afterState)
      this.sendToolOutput(call.call_id, result)
      this.debug('tool_completed', {
        tool: call.name,
        callId: call.call_id,
        beforeSlide: beforeState.currentSlide,
        afterSlide: afterState.currentSlide,
        changed: beforeState.currentSlide !== afterState.currentSlide,
        durationMs: Date.now() - startedAt,
      })
      this.setStatus('listening', 'Listening. Click to stop')

      if (call.name === 'hold_slide')
        this.scheduleSilenceAdvance()
      else
        this.lastSpeechStoppedAt = null
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Slide tool failed'
      this.sendToolOutput(call.call_id, {
        ok: false,
        error: message,
        state: this.options.getState(),
      })
      this.debug('tool_failed', {
        tool: call.name,
        callId: call.call_id,
        message,
        durationMs: Date.now() - startedAt,
      })
      this.clearSilenceAdvance()
      this.setStatus('error', 'A slide command failed. Click to retry')
    }
  }

  private scheduleSilenceAdvance() {
    const silenceAdvanceMs = this.options.silenceAdvanceMs
    if (!silenceAdvanceMs || silenceAdvanceMs <= 0 || this.lastSpeechStoppedAt === null)
      return

    const state = this.options.getState()
    // The closing and final-credit slides have intentional dwell time. Their
    // explicit prompt rules should control navigation without a pause fallback.
    if (state.currentSlide >= state.totalSlides - 1)
      return

    const expectedSlide = state.currentSlide
    const elapsed = Date.now() - this.lastSpeechStoppedAt
    const delay = Math.max(0, silenceAdvanceMs - elapsed)
    this.clearSilenceAdvance()
    this.silenceTimer = setTimeout(() => {
      this.silenceTimer = null
      if (this.lastSpeechStoppedAt === null || this.options.getState().currentSlide !== expectedSlide)
        return

      this.lastSpeechStoppedAt = null
      void this.advanceAfterSilence()
    }, delay)
  }

  private async advanceAfterSilence() {
    const beforeState = { ...this.options.getState() }
    const startedAt = Date.now()
    this.debug('silence_advance_started', { beforeSlide: beforeState.currentSlide })
    this.setStatus('acting', 'Pause detected, advancing…')

    try {
      await this.options.executeTool('next_slide')
      const afterState = { ...this.options.getState() }
      this.updateSlideState(afterState)
      this.debug('silence_advance_completed', {
        beforeSlide: beforeState.currentSlide,
        afterSlide: afterState.currentSlide,
        durationMs: Date.now() - startedAt,
      })
      this.setStatus('listening', 'Listening. Click to stop')
    }
    catch (error) {
      this.debug('silence_advance_failed', {
        message: error instanceof Error ? error.message : 'Pause-based slide command failed',
        durationMs: Date.now() - startedAt,
      })
      this.setStatus('error', 'Pause-based slide command failed. Click to retry')
    }
  }

  private clearSilenceAdvance() {
    if (this.silenceTimer !== null)
      clearTimeout(this.silenceTimer)
    this.silenceTimer = null
  }

  private sendToolOutput(callId: string, output: unknown) {
    this.send({
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(output),
      },
    })
    // A Realtime function-call turn is not complete after function_call_output
    // alone. Trigger a short, text-only continuation with tools disabled so
    // the session is ready for the next VAD-created presenter turn without
    // recursively calling another slide tool.
    this.send({
      type: 'response.create',
      response: {
        instructions: 'Acknowledge the completed slide action with exactly OK. Do not call a tool.',
        tool_choice: 'none',
        max_output_tokens: 4,
      },
    })
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
      state: {
        currentSlide: this.state.currentSlide,
        totalSlides: this.state.totalSlides,
      },
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
