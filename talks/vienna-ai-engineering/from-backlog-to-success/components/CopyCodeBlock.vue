<template>
  <div ref="container" :class="['copy-code-container', props.wrapperClass]">
    <slot />
    <div :class="['copy-code-button-wrapper', props.buttonWrapperClass]">
      <button
        type="button"
        :aria-label="props.ariaLabel"
        :class="[
          'copy-code-button',
          props.buttonBaseClass,
          copied ? props.variantCopiedClass : props.variantIdleClass,
        ]"
        @click="handleCopy"
      >
        <span :class="copied ? props.iconCopiedClass : props.iconCopyClass"></span>
        <span>{{ copied ? props.copiedLabel : props.copyLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps({
    selector: {
      type: String,
      default: 'pre code',
    },
    trim: {
      type: Boolean,
      default: true,
    },
    wrapperClass: {
      type: [String, Array, Object],
      default: 'mt-6 space-y-3',
    },
    buttonWrapperClass: {
      type: [String, Array, Object],
      default: 'flex justify-end',
    },
    buttonBaseClass: {
      type: [String, Array, Object],
      default:
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none',
    },
    variantIdleClass: {
      type: [String, Array, Object],
      default: 'is-idle',
    },
    variantCopiedClass: {
      type: [String, Array, Object],
      default: 'is-copied',
    },
    copyLabel: {
      type: String,
      default: 'Copy code',
    },
    copiedLabel: {
      type: String,
      default: 'Copied!',
    },
    ariaLabel: {
      type: String,
      default: 'Copy code snippet',
    },
    iconCopyClass: {
      type: String,
      default: 'i-carbon-copy text-base',
    },
    iconCopiedClass: {
      type: String,
      default: 'i-carbon-checkmark-filled text-base',
    },
  })

const container = ref(null)
const { copy, copied } = useClipboard({ legacy: true })

const handleCopy = async () => {
  const host = container.value
  if (!host) return
  const codeElement = host.querySelector(props.selector)
  const raw = codeElement?.textContent
  if (!raw) return
  await copy(props.trim ? raw.trim() : raw)
}
</script>

<style scoped>
.copy-code-container {
  position: relative;
}

.copy-code-button-wrapper {
  margin-top: 0.5rem;
}

.copy-code-button {
  border-color: color-mix(in srgb, var(--slidev-theme-primary) 45%, transparent);
  background-color: color-mix(
    in srgb,
    var(--slidev-code-background) 82%,
    var(--slidev-theme-primary) 18%
  );
  color: var(--slidev-code-foreground);
  box-shadow: 0 4px 12px -10px color-mix(in srgb, var(--slidev-theme-primary) 50%, transparent);
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: ease;
}

.copy-code-button.is-idle:hover {
  background-color: color-mix(
    in srgb,
    var(--slidev-code-background) 65%,
    var(--slidev-theme-primary) 35%
  );
  transform: translateY(-1px);
}

.copy-code-button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--slidev-theme-primary) 65%, transparent);
  outline-offset: 2px;
}

.copy-code-button.is-copied {
  background-color: color-mix(in srgb, var(--slidev-theme-primary) 90%, black 10%);
  border-color: color-mix(in srgb, var(--slidev-theme-primary) 70%, transparent);
  color: color-mix(in srgb, white 88%, var(--slidev-theme-primary) 12%);
  box-shadow: 0 6px 18px -12px color-mix(in srgb, var(--slidev-theme-primary) 75%, black 25%);
}

.copy-code-button.is-copied:hover {
  background-color: color-mix(in srgb, var(--slidev-theme-primary) 95%, black 5%);
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .copy-code-button {
    transition-duration: 0ms;
  }
}
</style>
