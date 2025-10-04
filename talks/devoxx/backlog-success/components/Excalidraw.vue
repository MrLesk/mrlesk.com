<template>
  <p v-if="loading" class="text-center text-slate-500">Loading Excalidraw…</p>
  <div v-else v-bind="$attrs" v-html="svg"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ExcalidrawJSON {
  elements?: any[]
  appState?: Record<string, any>
  [key: string]: any
}

const props = withDefaults(defineProps<{
  drawFilePath: string
  darkMode?: boolean
  background?: boolean
}>(), {
  darkMode: false,
  background: false,
})

const loading = ref(false)
const svg = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    await loadScripts([
      'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
      'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js',
      'https://cdn.jsdelivr.net/npm/@excalidraw/excalidraw/dist/excalidraw.production.min.js',
    ])
    await loadAndRender()
  } finally {
    loading.value = false
  }
})

async function loadAndRender() {
  const url = new URL(props.drawFilePath, window.location.origin + import.meta.env.BASE_URL).href
  const response = await fetch(url)
  const json = await response.json() as ExcalidrawJSON

  const virgilId = (window as any)?.ExcalidrawLib?.FONT_FAMILY?.Virgil ?? 1

  const normalized: ExcalidrawJSON = {
    ...json,
    elements: (json.elements ?? []).map((element) => {
      if (element?.type === 'text') {
        return {
          ...element,
          fontFamily: virgilId,
        }
      }
      return element
    }),
    appState: {
      ...(json.appState ?? {}),
      currentItemFontFamily: virgilId,
    },
  }

  const svgElement = await (window as any).ExcalidrawLib.exportToSvg({
    ...normalized,
    appState: {
      ...(normalized.appState ?? {}),
      exportWithDarkMode: props.darkMode,
      exportBackground: props.background,
    },
  })

  svgElement.style.maxWidth = '100%'
  svgElement.style.height = 'auto'
  svg.value = svgElement.outerHTML
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function loadScripts(srcs: string[]) {
  return Promise.all(srcs.map(loadScript))
}
</script>
