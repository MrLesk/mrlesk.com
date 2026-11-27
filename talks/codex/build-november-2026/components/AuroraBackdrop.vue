<!-- The blue Codex gradient with three soft lights that drift slowly. It fills its parent, so the
     parent needs `position: relative` or `absolute`. -->
<template>
  <div class="aurora" aria-hidden="true">
    <span class="aurora-light aurora-light-1" />
    <span class="aurora-light aurora-light-2" />
    <span class="aurora-light aurora-light-3" />
  </div>
</template>

<style scoped>
.aurora {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: var(--codex-grad-2);
  background-image: url('/cover-bg.png');
  background-size: cover;
  background-position: center;
}

.aurora-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(calc(70 * var(--pt)));
  mix-blend-mode: screen;
}

.aurora-light-1 {
  left: -12%;
  top: -24%;
  width: 48%;
  height: 74%;
  background: #9dacff;
  opacity: 0.55;
  animation: aurora-drift-1 19s ease-in-out infinite;
}

.aurora-light-2 {
  right: -10%;
  bottom: -26%;
  width: 44%;
  height: 66%;
  background: #b58cff;
  opacity: 0.5;
  animation: aurora-drift-2 23s ease-in-out infinite;
}

.aurora-light-3 {
  left: 36%;
  top: 28%;
  width: 30%;
  height: 46%;
  background: #62d2ff;
  opacity: 0.28;
  animation: aurora-drift-3 27s ease-in-out infinite;
}

@keyframes aurora-drift-1 {
  0%, 100% { translate: 0 0; }
  50% { translate: 22% 18%; }
}

@keyframes aurora-drift-2 {
  0%, 100% { translate: 0 0; }
  50% { translate: -20% -16%; }
}

@keyframes aurora-drift-3 {
  0%, 100% { translate: -30% 10%; }
  50% { translate: 30% -14%; }
}
</style>
