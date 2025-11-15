<script setup lang="ts">

</script>

<template>
  <div class="slidev-layout intro-ai-native dark">
    <slot></slot>
    <div class="presenter-info absolute left-159 top-58">
      <img class="w-52 h-52" src="/presenter.jpg" />
      <h3 class="mt-3">Alex Gavrilescu</h3>
      <h5>Lead Backend & Web Developer</h5>
    </div>
  </div>
</template>

<style scoped>
.intro-ai-native {
  background-image: url('/intro-ai-native-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
