---
layout: default
timeline:
    preset: backlog-flow
    current: implementation-plan
---

<div class="flex gap-8 mt-4">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-319 -*.md"
      :sections="['Implementation Plan']"
      :click-offset="1"
      max-height="24rem"
      :refresh-interval="2000"
      class="w-260"
    />
    <div class="w-120">
        <ul>
          <li >✅ Frontmatter with metadata</li>
          <li >✅ Description (WHY)</li>
          <li >✅ Acceptance Criteria (WHAT)</li>
          <li v-click="1">✅ Implementation Plan (HOW)</li>
        </ul>
        <card v-click="2" class="mt-10">
            2st review step!
        </card>
    </div>
</div>

