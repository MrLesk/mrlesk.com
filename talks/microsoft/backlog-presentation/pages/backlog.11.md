---
layout: default
transition: slide-up
section: Backlog.md
hideIndicator: true
---

# It has a TUI (Terminal User Interface)

<v-switch>
<template #1>
<div class="flex flex-col items-center justify-center gap-6 mt-20">
<card v-click="1" class="text-3xl font-bold text-center">
  Have you ever seen a terminal Kanban board?
</card>
<card v-click="2" class="text-lg font-bold text-center">
  In June 2025, there were none, so I made one.
</card>
</div>
</template>
 <template #3>
<TtydFrame
class="mt-8 w-200 h-100"
:src="$frontmatter.terminalSrc"
fallback-image="/backlog-board.png"
:allow-inputs="true"
/>
</template>

</v-switch>
