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

let excalidrawLibPromise: Promise<typeof import('@excalidraw/excalidraw')> | null = null

onMounted(async () => {
  loading.value = true
  try {
    const excalidrawLib = await loadExcalidrawLib()
    await loadAndRender(excalidrawLib)
  } finally {
    loading.value = false
  }
})

function loadExcalidrawLib() {
  if (!excalidrawLibPromise) {
    excalidrawLibPromise = import('@excalidraw/excalidraw')
  }
  return excalidrawLibPromise
}

async function loadAndRender(excalidrawLib: typeof import('@excalidraw/excalidraw')) {
  const url = new URL(props.drawFilePath, window.location.origin + import.meta.env.BASE_URL).href
  const response = await fetch(url)
  const json = await response.json() as ExcalidrawJSON

  const virgilId = excalidrawLib.FONT_FAMILY?.Virgil ?? 1

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

  const svgElement = await excalidrawLib.exportToSvg({
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
