<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

// A timelapse of a repository's history on the live Groma map.
//
// The addon's dev server replays the commits of a `replay` instance into a folder that a real
// Groma watches, so components and tasks appear on the map because the files really appear.
// This component shows that map, starts the replay on the first click, and prints each commit.
// Opening the slide again rewinds it. Both the presenter and the audience window may ask:
// the server plays the history once.
const props = withDefaults(defineProps<{
  name: string
  origin: string
  /** Shown when Groma is not running: a picture of the finished map, inside the deck's public folder. */
  still?: string
  /** The Groma view to watch. The default keeps Groma's chrome, because that is where task pins live. */
  view?: string
  /** Start playing as soon as the slide is shown, instead of on the first click. */
  autoplay?: boolean
  scale?: number
}>(), { view: '', autoplay: false, scale: 0.6 })

const { $clicks } = useSlideContext()
const active = useIsSlideActive()
const frame = ref(0)
const total = ref(0)
const subject = ref('')
let poll: ReturnType<typeof setInterval> | undefined

const endpoint = computed(() => `${import.meta.env.BASE_URL}__groma-live/${props.name}`)
const progress = computed(() => total.value > 1 ? frame.value / (total.value - 1) : 0)

async function sync(method: 'GET' | 'POST', query = ''): Promise<void> {
  try {
    const state = await (await fetch(`${endpoint.value}${query}`, { method })).json()
    if (state.total === undefined) return
    frame.value = state.frame
    total.value = state.total
    subject.value = state.subject
  } catch {
    // Without the dev server there is no replay; the still stays on screen.
  }
}

watch([active, $clicks], async ([shown, clicks], previous) => {
  if (!shown) return
  const entered = previous === undefined || previous[0] !== shown
  // Entering the slide always starts from the first commit, so a rehearsal can be repeated.
  if (entered || (clicks === 0 && previous[1] > 0)) await sync('POST', '?rewind')
  if (clicks > 0) void sync('POST', '?play')
  // The map needs a moment to show the empty state before an automatic run starts.
  else if (props.autoplay && entered) setTimeout(() => { if (active.value) void sync('POST', '?play') }, 1500)
}, { immediate: true })

watch(active, shown => {
  clearInterval(poll)
  if (shown) poll = setInterval(() => sync('GET'), 250)
}, { immediate: true })

onBeforeUnmount(() => clearInterval(poll))
</script>

<template>
  <GromaFrame :origin="origin" :views="[view]" :stills="still === undefined ? [] : [still]" :scale="scale" />
  <div v-if="total > 0" class="groma-timelapse">
    <p :key="subject">{{ subject }}</p>
    <div class="groma-timelapse-bar"><i :style="{ transform: `scaleX(${progress})` }" /></div>
    <span>COMMIT {{ frame + 1 }} / {{ total }}</span>
  </div>
</template>

<style>
.groma-timelapse {
  position: absolute;
  right: 40px;
  bottom: 34px;
  z-index: 5;
  width: 470px;
  padding: 11px 16px 12px;
  border: 1.5px solid var(--groma-ink, #171b1a);
  background: var(--groma-paper, #f7f6f2);
  box-shadow: 7px 7px 0 -3px var(--groma-green, #1d9e75);
  color: var(--groma-ink, #171b1a);
}

.slidev-layout .groma-timelapse p {
  margin: 0;
  overflow: hidden;
  font-size: 19px;
  font-weight: 680;
  letter-spacing: -0.03em;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.groma-timelapse-bar {
  height: 3px;
  margin: 10px 0 7px;
  background: #dce0dd;
}

.groma-timelapse-bar i {
  display: block;
  height: 100%;
  background: var(--groma-green, #1d9e75);
  transform-origin: 0 50%;
  transition: transform 0.3s linear;
}

.groma-timelapse span {
  color: #66706d;
  font-family: "Fira Code", ui-monospace, monospace;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.14em;
}
</style>
