<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive, useSlideContext } from '@slidev/client'

// A terminal on the slide that really runs the steps of a `gromaLive` instance, one per click.
// The commands live in the deck's headmatter and run on the Slidev dev server; this component only
// sends "run up to step n" and prints what came back. The presenter and the audience window may
// both ask: the server runs every step exactly once.
const props = defineProps<{ name: string }>()

const { $clicks } = useSlideContext()
const active = useIsSlideActive()
const lines = ref<string[]>([])
const serving = ref(false)
const failed = ref(false)
const offline = ref(false)
const body = ref<HTMLElement>()
let poll: ReturnType<typeof setInterval> | undefined

const endpoint = computed(() => `${import.meta.env.BASE_URL}__groma-live/${props.name}`)

async function sync(method: 'GET' | 'POST', query = ''): Promise<void> {
  try {
    const run = await (await fetch(`${endpoint.value}${query}`, { method })).json()
    offline.value = run.lines === undefined
    if (offline.value) return
    const grew = run.lines.length !== lines.value.length
    lines.value = run.lines
    serving.value = run.serving
    failed.value = run.failed
    if (grew) nextTick(() => body.value?.scrollTo({ top: body.value.scrollHeight }))
  } catch {
    offline.value = true
  }
}

/** Click n runs step n - 1, so the slide first appears with an empty prompt. */
watch([active, $clicks], ([shown, clicks]) => {
  if (shown && clicks > 0) void sync('POST', `?to=${clicks - 1}`)
}, { immediate: true })

watch(active, shown => {
  clearInterval(poll)
  if (shown) {
    void sync('GET')
    poll = setInterval(() => sync('GET'), 400)
  }
}, { immediate: true })

onBeforeUnmount(() => clearInterval(poll))
</script>

<template>
  <div class="groma-run">
    <div class="groma-run-bar">
      <i /><i /><i /><span>{{ name }}</span>
      <button title="Start this beat over" @click="sync('POST', '?reset')">RESET</button>
    </div>
    <div ref="body" class="groma-run-body">
      <p v-if="offline" class="note">Runs only in `bun run dev`.</p>
      <p v-for="(line, i) in lines" :key="i" :class="{ command: line.startsWith('$ ') }">{{ line }}</p>
      <p v-if="!serving && !failed"><span class="prompt">$</span> <span class="cursor" /></p>
      <p v-if="failed" class="bad">A step failed. Press RESET to try again.</p>
    </div>
  </div>
</template>

<style>
.groma-run {
  width: 100%;
  border: 1px solid #3c4240;
  background: #0e1010;
  color: #e6e4de;
  font-family: "Fira Code", "JetBrains Mono", ui-monospace, monospace;
  text-align: left;
}

.groma-run-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border-bottom: 1px solid #262a29;
  color: #6f7673;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.groma-run-bar i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #333837;
}

.groma-run-bar span {
  margin-left: 8px;
}

.groma-run-bar button {
  margin-left: auto;
  color: #4a504e;
  font: inherit;
  letter-spacing: inherit;
}

.groma-run-bar button:hover {
  color: #e6e4de;
}

.groma-run-body {
  height: 300px;
  overflow: hidden auto;
  padding: 16px 20px;
  scrollbar-width: none;
}

.slidev-layout .groma-run-body p {
  margin: 0;
  color: #8e9693;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.slidev-layout .groma-run-body p.command {
  margin-top: 6px;
  color: #e6e4de;
  font-size: 19px;
  font-weight: 600;
}

.slidev-layout .groma-run-body p.bad {
  color: #ff5a4f;
}

.groma-run-body .prompt {
  color: #6f7673;
  font-size: 19px;
}

.groma-run-body .cursor {
  display: inline-block;
  width: 11px;
  height: 22px;
  background: #e6e4de;
  vertical-align: -4px;
  animation: groma-run-blink 1.05s steps(1) infinite;
}

@keyframes groma-run-blink {
  50% { opacity: 0; }
}
</style>
