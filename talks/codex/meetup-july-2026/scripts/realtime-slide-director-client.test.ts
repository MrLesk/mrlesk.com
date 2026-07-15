import { describe, expect, test } from 'bun:test'
import {
  RealtimeSlideDirector,
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

function toolResponse(name: SlideDirectorToolName, callId: string) {
  return JSON.stringify({
    type: 'response.done',
    response: {
      output: [{
        type: 'function_call',
        name,
        call_id: callId,
      }],
    },
  })
}

function holdResponse(callId: string) {
  return toolResponse('hold_slide', callId)
}

describe('realtime slide director silence fallback', () => {
  test('reports transcripts, the model decision, and slide result in debug mode', async () => {
    const entries: SlideDirectorDebugEntry[] = []
    const state = { currentSlide: 2, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      debug: true,
      debugSessionId: 'test-session',
      getState: () => state,
      async executeTool(name) {
        if (name === 'next_slide')
          state.currentSlide += 1
      },
      onDebug(entry) {
        entries.push(entry)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({
      type: 'conversation.item.input_audio_transcription.completed',
      item_id: 'audio-1',
      transcript: 'Tonight we have Codex updates, lightning talks, and networking.',
    }))
    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    testable.handleServerEvent(toolResponse('next_slide', 'debug-next'))
    await Bun.sleep(5)

    expect(entries.find(entry => entry.type === 'transcription_completed')?.details?.transcript)
      .toBe('Tonight we have Codex updates, lightning talks, and networking.')
    expect(entries.find(entry => entry.type === 'model_decision')?.details?.tools)
      .toEqual([{ name: 'next_slide', callId: 'debug-next' }])
    expect(entries.find(entry => entry.type === 'tool_completed')?.details)
      .toMatchObject({ tool: 'next_slide', beforeSlide: 2, afterSlide: 3, changed: true })
    director.disconnect(false)
  })

  test('completes each tool cycle and handles a second slide action', async () => {
    const calls: SlideDirectorToolName[] = []
    const sent: unknown[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      getState: () => state,
      async executeTool(name) {
        calls.push(name)
        if (name === 'next_slide')
          state.currentSlide += 1
      },
    })
    const testable = director as unknown as TestableDirector
    testable.dataChannel = {
      readyState: 'open',
      send(raw) {
        sent.push(JSON.parse(raw) as unknown)
      },
      close() {},
    }

    testable.handleServerEvent(toolResponse('next_slide', 'next-1'))
    await Bun.sleep(5)
    testable.handleServerEvent(toolResponse('next_slide', 'next-2'))
    await Bun.sleep(5)

    expect(calls).toEqual(['next_slide', 'next_slide'])
    expect(state.currentSlide).toBe(3)
    expect(sent.filter(event => (event as { type?: string }).type === 'conversation.item.create')).toHaveLength(2)
    const continuations = sent.filter(event => (event as { type?: string }).type === 'response.create') as Array<{
      response?: { tool_choice?: string }
    }>
    expect(continuations).toHaveLength(2)
    expect(continuations.every(event => event.response?.tool_choice === 'none')).toBe(true)
    expect(JSON.stringify(sent)).toContain('Current slide: 3')
    director.disconnect(false)
  })

  test('does not advance after silence when the model holds by default', async () => {
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      getState: () => state,
      async executeTool(name) {
        calls.push(name)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    testable.handleServerEvent(holdResponse('hold-default'))
    await Bun.sleep(40)

    expect(calls).toEqual(['hold_slide'])
    expect(state.currentSlide).toBe(1)
    director.disconnect(false)
  })


  test('advances once after speech ends and the model holds', async () => {
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      getState: () => state,
      silenceAdvanceMs: 20,
      async executeTool(name) {
        calls.push(name)
        if (name === 'next_slide')
          state.currentSlide += 1
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    testable.handleServerEvent(holdResponse('hold-1'))
    await Bun.sleep(40)

    expect(calls).toEqual(['hold_slide', 'next_slide'])
    expect(state.currentSlide).toBe(2)
    director.disconnect(false)
  })

  test('cancels the pending advance when speech resumes', async () => {
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 1, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      getState: () => state,
      silenceAdvanceMs: 30,
      async executeTool(name) {
        calls.push(name)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    testable.handleServerEvent(holdResponse('hold-2'))
    await Bun.sleep(5)
    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_started' }))
    await Bun.sleep(40)

    expect(calls).toEqual(['hold_slide'])
    director.disconnect(false)
  })

  test('does not pause-advance the closing or final slide', async () => {
    const calls: SlideDirectorToolName[] = []
    const state = { currentSlide: 13, totalSlides: 14 }
    const director = new RealtimeSlideDirector({
      getState: () => state,
      silenceAdvanceMs: 20,
      async executeTool(name) {
        calls.push(name)
      },
    })
    const testable = director as unknown as TestableDirector

    testable.handleServerEvent(JSON.stringify({ type: 'input_audio_buffer.speech_stopped' }))
    testable.handleServerEvent(holdResponse('hold-closing'))
    await Bun.sleep(40)

    expect(calls).toEqual(['hold_slide'])
    expect(state.currentSlide).toBe(13)
    director.disconnect(false)
  })
})
