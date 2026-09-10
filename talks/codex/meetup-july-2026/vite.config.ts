import { defineConfig, loadEnv } from 'vite'
import { slidevControlPlugin } from './scripts/slidev-control-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredServiceTier = process.env.OPENAI_SLIDE_DECISION_SERVICE_TIER
    ?? env.OPENAI_SLIDE_DECISION_SERVICE_TIER
  const decisionServiceTier = configuredServiceTier === 'priority' || configuredServiceTier === 'default'
    ? configuredServiceTier
    : undefined

  return {
    plugins: [slidevControlPlugin({
      apiKey: process.env.OPENAI_API_KEY ?? env.OPENAI_API_KEY,
      liveModel: process.env.OPENAI_LIVE_MODEL ?? env.OPENAI_LIVE_MODEL,
      decisionModel: process.env.OPENAI_SLIDE_DECISION_MODEL ?? env.OPENAI_SLIDE_DECISION_MODEL,
      decisionServiceTier,
    })],
  }
})
