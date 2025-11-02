<template>
  <p v-if="loading" class="text-center text-slate-500">Loading Excalidraw…</p>
  <div v-else v-bind="$attrs" v-html="svg"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface ExcalidrawJSON {
  elements?: any[]
  appState?: Record<string, any>
  files?: Record<string, any>
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

// Global singleton promise for script loading (shared across all component instances)
declare global {
  interface Window {
    __excalidrawScriptsPromise?: Promise<void>
    ExcalidrawLib?: any
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadExcalidrawScripts()
    await loadAndRender()
  } finally {
    loading.value = false
  }
})

function loadExcalidrawScripts(): Promise<void> {
  // Return existing promise if scripts are already loading/loaded
  if (window.__excalidrawScriptsPromise) {
    return window.__excalidrawScriptsPromise
  }

  // Create singleton promise for script loading
  window.__excalidrawScriptsPromise = (async () => {
    // Check if already loaded
    if (window.ExcalidrawLib) {
      return
    }

    const scripts = [
      'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
      'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js',
      'https://cdn.jsdelivr.net/npm/@excalidraw/excalidraw/dist/excalidraw.production.min.js',
    ]

    for (const src of scripts) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
        document.head.appendChild(script)
      })
    }
  })()

  return window.__excalidrawScriptsPromise
}

async function loadAndRender() {
  const url = new URL(props.drawFilePath, window.location.origin + import.meta.env.BASE_URL).href
  const response = await fetch(url)
  const json = await response.json() as ExcalidrawJSON

  const virgilId = window.ExcalidrawLib?.FONT_FAMILY?.Virgil ?? 1

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
    files: json.files ?? {},
  }

  const svgElement = await window.ExcalidrawLib.exportToSvg({
    ...normalized,
    appState: {
      ...(normalized.appState ?? {}),
      exportWithDarkMode: props.darkMode,
      exportBackground: props.background,
    },
    files: normalized.files ?? {},
  })

  svgElement.style.maxWidth = '100%'
  svgElement.style.height = 'auto'
  svg.value = svgElement.outerHTML
}
</script>
