---
layout: default
section: Spec-driven flow
timeline:
    preset: backlog-flow
    current: prd
hideIndicator: true
---

<img class="w-180 m-auto -mt-4" src="/flow.2.svg"/>

<EmbeddedTerminalFrame
  v-click
  class="max-w-220 h-76 mt-2"
  src="http://localhost:7682"
  fallback-image="/prd.png">
  <template #paste>
    <div v-pre>
      Backlog.md - Task scheduling feature
      <br><br>
      Goal: Allow scheduling tasks to start at a specific time<br>
      <br>
      - Add a virtual status for Backlog.md tasks: "Scheduled"<br>
      - Tasks should have a new "StartAfter" field<br>
      - When Backlog.md starts, create a timer for each task with a StartAfter field and move it to "In progress"<br>
      - This should trigger the existing onStatusChange command if present<br>
      <br>
      Write a very minimal PRD document in the root of the project.
    </div>
  </template>
</EmbeddedTerminalFrame>
