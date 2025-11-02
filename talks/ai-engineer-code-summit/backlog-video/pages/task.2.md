---
layout: default
---

# Ask Claude to create the task

<div v-click="1" class="absolute opacity-0 pointer-events-none">.</div>

<TtydFrame class="max-w-220 h-100" src="http://localhost:7682" :click-offset="0">
  <template #click-1>
    Create a new task for implementing a move mode feature in the backlog board. The task should: allow users to press 'm' to enter move mode, highlight the current task for moving, support arrow keys for reordering (up/down) and changing status (left/right), show footer instructions, and allow confirming with Enter or 'm', and canceling with Esc
  </template>
</TtydFrame>
