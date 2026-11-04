<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

// The live Groma map inside a slide, driven by Slidev clicks.
//
// `views` holds one Groma query string per click ('hud=off', 'component=web-server&tab=how', ...),
// the same parameters Groma writes into its own URL.
//
// How a click reaches the map, best case first:
//   1. message: Groma announces itself with { gromaReady: true }. Each click posts
//      { gromaView: '?...' } and the map flies there without reloading.
//   2. reload:  an older Groma never announces itself, so each click reloads the iframe behind a veil.
//   3. stills:  nothing answers on `origin`, so the slide shows the captured images instead,
//               or a note when there are none.
//
// Only ever one iframe per origin: every Groma page holds a live /events stream and browsers cap
// connections per origin, so preloading one iframe per view is not possible.
const props = withDefaults(defineProps<{
  views: string[]
  captions?: string[]
  /** Fallback images, as paths inside the deck's public folder, one per view. */
  stills?: string[]
  origin?: string
  /** The app is laid out at 1/scale of the slide and scaled down, so its chrome reads like on a laptop. */
  scale?: number
  /**
   * Slide pixels to keep Groma's chrome away from the slide edge, for decks that draw a frame there.
   * The map itself still fills the slide. Needs a Groma that knows the `inset` parameter.
   */
  inset?: number
  /** Groma's theme for the embedded map: `light` (default) or `blueprint`, its dark theme. */
  theme?: string
  /**
   * For a Groma that opens on its setup: per click, the setup button that click presses, 'initialize'
   * (Continue) or 'scanners' (Install & scan), '' for none. The deck's dev server presses it (see
   * pressSetup in setup/vite-plugins.ts), so `name` must be the gromaLive instance behind `origin`.
   */
  setup?: string[]
  name?: string
}>(), { captions: () => [], stills: () => [], origin: 'http://localhost:4747', scale: 0.6, inset: 22, theme: 'light', setup: () => [] })

const { $clicks, $renderContext } = useSlideContext()
const active = useIsSlideActive()
// Slidev also counts the presenter's next-click preview as this slide being active. Only the slide
// itself may press a setup button: Groma's setup is shared, and the preview is one click ahead.
const drives = computed(() => active.value && ['slide', 'presenter'].includes($renderContext.value))
const base = import.meta.env.BASE_URL
// A built deck never reaches for localhost: no Groma runs there, and browsers would ask every
// visitor for access to their local network. It shows the stills instead.
const dev = import.meta.env.DEV

const frame = ref<HTMLIFrameElement>()
const caption = ref<HTMLElement>()
const status = ref<'checking' | 'live' | 'offline'>('checking')
const control = ref<'unknown' | 'message' | 'reload'>('unknown')
const veiled = ref(true)
const interactive = ref(false)
const initialSrc = ref('')

const index = computed(() => Math.min($clicks.value, props.views.length - 1))
// Groma counts the inset in its own pixels, which are 1/scale of a slide pixel.
const search = computed(() => `?theme=${props.theme}&inset=${Math.round(props.inset / props.scale)}&${props.views[index.value]}`)
let readyTimer: ReturnType<typeof setTimeout> | undefined
let probeTimer: ReturnType<typeof setTimeout> | undefined

/** A map that is being built on stage may not answer yet, so keep asking while the slide is shown. */
async function probe(): Promise<void> {
  clearTimeout(probeTimer)
  if (!dev) {
    status.value = 'offline'
    return
  }
  try {
    await fetch(props.origin, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(1500) })
    initialSrc.value = `${props.origin}/${search.value}`
    status.value = 'live'
  } catch {
    status.value = 'offline'
    if (active.value) probeTimer = setTimeout(probe, 2000)
  }
}

function post(): void {
  frame.value?.contentWindow?.postMessage({ gromaView: search.value }, props.origin)
}

function onMessage(event: MessageEvent): void {
  if (event.origin !== props.origin || event.data?.gromaReady !== true) return
  clearTimeout(readyTimer)
  control.value = 'message'
  post()
  veiled.value = false
}

function onLoad(): void {
  if (control.value === 'message') return
  // No announcement shortly after load means this Groma has no message hook.
  clearTimeout(readyTimer)
  readyTimer = setTimeout(() => {
    if (control.value === 'unknown') control.value = 'reload'
    veiled.value = false
  }, 700)
  keepKeyboard()
}

/** The clicker talks to Slidev, so the embedded page must not keep keyboard focus. */
function keepKeyboard(): void {
  if (!interactive.value && document.activeElement === frame.value) {
    frame.value?.blur()
    window.focus()
  }
}
const onBlur = () => setTimeout(keepKeyboard)

/**
 * `text-wrap: balance` gives a long caption two even lines, but the card keeps its max-width and shows an
 * empty band right of the text. The card takes the width of its widest line instead, which keeps the same lines.
 */
function fitCaption(): void {
  const card = caption.value
  // A hidden slide has no layout to measure: this runs again when the slide is shown.
  if (!card || card.offsetWidth === 0) return
  card.style.width = ''
  // The slide is scaled to the screen: rectangles come in screen pixels, the width is in slide pixels.
  const scale = card.getBoundingClientRect().width / card.offsetWidth
  const widest = card.firstElementChild!.getBoundingClientRect().width / scale
  // The card's width includes its padding and border (box-sizing: border-box).
  const { paddingLeft, paddingRight, borderLeftWidth, borderRightWidth } = getComputedStyle(card)
  const edges = [paddingLeft, paddingRight, borderLeftWidth, borderRightWidth].reduce((sum, side) => sum + parseFloat(side), 0)
  card.style.width = `${Math.ceil(widest + edges)}px`
}

// A new caption, the slide coming into view, and the font arriving late all change what the card must fit.
watch([caption, active], fitCaption, { flush: 'post' })

function stopInteracting(): void {
  interactive.value = false
  frame.value?.blur()
  window.focus()
  // Whatever the hands left on the map (a flick that glides away, a deep zoom, a selection), the slide goes on from
  // a fresh copy of this click's view. In Chrome a map left like that could stay blank, even after the next click.
  if (frame.value && status.value === 'live') {
    veiled.value = true
    // A Groma that never announces itself is unveiled by onLoad; one that does lifts the veil itself.
    control.value = 'unknown'
    frame.value.src = `${props.origin}/${search.value}`
  }
}

watch(search, () => {
  if (status.value !== 'live') return
  // No frame on the page yet (it renders on the next tick, or the slide is hidden): it will load the current view.
  if (!frame.value) initialSrc.value = `${props.origin}/${search.value}`
  else if (control.value === 'message') post()
  else {
    veiled.value = true
    setTimeout(() => { if (frame.value) frame.value.src = `${props.origin}/${search.value}` }, 220)
  }
})

// The setup step this click needs: the last one pressed at or before it. The dev server presses every
// button up to it that Groma still shows, so a click made before Groma answered is not lost.
const setupStep = computed(() => props.setup.slice(0, index.value + 1).filter(Boolean).at(-1))

async function pressSetup(): Promise<void> {
  const step = setupStep.value
  if (!dev || !drives.value || status.value !== 'live' || step === undefined || props.name === undefined) return
  let pressed: { submitted?: boolean } = {}
  try {
    pressed = await (await fetch(`${base}__groma-live/${props.name}?setup=${step}`, { method: 'POST' })).json()
  } catch {
    return
  }
  if (pressed.submitted && frame.value) {
    veiled.value = true
    frame.value.src = `${props.origin}/${search.value}`
  }
}

// A setup press only goes forward: Groma cannot undo a step, and stepping back just shows the slide.
watch(index, (now, before) => {
  if (before === undefined || now > before) void pressSetup()
})
// Groma answered after the click that needed it, or the slide was reloaded in the middle of the setup.
watch(() => status.value === 'live' && drives.value, ready => {
  if (ready) void pressSetup()
})

watch(active, now => {
  // A frame that comes back with the slide starts from the view of this click, not the one it first loaded.
  if (now && status.value === 'live') initialSrc.value = `${props.origin}/${search.value}`
  if (now && status.value !== 'live') probe()
  if (!now) {
    interactive.value = false
    clearTimeout(probeTimer)
    // The frame leaves the page with the slide; the next one loads the view of that moment, veiled until it announces itself.
    control.value = 'unknown'
    veiled.value = true
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('message', onMessage)
  window.addEventListener('blur', onBlur)
  document.fonts.addEventListener('loadingdone', fitCaption)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  window.removeEventListener('blur', onBlur)
  document.fonts.removeEventListener('loadingdone', fitCaption)
  clearTimeout(readyTimer)
  clearTimeout(probeTimer)
})
</script>

<template>
  <div class="groma-frame" :style="{ '--scale': scale }">
    <template v-if="status === 'live' && active">
      <!-- clipboard-write lets the map's own Copy buttons work while you use it by hand. -->
      <iframe ref="frame" :src="initialSrc" title="Groma.md live map" allow="clipboard-write" @load="onLoad" />
      <div v-if="!interactive" class="groma-shield" @dblclick="interactive = true" />
      <button v-else class="groma-exit" @click="stopInteracting">INTERACTIVE · CLICK TO RETURN</button>
      <div class="groma-veil" :class="{ on: veiled }" />
    </template>
    <template v-else-if="status === 'offline'">
      <img
        v-for="(still, i) in stills"
        :key="still"
        class="groma-still"
        :class="{ on: i === Math.min(index, stills.length - 1) }"
        :src="`${base}${still}`"
        alt=""
      />
      <div v-if="stills.length === 0" class="groma-offline">
        <span v-if="dev">WAITING FOR GROMA ON {{ origin }}</span>
        <span v-else>SHOWN LIVE IN THE TALK</span>
      </div>
    </template>
    <transition name="groma-caption" mode="out-in">
      <!-- The span is there to measure the text: see fitCaption. -->
      <p v-if="captions[index]" :key="captions[index]" ref="caption" class="groma-caption"><span>{{ captions[index] }}</span></p>
    </transition>
  </div>
</template>

<style>
.groma-frame {
  --paper: var(--groma-paper, #f7f6f2);
  --ink: var(--groma-ink, #171b1a);
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: var(--paper);
}

.groma-frame iframe,
.groma-shield,
.groma-veil,
.groma-still {
  position: absolute;
  top: 0;
  left: 0;
}

/* Laid out larger than the slide, then scaled down to fit it exactly. */
.groma-frame iframe {
  width: calc(100% / var(--scale));
  height: calc(100% / var(--scale));
  border: 0;
  transform: scale(var(--scale));
  transform-origin: 0 0;
}

.groma-shield,
.groma-veil,
.groma-still {
  width: 100%;
  height: 100%;
}

.groma-still {
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.groma-still.on {
  opacity: 1;
}

.groma-veil {
  background: var(--paper);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease;
}

.groma-veil.on {
  opacity: 1;
}

.groma-exit {
  position: absolute;
  top: 26px;
  left: 50%;
  z-index: 6;
  padding: 6px 12px;
  border: 1px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  font-family: "Fira Code", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  transform: translateX(-50%);
}

.groma-offline {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #66706d;
  font-family: "Fira Code", ui-monospace, monospace;
  font-size: 13px;
  letter-spacing: 0.08em;
}

.slidev-layout p.groma-caption {
  position: absolute;
  bottom: 34px;
  left: 40px;
  z-index: 5;
  /* fitCaption sets the width of a two-line caption and counts on border-box. */
  box-sizing: border-box;
  max-width: 620px;
  margin: 0;
  padding: 11px 18px 12px;
  border: 1.5px solid var(--ink);
  background: var(--paper);
  box-shadow: 7px 7px 0 -3px var(--groma-accent, var(--groma-green, #1d9e75));
  color: var(--ink);
  font-size: 25px;
  font-weight: 680;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-wrap: balance;
}

.groma-caption-enter-active,
.groma-caption-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.groma-caption-enter-from,
.groma-caption-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
