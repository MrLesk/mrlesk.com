---
layout: default
section: Spec-driven flow
timeline:
  preset: backlog-flow
  current: task-execution
hideIndicator: true
---

<v-switch>
<template #0>
  <EmbeddedTerminalFrame
  class="max-w-220 h-104 mt-2"
  src="http://localhost:7682"
  fallback-image="/task-execution.png">
    <template #paste>
      <div v-pre>
          You can now have the agents execute the plans and finish the tasks.
          <br>
          Make sure they follow Backlog.md workflows until the end.
      </div>
    </template>
  </EmbeddedTerminalFrame>
</template>
<template #2>
  <EmbeddedTerminalFrame
  class="max-w-220 h-104 mt-2"
  src="http://localhost:7681"
  :allow-inputs="true"
  fallback-image="/backlog-final.png"></EmbeddedTerminalFrame>
</template>
</v-switch>
