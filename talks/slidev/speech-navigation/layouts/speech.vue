<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
const { $page } = useSlideContext()
</script>

<template>
  <div class="slidev-layout speech">
    <slot />
    <footer class="speech-footer">
      <span>OpenAI GPT-Live 1 <span class="footer-model-divider">·</span> Speech Navigation</span>
      <span>{{ String($page).padStart(2, '0') }} <span class="page-divider">/</span> 08</span>
    </footer>
  </div>
</template>
