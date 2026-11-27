import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * The current time, refreshed every `everyMs` while `running` is true.
 *
 * To rehearse a slide that follows the clock, add `?now=` with a time to the deck's address, for
 * example `?now=2026-11-28T11:20`. The clock then stands still at that time.
 */
export function useNow(running: Ref<boolean>, everyMs = 15_000): Ref<Date> {
  const rehearsalTime = new Date(new URLSearchParams(window.location.search).get('now') ?? '')
  const isRehearsal = !Number.isNaN(rehearsalTime.getTime())
  const readClock = (): Date => (isRehearsal ? rehearsalTime : new Date())

  const now = ref(readClock())
  let timer = 0

  watch(running, (isRunning) => {
    window.clearInterval(timer)
    if (!isRunning) return
    now.value = readClock()
    timer = window.setInterval(() => {
      now.value = readClock()
    }, everyMs)
  }, { immediate: true })

  onBeforeUnmount(() => window.clearInterval(timer))

  return now
}
