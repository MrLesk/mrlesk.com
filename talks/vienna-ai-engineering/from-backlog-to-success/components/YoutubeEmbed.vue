<template>
  <div class="youtube-embed">
    <iframe
      v-if="embedSrc"
      :src="embedSrc"
      :title="title"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    />
    <div v-else class="youtube-embed__error">
      Unable to load video. Please check the URL.
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'YouTube video player',
  },
})

const embedSrc = computed(() => buildEmbedUrl(props.url))

function buildEmbedUrl(rawUrl) {
  if (!rawUrl) return null

  const trimmed = rawUrl.trim()
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let parsed
  try {
    parsed = new URL(normalized)
  } catch (error) {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, '')
  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  const searchParams = parsed.searchParams

  const startParam = searchParams.get('start') || searchParams.get('t') || parsed.hash.replace('#t=', '')
  const startSeconds = parseStartTime(startParam)
  const playlist = searchParams.get('list')
  const loop = searchParams.get('loop')

  const videoId = extractVideoId({ host, pathSegments, searchParams })
  if (!videoId) return null

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`)
  embedUrl.searchParams.set('autoplay', '0')
  embedUrl.searchParams.set('rel', '0')
  embedUrl.searchParams.set('playsinline', '1')
  embedUrl.searchParams.set('controls', '0')
  embedUrl.searchParams.set('modestbranding', '1')
  embedUrl.searchParams.set('fs', '0')
  embedUrl.searchParams.set('disablekb', '1')
  embedUrl.searchParams.set('iv_load_policy', '3')

  if (startSeconds > 0) {
    embedUrl.searchParams.set('start', String(startSeconds))
  }

  if (playlist) {
    embedUrl.searchParams.set('list', playlist)
  }

  if (loop === '1') {
    embedUrl.searchParams.set('loop', '1')
    embedUrl.searchParams.set('playlist', videoId)
  }

  return embedUrl.toString()
}

function extractVideoId({ host, pathSegments, searchParams }) {
  if (!host) return null

  if (host === 'youtu.be' && pathSegments.length > 0) {
    return sanitizeId(pathSegments[0])
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (pathSegments[0] === 'watch') {
      return sanitizeId(searchParams.get('v'))
    }

    if (pathSegments[0] === 'embed' && pathSegments[1]) {
      return sanitizeId(pathSegments[1])
    }

    if (pathSegments[0] === 'shorts' && pathSegments[1]) {
      return sanitizeId(pathSegments[1])
    }
  }

  if (host === 'youtube-nocookie.com' && pathSegments[0] === 'embed' && pathSegments[1]) {
    return sanitizeId(pathSegments[1])
  }

  return sanitizeId(searchParams.get('v'))
}

function sanitizeId(value) {
  if (!value) return null
  return value.replace(/[^\w-]/g, '') || null
}

function parseStartTime(value) {
  if (!value) return 0

  const trimmed = value.toString().replace(/^#?t=/, '').trim()
  if (!trimmed) return 0

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed)
  }

  const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i
  const match = trimmed.match(regex)

  if (!match) return 0

  const hours = Number(match[1] || 0)
  const minutes = Number(match[2] || 0)
  const seconds = Number(match[3] || 0)

  const total = hours * 3600 + minutes * 60 + seconds
  return Number.isFinite(total) ? total : 0
}
</script>

<style scoped>
.youtube-embed {
  position: relative;
  width: min(100%, 780px);
  margin: 1.25rem auto 0;
  aspect-ratio: 16 / 9;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #000;
  box-shadow: 0 12px 30px -16px rgba(0, 0, 0, 0.75);
}

.youtube-embed iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.youtube-embed__error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(17, 17, 17, 0.9);
}

@media (max-width: 820px) {
  .youtube-embed {
    width: 100%;
  }
}
</style>
