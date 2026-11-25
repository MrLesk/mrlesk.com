<script setup lang="ts">
import { useSlideSteps } from '../composables/useSlideSteps'

// Slide "Visibility": who can see a Site. The Site sits in the middle, the people who can
// see it gather around it, and the list on the right marks the current choice.
//
//   start    Just you
//   click 1  Specific people   four invited people join
//   click 2  Public            a crowd fills the outer rings
//
// The slide's frontmatter must say `clicks: 2`.
const { step, stepClasses } = useSlideSteps(2)

const CHOICES = [
  { icon: 'lock', title: 'Just you', note: 'Keep it private while you make it yours.', tint: 'var(--codex-accent)' },
  { icon: 'people', title: 'Specific people', note: 'Share with the people you choose.', tint: 'var(--codex-grad-3)' },
  { icon: 'globe', title: 'Public', note: 'Let anyone with the link explore what you built.', tint: 'var(--sites-live)' },
] as const

// People stand on flat rings around the Site, like orbits seen from the side.
/** Half the width of each ring, in slide points. Ring 1 is the closest. */
const RING_RADII = [122, 172, 222]
/** A ring's height divided by its width. */
const RING_FLATNESS = 0.6

/** The spot on a ring at `angle` degrees (0 is right, 90 is down), as CSS left and top. */
function spotOnRing(radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180
  const x = Math.cos(radians) * radius
  const y = Math.sin(radians) * radius * RING_FLATNESS
  return {
    left: `calc(50% + ${x.toFixed(1)} * var(--pt))`,
    top: `calc(50% + ${y.toFixed(1)} * var(--pt))`,
  }
}

const RINGS = RING_RADII.map(radius => ({
  width: `calc(${radius * 2} * var(--pt))`,
  height: `calc(${radius * 2 * RING_FLATNESS} * var(--pt))`,
}))

const YOU = spotOnRing(RING_RADII[0]!, 180)

/** The four invited people, all on the closest ring. */
const INVITED = [
  { angle: -40, colour: '#8a5bff' },
  { angle: 40, colour: '#6e7bff' },
  { angle: 140, colour: '#a685ff' },
  { angle: 220, colour: '#5b7cf0' },
].map((person, index) => ({
  ...spotOnRing(RING_RADII[0]!, person.angle),
  '--person-colour': person.colour,
  '--order': index,
}))

/** The public: thirty people spread over the two outer rings and the space between them. */
const CROWD_COLOURS = ['#3442e0', '#6e7bff', '#8a5bff', '#14a166', '#a2a8ba']
const CROWD = Array.from({ length: 30 }, (_, index) => {
  // 137.5 degrees is the golden angle: each next person lands in the biggest free gap.
  const angle = 12 + index * 137.5
  const radius = 170 + (index % 3) * 26
  return {
    ...spotOnRing(radius, angle),
    '--person-colour': CROWD_COLOURS[index % CROWD_COLOURS.length],
    '--person-size': `calc(${9 + (index % 3) * 3} * var(--pt))`,
    '--order': index,
  }
})
</script>

<template>
  <div class="visibility" :class="stepClasses">
    <!-- Left: the Site and the people who can see it. -->
    <div class="audience" aria-hidden="true">
      <span v-for="(ring, index) in RINGS" :key="`ring-${index}`" class="audience-ring" :class="`is-ring-${index + 1}`" :style="ring" />
      <span class="audience-ripple" :style="RINGS[0]" />
      <span class="audience-ripple is-second" :style="RINGS[0]" />

      <span v-for="(person, index) in CROWD" :key="`crowd-${index}`" class="audience-crowd" :style="person" />
      <span v-for="(person, index) in INVITED" :key="`invited-${index}`" class="audience-person is-invited" :style="person">
        <SiteIcon name="person" />
      </span>
      <span class="audience-person is-you" :style="YOU">
        <SiteIcon name="person" />
        <span class="audience-you-label">You</span>
      </span>

      <div class="audience-site">
        <BrowserWindow class="audience-site-window" address="your-idea">
          <MiniSite />
        </BrowserWindow>
        <!-- The badge on the top edge shows the current choice's icon. -->
        <span class="audience-badge">
          <SiteIcon v-for="(choice, index) in CHOICES" :key="choice.icon" :name="choice.icon" :class="{ 'is-on': step === index }" />
        </span>
      </div>
    </div>

    <!-- Right: the three choices. -->
    <div class="choices">
      <div
        v-for="(choice, index) in CHOICES"
        :key="choice.title"
        class="choice"
        :class="{ 'is-on': step === index }"
        :style="{ '--choice-tint': choice.tint, '--order': index }"
      >
        <span class="choice-icon"><SiteIcon :name="choice.icon" /></span>
        <span class="choice-title">{{ choice.title }}</span>
        <span class="choice-note">{{ choice.note }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visibility {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  align-items: center;
  gap: calc(28 * var(--pt));
  height: calc(272 * var(--pt));
}

/* ── The Site and its audience ──────────────────────────────────────────── */

.audience {
  position: relative;
  height: 100%;
  animation: sites-rise 800ms var(--sites-ease-out) 200ms both;
}

/* Everything in the picture is centred on its own left/top point. */
.audience-ring,
.audience-ripple,
.audience-person,
.audience-crowd,
.audience-site {
  position: absolute;
  translate: -50% -50%;
}

.audience-ring,
.audience-ripple {
  top: 50%;
  left: 50%;
  border-radius: 50%;
}

.audience-ring {
  border: 1px dashed rgba(52, 66, 224, 0.28);
  opacity: 0;
  scale: 0.8;
  transition:
    opacity 500ms ease,
    scale 800ms var(--sites-ease-out);
}

.audience-ring.is-ring-1,
.s2 .audience-ring {
  opacity: 1;
  scale: 1;
}

/* Public: rings of light keep spreading out from the Site. */
.audience-ripple {
  border: 2px solid var(--sites-live);
  opacity: 0;
}

.s2 .audience-ripple {
  animation: audience-ripple 3.2s ease-out infinite;
}

.s2 .audience-ripple.is-second {
  animation-delay: 1.6s;
}

.audience-site {
  top: 50%;
  left: 50%;
  z-index: 2;
  width: calc(150 * var(--pt));
}

.audience-site-window {
  height: calc(108 * var(--pt));
  font-size: calc(6.4 * var(--pt));
}

.audience-badge {
  position: absolute;
  top: calc(-16 * var(--pt));
  left: 50%;
  translate: -50% 0;
  display: grid;
  place-items: center;
  width: calc(30 * var(--pt));
  height: calc(30 * var(--pt));
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: var(--codex-accent);
  box-shadow: 0 calc(4 * var(--pt)) calc(12 * var(--pt)) rgba(20, 14, 80, 0.25);
  color: #ffffff;
  font-size: calc(15 * var(--pt));
  transition: background 500ms ease;
}

.s1 .audience-badge {
  background: var(--codex-grad-3);
}

.s2 .audience-badge {
  background: var(--sites-live);
}

/* The three icons sit on top of each other. Only the current one shows. */
.audience-badge .site-icon {
  grid-area: 1 / 1;
  opacity: 0;
  scale: 0.4;
  transition:
    opacity 250ms ease,
    scale 450ms var(--sites-ease-spring);
}

.audience-badge .site-icon.is-on {
  opacity: 1;
  scale: 1;
}

/* People: you are always there, the invited come at click 1, the crowd at click 2. */
.audience-person {
  z-index: 1;
  display: grid;
  place-items: center;
  width: calc(32 * var(--pt));
  height: calc(32 * var(--pt));
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: var(--person-colour);
  box-shadow: 0 calc(4 * var(--pt)) calc(10 * var(--pt)) rgba(20, 14, 80, 0.18);
  color: #ffffff;
  font-size: calc(16 * var(--pt));
}

.audience-person.is-you {
  --person-colour: var(--codex-accent);
}

.audience-you-label {
  position: absolute;
  top: 100%;
  margin-top: calc(4 * var(--pt));
  color: var(--codex-fg);
  font-size: calc(11 * var(--pt));
  font-weight: 600;
}

.audience-person.is-invited,
.audience-crowd {
  opacity: 0;
  scale: 0.2;
  transition:
    opacity 250ms ease,
    scale 500ms var(--sites-ease-spring);
}

.s1 .audience-person.is-invited {
  opacity: 1;
  scale: 1;
  transition-delay: calc(var(--order) * 130ms);
}

.audience-crowd {
  width: var(--person-size);
  height: var(--person-size);
  border-radius: 50%;
  background: var(--person-colour);
}

.s2 .audience-crowd {
  opacity: 0.85;
  scale: 1;
  transition-delay: calc(var(--order) * 40ms);
}

/* ── The three choices ──────────────────────────────────────────────────── */

.choices {
  display: flex;
  flex-direction: column;
  gap: calc(10 * var(--pt));
}

.choice {
  display: grid;
  grid-template-columns: calc(40 * var(--pt)) 1fr;
  column-gap: calc(14 * var(--pt));
  align-items: center;
  padding: calc(12 * var(--pt)) calc(14 * var(--pt));
  border: 1px solid transparent;
  border-radius: calc(14 * var(--pt));
  opacity: 0.5;
  transition:
    opacity 400ms ease,
    background 400ms ease,
    border-color 400ms ease,
    box-shadow 400ms ease,
    translate 500ms var(--sites-ease-out);
  animation: sites-rise 700ms var(--sites-ease-out) both;
  animation-delay: calc(300ms + var(--order) * 110ms);
}

.choice.is-on {
  border-color: color-mix(in srgb, var(--choice-tint) 35%, transparent);
  background: #ffffff;
  box-shadow: var(--sites-shadow);
  opacity: 1;
  translate: calc(-6 * var(--pt)) 0;
}

.choice-icon {
  grid-row: 1 / span 2;
  display: grid;
  place-items: center;
  width: calc(40 * var(--pt));
  height: calc(40 * var(--pt));
  border-radius: calc(11 * var(--pt));
  background: color-mix(in srgb, var(--choice-tint) 12%, #ffffff);
  color: var(--choice-tint);
  font-size: calc(20 * var(--pt));
  transition:
    background 400ms ease,
    color 400ms ease;
}

.choice.is-on .choice-icon {
  background: var(--choice-tint);
  color: #ffffff;
}

.choice-title {
  font-size: calc(18 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.25;
}

.choice-note {
  color: var(--codex-fg-muted);
  font-size: calc(13 * var(--pt));
  line-height: 1.35;
}

@keyframes audience-ripple {
  0% {
    opacity: 0.55;
    scale: 1;
  }
  100% {
    opacity: 0;
    scale: 2.1;
  }
}
</style>
