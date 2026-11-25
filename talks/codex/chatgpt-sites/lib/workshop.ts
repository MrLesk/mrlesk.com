// Texts and numbers of the workshop part of the deck (slide 1 and slides 9 to 16).
// Change a value here and every slide that shows it follows.

/**
 * Where the published deck lives. The QR codes are made from it.
 * A slide's number or its `routeAlias` after it opens that slide.
 */
export const DECK_URL = 'https://mrlesk.com/talks/codex/chatgpt-sites/'

/** The same address as people read it out or type it: no "https://", no slash at the end. */
export const DECK_ADDRESS = DECK_URL.replace('https://', '').replace(/\/$/, '')

/**
 * Where the slide with the prompt to copy lives, after DECK_URL. The QR code on "Pick a starter"
 * leads here. It is the `routeAlias` in pages/12-your-prompt.md, so it keeps working when the
 * slides move. Change both together.
 */
export const PROMPT_SLIDE_ALIAS = 'your-prompt'

/**
 * The three stations every participant passes. `minutes` is the time the room spends at a
 * station: it is the sum of that station's slides in the storyboard's clock.
 */
export const STATIONS = [
  { name: 'Page', what: 'A prompt, then a preview', minutes: 4 },
  { name: 'Action', what: 'Make it work', minutes: 8 },
  { name: 'Neighbor', what: 'Publish, then a real try', minutes: 7 },
]

/** The three parts of the prompt that each participant fills in. */
export type PromptParts = { who: string, visitorsCan: string, andSee: string }

/**
 * The prompt everyone sends, in pieces. A piece is fixed text, or the name of the open part
 * that goes there. The slide draws it from this list, and `promptFor` makes the text to copy
 * from it, so the two cannot drift apart.
 */
export const PROMPT_SENTENCE: readonly (string | { part: keyof PromptParts })[] = [
  'Build a one-page site for ',
  { part: 'who' },
  '. Visitors can ',
  { part: 'visitorsCan' },
  ' and see ',
  { part: 'andSee' },
  '. Start with example data. Mobile friendly.',
]

/** What the open parts say before anyone fills them in. */
export const OPEN_PROMPT_PARTS: PromptParts = {
  who: '[who]',
  visitorsCan: '[one action]',
  andSee: '[result]',
}

/**
 * The three ready-made ideas. Each one fills the open parts of the prompt.
 * `action` is the one working action of the page, in a word or two.
 */
export const STARTERS: readonly (PromptParts & { name: string, action: string })[] = [
  {
    name: 'Club finder',
    action: 'search',
    who: 'new students in Vienna',
    visitorsCan: 'type an interest',
    andSee: 'matching clubs',
  },
  {
    name: 'Volunteer signup',
    action: 'sign up',
    who: 'neighbors at a clean-up day',
    visitorsCan: 'sign up for a time slot',
    andSee: 'how many spots are left',
  },
  {
    name: 'Calculator',
    action: 'calculate',
    who: 'friends who share a bill',
    visitorsCan: 'enter the total and the tip',
    andSee: 'what each person pays',
  },
]

/** The whole prompt as text, with the given words in its open parts. */
export function promptFor(parts: PromptParts): string {
  const sentence = PROMPT_SENTENCE.map(piece => (typeof piece === 'string' ? piece : parts[piece.part])).join('')
  return `@Sites ${sentence}`
}
