---
layout: default
timeline:
    preset: backlog-flow
    current: implementation-plan
---

<div class="flex gap-8">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-315 -*.md"
      :sections="['Implementation Plan']"
      :click-offset="1"
      max-height="24rem"
      class="w-140"
    />
    <div class="w-120">
        <ul>
          <li v-click="1">Implementation Plan ready ✅</li>
        </ul>
        <card v-click="2">
            2st review step!
        </card>
    </div>
</div>

