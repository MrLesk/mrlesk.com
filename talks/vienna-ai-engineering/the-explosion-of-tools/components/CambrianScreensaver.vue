<template>
  <Teleport to="body">
    <Transition name="screensaver-fade">
      <div
        v-if="isActive"
        ref="overlayRef"
        class="cambrian-screensaver"
        role="presentation"
      >
        <div
          v-for="creature in creatures"
          :key="creature.id"
          class="cambrian-screensaver__creature"
          :style="getCreatureStyle(creature)"
        >
          <div
            class="cambrian-screensaver__sprite"
            :style="getSpriteStyle(creature)"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

defineOptions({ name: 'CambrianScreensaver' })

// Each creature has its own sprite sheet with 4 frames horizontally
const FRAME_COUNT = 4
const ANIMATION_FPS = 8

interface CreatureConfig {
  name: string
  sprite: string
  count?: number
  size?: number
}

interface Creature {
  id: string
  name: string
  sprite: string
  size: number
  x: number
  y: number
  velocityX: number
  velocityY: number
  frame: number
  animationOffset: number
}

const props = withDefaults(
  defineProps<{
    idleDelay?: number
    baseSpeed?: number
    creatures?: CreatureConfig[]
  }>(),
  {
    idleDelay: 15_000,
    baseSpeed: 80,
    creatures: () => [
      { name: 'Trilobite', sprite: '/sprites/trilobite.png', count: 2, size: 90 },
      { name: 'Anomalocaris', sprite: '/sprites/anomalocaris.png', count: 1, size: 110 },
      { name: 'Hallucigenia', sprite: '/sprites/hallucigenia.png', count: 1, size: 85 },
      { name: 'Opabinia', sprite: '/sprites/opabinia.png', count: 1, size: 95 },
      { name: 'Wiwaxia', sprite: '/sprites/wiwaxia.png', count: 1, size: 90 },
      { name: 'Pikaia', sprite: '/sprites/pikaia.png', count: 1, size: 80 },
    ],
  },
)

const { $page } = useSlideContext()
const { currentSlideNo } = useNav()

const thisSlideNo = computed(() => {
  const page = $page.value
  if (typeof page === 'number') return page
  if (page && typeof page.value === 'number') return page.value
  return Number(currentSlideNo?.value ?? 1)
})

const isCurrentSlide = computed(() => Number(currentSlideNo?.value ?? 1) === thisSlideNo.value)

const isActive = ref(false)
const overlayRef = ref<HTMLElement | null>(null)
const bounds = reactive({ left: 0, top: 0, width: 0, height: 0 })

const creatures = reactive<Creature[]>([])

let idleTimer: number | null = null
let frameId: number | null = null
let lastTimestamp = 0
let animationTime = 0
let listenersAttached = false

function getCreatureStyle(creature: Creature) {
  const flipX = creature.velocityX < 0 ? 'scaleX(-1)' : 'scaleX(1)'
  return {
    transform: `translate3d(${creature.x + bounds.left}px, ${creature.y + bounds.top}px, 0) ${flipX}`,
    width: `${creature.size}px`,
    height: `${creature.size}px`,
  }
}

function getSpriteStyle(creature: Creature) {
  const frameIndex = creature.frame % FRAME_COUNT
  // For 4 frames: 0%, 33.33%, 66.66%, 100%
  const posX = FRAME_COUNT > 1 ? (frameIndex / (FRAME_COUNT - 1)) * 100 : 0
  return {
    backgroundImage: `url(${creature.sprite})`,
    backgroundPosition: `${posX}% center`,
    backgroundSize: `${FRAME_COUNT * 100}% auto`,
  }
}

const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown', 'wheel']

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
  idleTimer = window.setTimeout(activate, props.idleDelay)
}

function stopIdleTimer() {
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
}

function initCreatures() {
  creatures.length = 0
  let id = 0

  for (const config of props.creatures) {
    const count = config.count ?? 1
    for (let i = 0; i < count; i++) {
      creatures.push({
        id: `creature-${id++}`,
        name: config.name,
        sprite: config.sprite,
        size: config.size ?? 80,
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        frame: 0,
        animationOffset: Math.random() * FRAME_COUNT,
      })
    }
  }
}

function seedCreaturePositionsAndVelocities() {
  measureBounds()
  for (const creature of creatures) {
    const maxX = Math.max(bounds.width - creature.size, 0)
    const maxY = Math.max(bounds.height - creature.size, 0)
    creature.x = Math.random() * maxX
    creature.y = Math.random() * maxY

    const angle = Math.random() * Math.PI * 2
    const speedVariation = 0.7 + Math.random() * 0.6
    const speed = props.baseSpeed * speedVariation
    const minComponent = speed * 0.35

    creature.velocityX = Math.cos(angle) * speed
    creature.velocityY = Math.sin(angle) * speed

    if (Math.abs(creature.velocityX) < minComponent) {
      creature.velocityX = (Math.sign(creature.velocityX) || 1) * minComponent
    }
    if (Math.abs(creature.velocityY) < minComponent) {
      creature.velocityY = (Math.sign(creature.velocityY) || 1) * minComponent
    }
  }
}

function activate() {
  isActive.value = true
  initCreatures()
  seedCreaturePositionsAndVelocities()
  lastTimestamp = 0
  animationTime = 0
  startAnimation()
}

function deactivate() {
  isActive.value = false
  stopAnimation()
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

function step(timestamp: number) {
  if (!isActive.value) return

  if (!lastTimestamp) {
    lastTimestamp = timestamp
  }

  const delta = (timestamp - lastTimestamp) / 1000
  lastTimestamp = timestamp
  animationTime += delta

  measureBounds()

  // Update animation frames
  const globalFrame = Math.floor(animationTime * ANIMATION_FPS)

  for (const creature of creatures) {
    // Update position
    const maxX = Math.max(bounds.width - creature.size, 0)
    const maxY = Math.max(bounds.height - creature.size, 0)

    creature.x += creature.velocityX * delta
    creature.y += creature.velocityY * delta

    if (creature.x <= 0) {
      creature.x = 0
      creature.velocityX = Math.abs(creature.velocityX)
    } else if (creature.x >= maxX) {
      creature.x = maxX
      creature.velocityX = -Math.abs(creature.velocityX)
    }

    if (creature.y <= 0) {
      creature.y = 0
      creature.velocityY = Math.abs(creature.velocityY)
    } else if (creature.y >= maxY) {
      creature.y = maxY
      creature.velocityY = -Math.abs(creature.velocityY)
    }

    // Update animation frame (with offset for variety)
    creature.frame = (globalFrame + Math.floor(creature.animationOffset)) % FRAME_COUNT
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
  document.removeEventListener('visibilitychange', handleVisibilityChange)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  watch(
    isCurrentSlide,
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
    { immediate: true },
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
.cambrian-screensaver {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 9999;
}

.cambrian-screensaver__creature {
  position: absolute;
  will-change: transform;
}

.cambrian-screensaver__sprite {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  image-rendering: pixelated;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
}

.screensaver-fade-enter-active,
.screensaver-fade-leave-active {
  transition: opacity 400ms ease;
}

.screensaver-fade-enter-from,
.screensaver-fade-leave-to {
  opacity: 0;
}
</style>
