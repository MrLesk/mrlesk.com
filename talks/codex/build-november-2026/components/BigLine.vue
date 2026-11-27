<script setup lang="ts">
import { computed } from 'vue'

// One big sentence whose words rise in one after the other.
const props = withDefaults(defineProps<{
  text: string
  /** `giant` is for two or three words, `large` for a sentence. */
  size?: 'large' | 'giant'
}>(), {
  size: 'large',
})

const words = computed(() => props.text.split(' '))
</script>

<template>
  <h1 class="big-line" :class="`is-${size}`">
    <template v-for="(word, index) in words" :key="index">
      <span class="big-line-word" :style="{ '--order': index }">{{ word }}</span>{{ ' ' }}
    </template>
  </h1>
</template>

<style scoped>
/* The colour comes from the slide: white on the gradient, dark on a white slide. */
.slidev-layout h1.big-line {
  margin: 0;
  color: inherit;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.big-line.is-large {
  font-size: calc(58 * var(--pt));
}

.big-line.is-giant {
  font-size: calc(96 * var(--pt));
  line-height: 1;
}

.big-line-word {
  display: inline-block;
  animation: big-line-word-in 800ms var(--deck-ease-out) both;
  animation-delay: calc(200ms + var(--order) * 90ms);
}

@keyframes big-line-word-in {
  from {
    opacity: 0;
    transform: translateY(0.5em) rotate(4deg);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
