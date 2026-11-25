import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

/**
 * When each clock was started, by clock name.
 *
 * It lives outside the components on purpose. A clock keeps running while its slide is not on
 * screen, so going back to show an earlier slide does not cost the room its countdown. Only a
 * reload of the page clears every clock.
 */
const startedAtByClock = reactive(new Map<string, number>())

/** A click back this soon after a start cancels it. It is the way out of a start by mistake. */
const CANCEL_WINDOW_MS = 5000

const TICK_MS = 250

/**
 * A countdown for a workshop slide.
 *
 * - It starts when `isStarted` turns true, which the slides do on their first click.
 * - Once started it runs to zero whatever the presenter does next: other slides, a click back.
 * - One exception: a click back within five seconds of the start cancels the start.
 * - Only the slide that is on screen for real (`isLive`) may start or cancel a clock. The
 *   overview and the presenter's preview of the next slide just show the full time.
 *
 * `clockName` must be different for every clock in the deck.
 */
export function useCountdown(clockName: string, totalSeconds: number, isStarted: () => boolean, isLive: () => boolean) {
  const now = ref(Date.now())
  let ticker: ReturnType<typeof setInterval> | undefined

  watch([isStarted, isLive], ([started, live]) => {
    if (!live) return
    const startedAt = startedAtByClock.get(clockName)

    if (started && startedAt === undefined) {
      startedAtByClock.set(clockName, Date.now())
      return
    }

    const wasStartedJustNow = startedAt !== undefined && Date.now() - startedAt < CANCEL_WINDOW_MS
    if (!started && wasStartedJustNow) startedAtByClock.delete(clockName)
  }, { immediate: true })

  // The time is only read while the slide is on screen. A hidden slide needs no ticking.
  watch(isLive, (live) => {
    clearInterval(ticker)
    if (!live) return
    now.value = Date.now()
    ticker = setInterval(() => {
      now.value = Date.now()
    }, TICK_MS)
  }, { immediate: true })

  onBeforeUnmount(() => clearInterval(ticker))

  const startedAt = computed(() => (isLive() ? startedAtByClock.get(clockName) : undefined))

  const secondsLeft = computed(() => {
    if (startedAt.value === undefined) return totalSeconds
    const secondsGone = Math.floor((now.value - startedAt.value) / 1000)
    return Math.max(0, totalSeconds - secondsGone)
  })

  const isRunning = computed(() => startedAt.value !== undefined && secondsLeft.value > 0)
  const isOver = computed(() => startedAt.value !== undefined && secondsLeft.value === 0)

  return { secondsLeft, isRunning, isOver }
}
