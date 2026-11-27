<script setup lang="ts">
import { CHALLENGES, OPEN_TRACKS, type RoomRoute } from '../lib/event'

// "Before you start": which room each challenge and each open build track sits in.
// Everything comes in by itself, so the slide has no clicks.

function haveSameRooms(route: RoomRoute, other?: RoomRoute): boolean {
  return other !== undefined && route.rooms.join() === other.rooms.join()
}

/** True when this challenge sits in the room of the challenge before it, which already shows the room. */
function sharesRoomAbove(index: number): boolean {
  return haveSameRooms(CHALLENGES[index], CHALLENGES[index - 1])
}

/** How many challenges in a row, from this one on, sit in this challenge's room. */
function rowsInThisRoom(index: number): number {
  let rows = 1
  while (haveSameRooms(CHALLENGES[index], CHALLENGES[index + rows])) rows++
  return rows
}
</script>

<template>
  <div class="rooms">
    <section class="rooms-group" style="--group: 0">
      <h2>Challenges</h2>
      <div class="rooms-grid">
        <template v-for="(challenge, index) in CHALLENGES" :key="challenge.name">
          <span class="room-badge" :style="{ '--order': index }">{{ index + 1 }}</span>
          <span class="room-name" :style="{ '--order': index }">{{ challenge.name }}</span>
          <span class="room-arrow" :style="{ '--order': index }" />
          <!-- Challenges that sit in one room share one room sign, which is as tall as their rows. -->
          <span
            v-if="!sharesRoomAbove(index)"
            class="room-sign"
            :style="{ 'gridRow': `span ${rowsInThisRoom(index)}`, '--order': index }"
          >{{ challenge.rooms.join(' + ') }}</span>
        </template>
      </div>
    </section>

    <section class="rooms-group" style="--group: 1">
      <h2>Open build tracks</h2>
      <div class="rooms-grid">
        <template v-for="(track, index) in OPEN_TRACKS" :key="track.name">
          <span class="room-badge is-open" :style="{ '--order': index + 4 }">
            <ph-code-bold v-if="index === 0" /><ph-lightbulb-fill v-else />
          </span>
          <span class="room-name" :style="{ '--order': index + 4 }">{{ track.name }}</span>
          <span class="room-arrow" :style="{ '--order': index + 4 }" />
          <span class="room-sign" :style="{ '--order': index + 4 }">{{ track.rooms.join(' + ') }}</span>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.rooms {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: calc(16 * var(--pt));
  padding-bottom: calc(14 * var(--pt));
}

.rooms-group {
  display: flex;
  flex-direction: column;
  padding: calc(20 * var(--pt)) calc(22 * var(--pt));
  border-radius: calc(18 * var(--pt));
  border: 1px solid var(--deck-line);
  background: linear-gradient(180deg, #ffffff 0%, var(--deck-panel) 100%);
  animation: deck-rise 700ms var(--deck-ease-out) both;
  animation-delay: calc(150ms + var(--group) * 150ms);
}

.rooms-group h2 {
  margin: 0 0 calc(14 * var(--pt)) 0;
  font-size: calc(15 * var(--pt));
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--codex-fg-muted);
}

/* One row per challenge: its number, its name, an arrow and the room sign. */
.rooms-grid {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr calc(34 * var(--pt)) auto;
  align-items: center;
  align-content: space-evenly;
  column-gap: calc(12 * var(--pt));
  row-gap: calc(12 * var(--pt));
}

.room-badge,
.room-name,
.room-sign {
  animation: deck-rise 600ms var(--deck-ease-out) both;
  animation-delay: calc(500ms + var(--order) * 140ms);
}

.room-badge {
  width: calc(38 * var(--pt));
  height: calc(38 * var(--pt));
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--codex-accent-soft);
  color: var(--codex-accent);
  font-size: calc(19 * var(--pt));
  font-weight: 700;
}

.room-badge.is-open {
  background: #f1e9ff;
  color: var(--codex-grad-3);
}

.room-name {
  font-size: calc(18 * var(--pt));
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

/* The arrow draws itself from the name towards the room. */
.room-arrow {
  position: relative;
  height: calc(2 * var(--pt));
  border-radius: calc(1 * var(--pt));
  background: var(--codex-accent);
  transform-origin: left center;
  animation: room-arrow-draw 500ms var(--deck-ease-out) both;
  animation-delay: calc(700ms + var(--order) * 140ms);
}

.room-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: calc(8 * var(--pt));
  height: calc(8 * var(--pt));
  border-top: calc(2 * var(--pt)) solid var(--codex-accent);
  border-right: calc(2 * var(--pt)) solid var(--codex-accent);
  translate: 0 -50%;
  rotate: 45deg;
}

@keyframes room-arrow-draw {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

.room-sign {
  align-self: stretch;
  min-width: calc(80 * var(--pt));
  padding: calc(8 * var(--pt)) calc(12 * var(--pt));
  border-radius: calc(12 * var(--pt));
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--codex-grad-2), var(--codex-grad-3));
  color: #ffffff;
  font-size: calc(20 * var(--pt));
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  box-shadow: 0 calc(6 * var(--pt)) calc(16 * var(--pt)) rgba(52, 66, 224, 0.25);
  animation-delay: calc(850ms + var(--order) * 140ms);
}
</style>
