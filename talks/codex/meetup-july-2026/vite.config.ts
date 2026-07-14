import { defineConfig, loadEnv } from 'vite'
import { slidevControlPlugin } from './scripts/slidev-control-plugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredMode = process.env.SLIDE_DIRECTOR_MODE ?? env.SLIDE_DIRECTOR_MODE
  const directorMode = configuredMode === 'balanced' ? 'balanced' : 'fast'

  return {
    plugins: [slidevControlPlugin({
      apiKey: process.env.OPENAI_API_KEY ?? env.OPENAI_API_KEY,
      model: process.env.OPENAI_REALTIME_MODEL ?? env.OPENAI_REALTIME_MODEL,
      mode: directorMode,
      vadEagerness: 'high',
    })],
  }
})
