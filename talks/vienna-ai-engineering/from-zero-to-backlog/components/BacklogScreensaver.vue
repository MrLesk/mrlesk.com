<template>
  <Teleport to="body">
    <Transition name="backlog-fade">
      <div
        v-if="isActive"
        ref="overlayRef"
        class="backlog-screensaver"
        role="presentation"
      >
        <div
          v-if="debug"
          class="backlog-screensaver__debug"
          :style="debugStyle"
        />
        <img
          ref="logoRef"
          :src="resolvedImageSrc"
          alt="Backlog logo bouncing screensaver"
          class="backlog-screensaver__logo"
          :style="logoStyle"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  idleDelay: {
    type: Number,
    default: 15_000,
  },
  imageSrc: {
    type: String,
    default: '/backlog-logo.png',
  },
  speed: {
    type: Number,
    default: 260,
  },
  debug: {
    type: Boolean,
    default: false,
  },
})

const isActive = ref(false)
const overlayRef = ref(null)
const logoRef = ref(null)
const position = reactive({ x: 0, y: 0 })
const velocity = reactive({ x: 0, y: 0 })
const bounds = reactive({ left: 0, top: 0, width: 0, height: 0 })

let idleTimer = null
let frameId = null
let lastTimestamp = 0
let listenersAttached = false

const logoStyle = computed(() => ({
  transform: `translate3d(${position.x + bounds.left}px, ${position.y + bounds.top}px, 0)`,
}))

const debugStyle = computed(() => ({
  transform: `translate3d(${bounds.left}px, ${bounds.top}px, 0)`,
  width: `${bounds.width}px`,
  height: `${bounds.height}px`,
}))

const externalSrcPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i
const resolvedImageSrc = computed(() => resolveImageSrc(props.imageSrc))

function resolveImageSrc(src) {
  if (!src) return src
  if (externalSrcPattern.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }

  const baseUrl = new URL(import.meta.env.BASE_URL || '/', 'http://slidev.local')
  const normalizedSrc = src.replace(/^(\.\/)+/, '').replace(/^\/+/, '')

  try {
    const url = new URL(normalizedSrc, baseUrl)
    return url.href.replace(baseUrl.origin, '')
  } catch (error) {
    return src
  }
}

const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown', 'wheel']
const route = useRoute()
const isCoverSlide = computed(() => {
  const no = route.params?.no
  return !no || `${no}` === '1'
})

function handleActivity() {
  if (typeof window === 'undefined') return
  if (isActive.value) {
    deactivate()
  }
  startIdleTimer()
}

function handleVisibilityChange() {
  if (typeof document === 'undefined') return
  if (document.visibilityState === 'visible') {
    handleActivity()
  } else {
    deactivate()
    stopIdleTimer()
  }
}

function startIdleTimer() {
  if (typeof window === 'undefined') return
  stopIdleTimer()
  const delay = props.debug ? 0 : props.idleDelay
  idleTimer = window.setTimeout(activate, delay)
}

function stopIdleTimer() {
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
}

function activate() {
  if (!overlayRef.value) {
    isActive.value = true
  } else {
    isActive.value = true
  }
  seedVelocity()
  lastTimestamp = 0
  measureBounds()
  nextTick(() => {
    placeLogoRandomly()
    startAnimation()
  })
}

function deactivate() {
  isActive.value = false
  stopAnimation()
}

function placeLogoRandomly() {
  if (!overlayRef.value || !logoRef.value) return
  const { width: containerWidth, height: containerHeight } = measureBounds()
  const logoWidth = logoRef.value.clientWidth
  const logoHeight = logoRef.value.clientHeight
  const maxX = Math.max(containerWidth - logoWidth, 0)
  const maxY = Math.max(containerHeight - logoHeight, 0)
  position.x = Math.random() * (maxX || 1)
  position.y = Math.random() * (maxY || 1)
}

function clampPosition() {
  if (!overlayRef.value || !logoRef.value) return
  const { width: containerWidth, height: containerHeight } = measureBounds()
  const logoWidth = logoRef.value.clientWidth
  const logoHeight = logoRef.value.clientHeight
  const maxX = Math.max(containerWidth - logoWidth, 0)
  const maxY = Math.max(containerHeight - logoHeight, 0)
  position.x = Math.min(Math.max(position.x, 0), maxX)
  position.y = Math.min(Math.max(position.y, 0), maxY)
}

function measureBounds() {
  if (typeof window === 'undefined') {
    bounds.left = 0
    bounds.top = 0
    bounds.width = overlayRef.value?.clientWidth || 0
    bounds.height = overlayRef.value?.clientHeight || 0
    return bounds
  }

  const selectors = [
    '.slidev-page.current',
    '.slidev-page.enter',
    '.slidev-page.leave',
    '.slidev-page',
    '.slidev-layout',
  ]

  for (const selector of selectors) {
    const target = document.querySelector(selector)
    if (target) {
      const rect = target.getBoundingClientRect()
      bounds.left = rect.left
      bounds.top = rect.top
      bounds.width = rect.width
      bounds.height = rect.height
      return bounds
    }
  }

  bounds.left = 0
  bounds.top = 0
  bounds.width = window.innerWidth
  bounds.height = window.innerHeight
  return bounds
}

function seedVelocity() {
  const angle = Math.random() * Math.PI * 2
  const baseSpeed = props.speed
  const minComponent = baseSpeed * 0.35
  velocity.x = Math.cos(angle) * baseSpeed
  velocity.y = Math.sin(angle) * baseSpeed

  if (Math.abs(velocity.x) < minComponent) {
    velocity.x = Math.sign(velocity.x) || 1
    velocity.x *= minComponent
  }

  if (Math.abs(velocity.y) < minComponent) {
    velocity.y = Math.sign(velocity.y) || 1
    velocity.y *= minComponent
  }
}

function step(timestamp) {
  if (!isActive.value || !overlayRef.value || !logoRef.value) {
    return
  }

  if (!lastTimestamp) {
    lastTimestamp = timestamp
  }

  const delta = (timestamp - lastTimestamp) / 1000
  lastTimestamp = timestamp

  const { width: containerWidth, height: containerHeight } = measureBounds()
  const logoWidth = logoRef.value.clientWidth
  const logoHeight = logoRef.value.clientHeight
  const maxX = Math.max(containerWidth - logoWidth, 0)
  const maxY = Math.max(containerHeight - logoHeight, 0)

  position.x += velocity.x * delta
  position.y += velocity.y * delta

  if (position.x <= 0) {
    position.x = 0
    velocity.x = Math.abs(velocity.x)
  } else if (position.x >= maxX) {
    position.x = maxX
    velocity.x = -Math.abs(velocity.x)
  }

  if (position.y <= 0) {
    position.y = 0
    velocity.y = Math.abs(velocity.y)
  } else if (position.y >= maxY) {
    position.y = maxY
    velocity.y = -Math.abs(velocity.y)
  }

  frameId = window.requestAnimationFrame(step)
}

function startAnimation() {
  stopAnimation()
  frameId = window.requestAnimationFrame(step)
}

function stopAnimation() {
  if (frameId !== null) {
    window.cancelAnimationFrame(frameId)
    frameId = null
  }
}

function addActivityListeners() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (listenersAttached) return
  listenersAttached = true
  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleActivity, { passive: true })
  })
  window.addEventListener('focus', handleActivity)
  window.addEventListener('resize', clampPosition)
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

function removeActivityListeners() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (!listenersAttached) return
  listenersAttached = false
  activityEvents.forEach((eventName) => {
    window.removeEventListener(eventName, handleActivity)
  })
  window.removeEventListener('focus', handleActivity)
  window.removeEventListener('resize', clampPosition)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  watch(
    isCoverSlide,
    (active) => {
      if (active) {
        measureBounds()
        addActivityListeners()
        startIdleTimer()
      } else {
        stopIdleTimer()
        deactivate()
        removeActivityListeners()
      }
    },
    { immediate: true }
  )
})

onBeforeUnmount(() => {
  stopIdleTimer()
  stopAnimation()
  deactivate()
  removeActivityListeners()
})
</script>

<style scoped>
.backlog-screensaver {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
  pointer-events: none;
  z-index: 9999;
}

.backlog-screensaver__logo {
  position: absolute;
  width: min(38vw, 320px);
  max-width: 320px;
  height: auto;
  transition: transform 0.1s linear;
  will-change: transform;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
}

.backlog-screensaver__debug {
  position: absolute;
  border: 3px dashed rgba(0, 200, 255, 0.7);
  pointer-events: none;
  box-sizing: border-box;
}

.backlog-fade-enter-active,
.backlog-fade-leave-active {
  transition: opacity 200ms ease;
}

.backlog-fade-enter-from,
.backlog-fade-leave-to {
  opacity: 0;
}
</style>
