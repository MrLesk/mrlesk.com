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
    expect(prompt).toContain('All presenter speech is English')
    expect(prompt).not.toContain('German presenter speech')
    expect(prompt).toContain("current slide's main idea has been sufficiently conveyed")
    expect(prompt).toContain('completed-topic rule takes priority')
    expect(prompt).toContain("All right, welcome everyone to OpenAI's Build Week meetup")
    expect(prompt).toContain('Silence or a pause by itself is never enough')
    expect(prompt).toContain('meetup logistics')
    expect(prompt).toContain('If the next slide is the better semantic match')
    expect(prompt).toContain('A sentence, short phrase, or spoken slide title can be enough')
    expect(prompt).toContain('Title-only slides and section dividers are intentional visual beats')
    expect(prompt).not.toContain('Visual cue:')
    expect(prompt).toContain('Current Slide 5 -> "A lot shipped recently." -> next_slide')
    expect(prompt).toContain('Current Slide 6 -> "GPT-five-point-six comes in Sol, Terra, and Luna." -> next_slide')
    expect(prompt).toContain('There were two apps before: the ChatGPT desktop app and Codex')
    expect(prompt).toContain('Minimum completion threshold: mentioning the $100,000 prize')
    expect(prompt).toContain('Do not require eligibility, every detail, or a spoken QR reference')
    expect(prompt).toContain('mentioning GA plus any one concrete use')
    expect(prompt).toContain('Do not require all examples')
    expect(prompt).not.toContain('Likely narration:')
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
      interrupt_response: true,
    })
    expect(session.reasoning).toEqual({ effort: 'low' })
    expect(SLIDE_DIRECTOR_TOOLS.map(tool => tool.name)).toEqual([
      'next_slide',
      'previous_slide',
      'hold_slide',
    ])
    expect(SLIDE_DIRECTOR_TOOLS.find(tool => tool.name === 'next_slide')?.description)
      .toContain('has sufficiently covered the current slide')
    expect(SLIDE_DIRECTOR_TOOLS.find(tool => tool.name === 'hold_slide')?.description)
      .toContain('topic is still incomplete')
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
      interrupt_response: true,
    })
  })

  test('enables English input transcription only for debug sessions', () => {
    const regular = buildRealtimeSession({ currentSlide: 1, totalSlides: 14 })
    const debug = buildRealtimeSession(
      { currentSlide: 4, totalSlides: 14 },
      { debug: true },
    )

    expect(regular.audio.input).not.toHaveProperty('transcription')
    expect(debug.audio.input.transcription).toEqual({
      model: 'gpt-4o-mini-transcribe',
      language: 'en',
    })
  })
})
