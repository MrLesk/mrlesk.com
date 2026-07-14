import { describe, expect, test } from 'bun:test'
import { RealtimeSlideDirector } from './realtime-slide-director-client'
import type { SlideDirectorToolName } from './slide-director'

interface TestableDirector {
  handleServerEvent: (raw: unknown) => void
}

function holdResponse(callId: string) {
  return JSON.stringify({
    type: 'response.done',
    response: {
      output: [{
        type: 'function_call',
        name: 'hold_slide',
        call_id: callId,
      }],
    },
  })
}

describe('realtime slide director silence fallback', () => {
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
