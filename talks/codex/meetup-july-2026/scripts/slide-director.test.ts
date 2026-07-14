import { describe, expect, test } from 'bun:test'
import {
  BALANCED_REALTIME_MODEL,
  DEFAULT_REALTIME_MODEL,
  SLIDE_DIRECTOR_TOOLS,
  buildRealtimeSession,
  buildSlideDirectorInstructions,
} from './slide-director'

describe('slide director prompt', () => {
  test('includes live slide state and the full deck map', () => {
    const prompt = buildSlideDirectorInstructions({ currentSlide: 7, totalSlides: 14 })

    expect(prompt).toContain('Current slide: 7')
    expect(prompt).toContain('Total slides: 14')
    expect(prompt).toContain('Slide 1: OpenAI Build Week Vienna')
    expect(prompt).toContain('Slide 14: €100 in Codex credits')
    expect(prompt).toContain('never call next_slide')
    expect(prompt).toContain('Call previous_slide if the presenter clearly returns')
  })

  test('requires a silent tool decision for every turn', () => {
    const session = buildRealtimeSession({ currentSlide: 1, totalSlides: 14 })

    expect(session.model).toBe(DEFAULT_REALTIME_MODEL)
    expect(session.output_modalities).toEqual(['text'])
    expect(session.tool_choice).toBe('required')
    expect(session.audio.input.turn_detection).toMatchObject({
      type: 'server_vad',
      silence_duration_ms: 350,
      create_response: true,
    })
    expect('reasoning' in session).toBe(false)
    expect(SLIDE_DIRECTOR_TOOLS.map(tool => tool.name)).toEqual([
      'next_slide',
      'previous_slide',
      'hold_slide',
    ])
  })

  test('keeps the reasoning model and semantic VAD as balanced mode', () => {
    const session = buildRealtimeSession(
      { currentSlide: 1, totalSlides: 14 },
      { mode: 'balanced' },
    )

    expect(session.model).toBe(BALANCED_REALTIME_MODEL)
    expect(session.reasoning).toEqual({ effort: 'low' })
    expect(session.audio.input.turn_detection).toMatchObject({
      type: 'semantic_vad',
      eagerness: 'high',
    })
  })
})
