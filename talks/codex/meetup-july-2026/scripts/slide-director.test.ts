import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_DECISION_MODEL,
  DEFAULT_LIVE_MODEL,
  SLIDE_DIRECTOR_TOOLS,
  buildLiveFrontendInstructions,
  buildLiveSession,
  buildSlideDecisionRequest,
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
    expect(prompt).toContain("current slide's main idea has been sufficiently conveyed")
    expect(prompt).toContain('completed-topic rule takes priority')
    expect(prompt).toContain("All right, welcome everyone to OpenAI's Build Week meetup")
    expect(prompt).toContain('Never infer silence from a transcript ending')
    expect(prompt).toContain('meetup logistics')
    expect(prompt).toContain('If the next slide is the better semantic match')
    expect(prompt).toContain('A partial sentence can be enough')
    expect(prompt).toContain('Title-only slides and section dividers are intentional visual beats')
    expect(prompt).toContain('Current Slide 5 -> "A lot shipped recently." -> next_slide')
    expect(prompt).toContain('There were two apps before: the ChatGPT desktop app and Codex')
    expect(prompt).toContain('Minimum completion threshold: mentioning the $100,000 prize')
  })

  test('configures GPT-Live as a silent client-delegation front end', () => {
    const session = buildLiveSession({ currentSlide: 4, totalSlides: 14 })
    const instructions = buildLiveFrontendInstructions({ currentSlide: 4, totalSlides: 14 })

    expect(session).toEqual({
      model: DEFAULT_LIVE_MODEL,
      instructions,
      delegation: { type: 'client' },
    })
    expect(instructions).toContain('Never speak')
    expect(instructions).toContain('Current slide: 4 of 14')
    expect(instructions).toContain('Do not wait for silence')
    expect(instructions).toContain('including while the presenter is still speaking')
  })

  test('forces one Luna tool decision for each transcript checkpoint', () => {
    const request = buildSlideDecisionRequest(
      { currentSlide: 6, totalSlides: 14 },
      'GPT-five-point-six comes in Sol, Terra, and Luna.',
    )

    expect(request.model).toBe(DEFAULT_DECISION_MODEL)
    expect(request.tool_choice).toBe('required')
    expect(request.parallel_tool_calls).toBe(false)
    expect(request.reasoning).toEqual({ effort: 'low' })
    expect(request.input[0].content[0].text).toContain('Transcript since slide 6 became visible')
    expect(request.input[0].content[0].text).toContain('Sol, Terra, and Luna')
    expect(SLIDE_DIRECTOR_TOOLS.map(tool => tool.name)).toEqual([
      'next_slide',
      'previous_slide',
      'hold_slide',
    ])
    expect(request).not.toHaveProperty('service_tier')
  })

  test('supports explicit model and service-tier overrides', () => {
    const session = buildLiveSession(
      { currentSlide: 1, totalSlides: 14 },
      { liveModel: 'custom-live' },
    )
    const request = buildSlideDecisionRequest(
      { currentSlide: 1, totalSlides: 14 },
      'Welcome everyone.',
      { decisionModel: 'custom-decision', decisionServiceTier: 'priority' },
    )

    expect(session.model).toBe('custom-live')
    expect(request.model).toBe('custom-decision')
    expect(request.service_tier).toBe('priority')
  })
})
