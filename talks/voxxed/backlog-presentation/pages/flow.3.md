---
layout: default
section: Spec-driven flow
timeline:
    preset: backlog-flow
    current: task-creation
hideIndicator: true
---

<img class="w-2000 m-auto" src="/flow.3.svg"/>

<EmbeddedTerminalFrame
v-click
class="max-w-220 h-76 mt-3"
src="http://localhost:7682"
fallback-image="/task-decomposition.png">
    <template #paste>
        Given the PRD you just created, decompose it into tasks following the Backlog.md workflow.
    </template>
</EmbeddedTerminalFrame>
