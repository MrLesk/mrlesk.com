import {
  REALTIME_SESSION_PATH,
  buildSlideDirectorInstructions,
  type SlideDirectorState,
  type SlideDirectorToolName,
} from './slide-director'

export type SlideDirectorStatus = 'off' | 'connecting' | 'listening' | 'acting' | 'error'

interface RealtimeSlideDirectorOptions {
  getState: () => SlideDirectorState
  executeTool: (name: SlideDirectorToolName) => Promise<unknown>
  silenceAdvanceMs?: number | null
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

  constructor(options: RealtimeSlideDirectorOptions) {
    this.options = options
    this.state = options.getState()
  }

  async connect() {
    this.disconnect(false)
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
        this.setStatus('listening', 'Listening. Click to stop')
        this.updateSlideState(this.options.getState())
      })
      dataChannel.addEventListener('message', event => this.handleServerEvent(event.data))
      dataChannel.addEventListener('close', () => {
        if (this.peerConnection)
          this.setStatus('off', 'Auto slides are off')
      })

      peerConnection.addEventListener('connectionstatechange', () => {
        if (peerConnection.connectionState === 'failed')
          this.setStatus('error', 'Realtime connection failed. Click to retry')
      })

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      this.state = this.options.getState()
      const url = new URL(REALTIME_SESSION_PATH, window.location.origin)
      url.searchParams.set('currentSlide', String(this.state.currentSlide))
      url.searchParams.set('totalSlides', String(this.state.totalSlides))

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
      this.disconnect(false)
      this.setStatus('error', message)
      throw error
    }
  }

  disconnect(notify = true) {
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
    if (state.currentSlide !== this.state.currentSlide) {
      this.clearSilenceAdvance()
      this.lastSpeechStoppedAt = null
    }

    this.state = state
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

    let event: ResponseDoneEvent | ErrorEvent | SpeechEvent | { type?: string }
    try {
      event = JSON.parse(raw) as ResponseDoneEvent | ErrorEvent | SpeechEvent | { type?: string }
    }
    catch {
      return
    }

    if (event.type === 'error') {
      const error = event as ErrorEvent
      this.clearSilenceAdvance()
      this.setStatus('error', error.error?.message ?? 'OpenAI Realtime returned an error')
      return
    }

    if (event.type === 'input_audio_buffer.speech_started') {
      this.clearSilenceAdvance()
      this.lastSpeechStoppedAt = null
      return
    }

    if (event.type === 'input_audio_buffer.speech_stopped') {
      this.lastSpeechStoppedAt = Date.now()
      return
    }

    if (event.type !== 'response.done')
      return

    const response = event as ResponseDoneEvent
    const calls = (response.response?.output ?? []).filter(isFunctionCallItem)
    for (const call of calls)
      void this.handleFunctionCall(call)
  }

  private async handleFunctionCall(call: FunctionCallItem) {
    if (this.handledCallIds.has(call.call_id))
      return

    this.handledCallIds.add(call.call_id)

    if (!isToolName(call.name)) {
      this.sendToolOutput(call.call_id, {
        ok: false,
        error: `Unknown slide tool: ${call.name}`,
        state: this.options.getState(),
      })
      return
    }

    if (call.name !== 'hold_slide')
      this.setStatus('acting', call.name === 'next_slide' ? 'Advancing…' : 'Going back…')
    else
      this.clearSilenceAdvance()

    try {
      const result = await this.options.executeTool(call.name)
      this.sendToolOutput(call.call_id, result)
      this.setStatus('listening', 'Listening. Click to stop')

      if (call.name === 'hold_slide')
        this.scheduleSilenceAdvance()
      else
        this.lastSpeechStoppedAt = null
    }
    catch (error) {
      this.sendToolOutput(call.call_id, {
        ok: false,
        error: error instanceof Error ? error.message : 'Slide tool failed',
        state: this.options.getState(),
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
    this.setStatus('acting', 'Pause detected, advancing…')

    try {
      await this.options.executeTool('next_slide')
      this.setStatus('listening', 'Listening. Click to stop')
    }
    catch {
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
  }

  private send(event: unknown) {
    if (this.dataChannel?.readyState === 'open')
      this.dataChannel.send(JSON.stringify(event))
  }

  private setStatus(status: SlideDirectorStatus, message: string) {
    this.options.onStatus?.(status, message)
  }
}
