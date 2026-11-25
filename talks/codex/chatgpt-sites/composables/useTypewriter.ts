import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { SlideSteps } from './useSlideSteps'

const DEFAULT_CHAR_MS = 34

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Text that can type itself, one character at a time.
 *
 * - `shown` is the text to draw right now.
 * - `type(text)` types it from empty. It resolves `true` when the last character is in, or
 *   `false` when another `type` or `show` call took over first.
 * - `show(text)` puts the whole text there at once and stops any typing.
 */
export function useTypewriter() {
  const shown = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  // Every `type` or `show` call gets a new number. A typing loop stops when it sees a newer one.
  let currentRun = 0

  function show(text: string): void {
    currentRun++
    clearTimeout(timer)
    shown.value = text
  }

  function type(text: string, charMs = DEFAULT_CHAR_MS): Promise<boolean> {
    show('')
    if (prefersReducedMotion()) {
      shown.value = text
      return Promise.resolve(true)
    }

    const run = currentRun
    return new Promise((resolve) => {
      const typeNextCharacter = (): void => {
        if (run !== currentRun) return resolve(false)
        if (shown.value.length >= text.length) return resolve(true)
        shown.value = text.slice(0, shown.value.length + 1)
        timer = setTimeout(typeNextCharacter, charMs)
      }
      typeNextCharacter()
    })
  }

  onBeforeUnmount(() => show(''))

  return { shown, type, show }
}

/**
 * Text that belongs to one click of a slide.
 *
 * Before `atStep` it is empty. When the presenter clicks forward onto `atStep` it types itself.
 * In every other case (a click back, a jump, the overview, an export) the whole text is there.
 *
 * `isComplete` turns true once the full text is shown, for things that should follow the typing.
 */
export function useTypedOnStep(text: string, atStep: number, steps: SlideSteps, charMs = DEFAULT_CHAR_MS) {
  const { shown, type, show } = useTypewriter()

  watch(steps.step, (now, before) => {
    if (now < atStep) return show('')
    const clickedForwardOntoStep = steps.isLive.value && now === atStep && before === atStep - 1
    if (clickedForwardOntoStep) void type(text, charMs)
    else show(text)
  }, { immediate: true })

  const isComplete = computed(() => shown.value === text)

  return { shown, isComplete }
}
