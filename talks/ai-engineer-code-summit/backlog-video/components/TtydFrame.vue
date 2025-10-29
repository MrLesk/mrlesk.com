<template>
  <div class="ttyd-frame">
    <iframe
      v-if="isClient"
      ref="frameRef"
      class="ttyd-frame__iframe"
      :src="src"
      :title="title"
      allow="clipboard-read; clipboard-write; fullscreen; keyboard-lock"
      tabindex="-1"
      scrolling="no"
      loading="lazy"
    />
    <div v-else class="ttyd-frame__placeholder">
      Loading terminal…
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: 'http://localhost:7681/',
  },
  title: {
    type: String,
    default: 'ttyd session',
  },

})

const frameRef = ref(null)
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})
</script>

<style scoped>
.ttyd-frame {
  @apply relative w-full overflow-hidden border border-white/10 shadow-xl bg-black/60;
  border-radius: 0;
  position: relative;
}

.ttyd-frame__iframe {
  @apply block w-full border-0;
  height: 100%;
  min-height: inherit;
  background: #000;
}

.ttyd-frame::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 14px;
  background: #000;
  pointer-events: none;
}

.ttyd-frame__placeholder {
  @apply flex items-center justify-center text-base text-white/70 p-8;
}
</style>
