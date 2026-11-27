<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'
import { mediaIn } from '../lib/photos'

// One click: "girlfriend" is crossed out and "fiancée" is written above it, then the picture
// drops in and hearts rise. A click back undoes all of it.
// The picture is the first file in photos/personal.
const { stepClasses } = useSlideSteps(1)

const picture = mediaIn('personal')[0]
</script>

<template>
  <div class="fiancee" :class="stepClasses">
    <AuroraBackdrop />
    <FloatingBits class="fiancee-hearts" :bits="['💙', '💍', '✨', '🤍']" :count="18" />

    <p class="fiancee-line">
      My
      <span class="fiancee-word">
        <span class="fiancee-new">fiancée</span>
        <span class="fiancee-old">girlfriend</span>
      </span>
      <br>who supported me<br>all year round
    </p>

    <figure v-if="picture" class="fiancee-photo">
      <img :src="picture.url" alt="">
    </figure>
  </div>
</template>

<style scoped>
.fiancee {
  position: absolute;
  inset: 0;
  color: #ffffff;
}

.fiancee-line {
  position: absolute;
  left: calc(64 * var(--pt));
  top: 50%;
  translate: 0 -46%;
  margin: 0;
  font-size: calc(56 * var(--pt));
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.22;
  animation: deck-rise 800ms var(--deck-ease-out) both;
}

.fiancee-word {
  position: relative;
  display: inline-block;
}

/* The old word and the line that crosses it out. */
.fiancee-old {
  position: relative;
  display: inline-block;
  transition: opacity 500ms ease;
}

.fiancee-old::after {
  content: '';
  position: absolute;
  left: -4%;
  right: -4%;
  top: 56%;
  height: 0.09em;
  border-radius: 0.05em;
  background: #ffd166;
  transform: rotate(-3deg) scaleX(0);
  transform-origin: left center;
  transition: transform 450ms var(--deck-ease-out);
}

.s1 .fiancee-old {
  opacity: 0.6;
  transition-delay: 350ms;
}

.s1 .fiancee-old::after {
  transform: rotate(-3deg) scaleX(1);
}

/* The new word, written above the old one. */
.fiancee-new {
  position: absolute;
  left: 0;
  bottom: 88%;
  rotate: -5deg;
  scale: 0.4;
  transform-origin: left bottom;
  opacity: 0;
  color: #ffd166;
  font-style: italic;
  font-weight: 700;
  white-space: nowrap;
  transition:
    opacity 300ms ease,
    scale 650ms var(--deck-ease-spring);
}

.s1 .fiancee-new {
  opacity: 1;
  scale: 1;
  transition-delay: 500ms;
}

/* The picture: a print with a white border that drops in from above. */
.fiancee-photo {
  position: absolute;
  right: calc(74 * var(--pt));
  top: calc(72 * var(--pt));
  width: calc(280 * var(--pt));
  margin: 0;
  padding: calc(10 * var(--pt)) calc(10 * var(--pt)) calc(30 * var(--pt));
  border-radius: calc(10 * var(--pt));
  background: #ffffff;
  box-shadow: 0 calc(20 * var(--pt)) calc(50 * var(--pt)) rgba(20, 14, 80, 0.45);
  opacity: 0;
  transform: translateY(-130%) rotate(-24deg);
  transition:
    opacity 300ms ease,
    transform 1000ms var(--deck-ease-spring);
}

.s1 .fiancee-photo {
  opacity: 1;
  transform: rotate(4deg);
  transition-delay: 1150ms;
}

.fiancee-photo img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: calc(5 * var(--pt));
}

.fiancee-hearts {
  opacity: 0;
  transition: opacity 900ms ease;
}

.s1 .fiancee-hearts {
  opacity: 1;
  transition-delay: 1700ms;
}
</style>
