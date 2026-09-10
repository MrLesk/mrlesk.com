import { describe, expect, test } from 'bun:test'
import {
  RealtimeSlideDirector,
  type SlideDecision,
  type SlideDirectorDebugEntry,
} from './realtime-slide-director-client'
import type { SlideDirectorToolName } from './slide-director'

interface TestableDirector {
  handleServerEvent: (raw: unknown) => void
  dataChannel: {
    readyState: string
    send: (raw: string) => void
    close: () => void
  } | null
}

function transcript(delta: string) {
  return JSON.stringify({
    type: 'session.input_transcript.delta',
    delta,
    start_ms: 100,
    end_ms: 300,
  })
}

describe('GPT-Live slide director client', () => {
  test('checks a partial transcript without waiting for a silence event', async () => {
    const calls: SlideDirectorToolName[] = []
    const requests: Array<{ slide: number, transcript: string }> = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 5,
      getState: () => state,
      async requestDecision(requestState, requestTranscript) {
        requests.push({ slide: requestState.currentSlide, transcript: requestTranscript })
        return { tool: 'next_slide', callId: 'partial-next' }
      },
      async executeTool(name) {
        calls.push(name)
        if (name === 'next_slide')
          state.currentSlide += 1
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(transcript('Welcome to Build Week in Vienna'))
    await Bun.sleep(20)

    expect(requests).toEqual([{ slide: 1, transcript: 'Welcome to Build Week in Vienna' }])
    expect(calls).toEqual(['next_slide'])
    expect(state.currentSlide).toBe(2)
    director.disconnect(false)
  })

  test('keeps listening and makes decisions on two consecutive slides', async () => {
    const calls: SlideDirectorToolName[] = []
    const requestSlides: number[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 5,
      getState: () => state,
      async requestDecision(requestState) {
        requestSlides.push(requestState.currentSlide)
        return { tool: 'next_slide', callId: `next-${requestState.currentSlide}` }
      },
      async executeTool(name) {
        calls.push(name)
        if (name === 'next_slide')
          state.currentSlide += 1
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(transcript('Welcome to Build Week in Vienna.'))
    await Bun.sleep(20)
    testable.handleServerEvent(transcript('Tonight we have updates and lightning talks.'))
    await Bun.sleep(20)

    expect(requestSlides).toEqual([1, 2])
    expect(calls).toEqual(['next_slide', 'next_slide'])
    expect(state.currentSlide).toBe(3)
    director.disconnect(false)
  })

  test('rechecks new fragments that arrive while Luna is busy', async () => {
    const requestedTranscripts: string[] = []
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 7, totalSlides: 14 }
    let resolveFirst: ((decision: SlideDecision) => void) | undefined
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 0,
      getState: () => state,
      requestDecision: async (_requestState, requestTranscript) => {
        requestedTranscripts.push(requestTranscript)
        if (requestedTranscripts.length === 1)
          return await new Promise(resolve => resolveFirst = resolve)
        return { tool: 'next_slide', callId: 'stream-next' }
      },
      async executeTool(name) {
        calls.push(name)
        if (name === 'next_slide')
          state.currentSlide += 1
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(transcript('GPT-five-point-six has three models'))
    await Bun.sleep(5)
    testable.handleServerEvent(transcript(': Sol, Terra, and Luna.'))
    resolveFirst?.({ tool: 'hold_slide', callId: 'stream-hold' })
    await Bun.sleep(20)

    expect(requestedTranscripts).toEqual([
      'GPT-five-point-six has three models',
      'GPT-five-point-six has three models: Sol, Terra, and Luna.',
    ])
    expect(calls).toEqual(['hold_slide', 'next_slide'])
    expect(state.currentSlide).toBe(8)
    director.disconnect(false)
  })

  test('ignores a late decision when the visible slide changed', async () => {
    const calls: SlideDirectorToolName[] = []
    const entries: SlideDirectorDebugEntry[] = []
    const state = { currentSlide: 3, totalSlides: 14 }
    let resolveDecision: ((decision: SlideDecision) => void) | undefined
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 0,
      debug: true,
      getState: () => state,
      requestDecision: () => new Promise(resolve => resolveDecision = resolve),
      async executeTool(name) {
        calls.push(name)
      },
      onDebug(entry) {
        entries.push(entry)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(transcript('Build Week is happening globally.'))
    await Bun.sleep(5)
    state.currentSlide = 4
    director.updateSlideState(state)
    resolveDecision?.({ tool: 'next_slide', callId: 'late-next' })
    await Bun.sleep(5)

    expect(calls).toEqual([])
    expect(entries.some(entry => entry.type === 'stale_decision_ignored')).toBe(true)
    director.disconnect(false)
  })

  test('a client delegation triggers the pending transcript check immediately', async () => {
    const requests: string[] = []
    const sent: unknown[] = []
    const state = { currentSlide: 5, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 1_000,
      getState: () => state,
      async requestDecision(_requestState, requestTranscript) {
        requests.push(requestTranscript)
        return { tool: 'hold_slide', callId: 'delegated-hold' }
      },
      async executeTool() {},
    })
    const testable = director as unknown as TestableDirector
    testable.dataChannel = {
      readyState: 'open',
      send(raw) {
        sent.push(JSON.parse(raw) as unknown)
      },
      close() {},
    }

    testable.handleServerEvent(transcript('The challenge has a one hundred thousand dollar prize'))
    testable.handleServerEvent(JSON.stringify({
      type: 'session.delegation.created',
      delegation: { id: 'delegation-1', target: 'Slide director' },
      offset_ms: 400,
    }))
    await Bun.sleep(20)

    expect(requests).toEqual(['The challenge has a one hundred thousand dollar prize'])
    expect(sent).toContainEqual(expect.objectContaining({
      type: 'session.thinking.append',
      delegation_id: 'delegation-1',
    }))
    director.disconnect(false)
  })

  test('does not create a pause-based slide action', async () => {
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      decisionIntervalMs: 5,
      getState: () => state,
      async requestDecision() {
        throw new Error('A transcript was not expected')
      },
      async executeTool(name) {
        calls.push(name)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    await Bun.sleep(20)

    expect(calls).toEqual([])
    director.disconnect(false)
  })
})
