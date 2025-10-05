<template>
  <SectionIndicator />
  <BacklogScreensaver :idle-delay="10_000" />
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import SectionIndicator from './components/SectionIndicator.vue'
import BacklogScreensaver from './components/BacklogScreensaver.vue'

const canLockEscape = typeof window !== 'undefined'
  && typeof navigator !== 'undefined'
  && 'keyboard' in navigator
  && typeof navigator.keyboard?.lock === 'function'

let detach = () => {}
let warnedLockFailure = false

onMounted(() => {
  if (!canLockEscape)
    return

  let isLocked = false
  let locking = false

  const unlock = () => {
    if (!isLocked)
      return
    navigator.keyboard.unlock()
    isLocked = false
  }

  const requestLock = async () => {
    if (locking)
      return

    if (!document.fullscreenElement) {
      unlock()
      return
    }

    locking = true

    try {
      if (navigator.permissions?.query) {
        const result = await navigator.permissions.query({ name: 'keyboard-lock' })
        if (result.state === 'denied') {
          unlock()
          locking = false
          return
        }
      }

      await navigator.keyboard.lock(['Escape'])
      isLocked = true
    }
    catch (error) {
      if (!warnedLockFailure) {
        console.warn('[Slidev] Failed to acquire Escape keyboard lock', error)
        warnedLockFailure = true
      }
    }
    finally {
      locking = false
    }
  }

  const handleFullscreenChange = () => {
    if (document.fullscreenElement)
      requestLock()
    else
      unlock()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden')
      unlock()
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  detach = () => {
    unlock()
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
})

onBeforeUnmount(() => detach())
</script>
