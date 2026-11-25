<template>
  <div class="setup-mic" role="img" aria-label="Microphone icon with an animated red dot. This is an example.">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M6.75 11.25V12a5.25 5.25 0 0 0 10.5 0v-.75M12 17.25V21M9.25 21h5.5" />
    </svg>
    <span class="setup-mic-dot" aria-hidden="true" />
  </div>
</template>

<style scoped>
.setup-mic {
  position: relative;
  display: grid;
  place-items: center;
  width: 82px;
  height: 82px;
  margin: 5px 0 38px 26px;
  color: #e92759;
  background: linear-gradient(145deg, #fff5f7, #ffe8ef);
  border: 1.5px solid #f7b6c8;
  border-radius: 29px;
  box-shadow: 0 7px 20px #e927590c, inset 0 1px 0 #fff;
}
.setup-mic svg { width: 36px; height: 36px; }
.setup-mic-dot {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 11px;
  height: 11px;
  background: #e92759;
  border: 2px solid white;
  border-radius: 50%;
}
.setup-mic-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border: 1.5px solid #e92759;
  border-radius: 50%;
  animation: mic-pulse 1.8s ease-out infinite;
}
@keyframes mic-pulse {
  0% { transform: scale(.8); opacity: .7; }
  80%, 100% { transform: scale(2.2); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .setup-mic-dot::after { animation: none; opacity: .25; }
}
@media print {
  .setup-mic-dot::after { animation: none; opacity: .25; }
}
</style>
