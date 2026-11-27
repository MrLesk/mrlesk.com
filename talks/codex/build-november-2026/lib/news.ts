// The words and pictures on "News from OpenAI" and "New API goodies to try".
// Facts and sources are in the speaker notes of pages/02-news.md and pages/03-api.md.
//
// OpenAI only allows its own pictures for its products, so every picture comes from ./openai:
// the square model icons from developers.openai.com, the wide pictures from OpenAI's DevDay 2026
// recap deck for community events. News without an official picture shows one of the two small
// text animations of MiniScene.vue instead. Never draw a picture or logo of your own here.
import agentsApi from '../openai/agents-api.jpg'
import chatgptSpace from '../openai/chatgpt-space.jpg'
import decisionsApi from '../openai/decisions-api.jpg'
import dots from '../openai/dots.jpg'
import gpt62Astra from '../openai/gpt-6.2-astra.png'
import gpt62Sol from '../openai/gpt-6.2-sol.png'
import imageFlare from '../openai/gpt-image-2.6-flare.png'
import imageSunburst from '../openai/gpt-image-2.6-sunburst.png'
import gptLive from '../openai/gpt-live-1.1.png'

export type SceneName = 'merge' | 'windows'

export interface NewsItem {
  title: string
  /** One short line under the title. */
  note: string
  /** Official pictures. A wide picture fills its space; square icons stand side by side. */
  pictures?: string[]
  /** A small text animation from MiniScene.vue, for news without an official picture. */
  scene?: SceneName
}

export const NEWS: NewsItem[] = [
  { pictures: [gpt62Astra, gpt62Sol], title: 'GPT-6.2', note: 'Astra and Sol' },
  { pictures: [dots], title: 'dots', note: 'Coming soon to the EU, for Plus and Pro' },
  { pictures: [chatgptSpace], title: 'ChatGPT Space', note: 'Rolling out to Plus' },
  { scene: 'merge', title: 'Chat + Work', note: 'Merging into one' },
]

export const API_NEWS: NewsItem[] = [
  // The hyphens in the model IDs are non-breaking, so an ID never wraps in the middle.
  { pictures: [gpt62Astra, gpt62Sol], title: 'GPT-6.2 Astra and Sol', note: 'gpt‑6.2‑astra\ngpt‑6.2‑sol' },
  { scene: 'windows', title: 'Background windows', note: 'Responses API: pay less when you can wait' },
  { pictures: [imageSunburst, imageFlare], title: 'GPT-Image-2.6', note: 'Sunburst and Flare' },
  { pictures: [decisionsApi], title: 'Decisions API', note: 'Typed answers, about 10x faster' },
  { pictures: [gptLive], title: 'GPT-Live-1.1', note: 'Plus outbound phone calls' },
  { pictures: [agentsApi], title: 'Agents API', note: 'A browser hosted by OpenAI' },
]
