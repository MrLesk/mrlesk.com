---
layout: default
timeline:
    preset: backlog-flow
    current: task-creation
---

<div class="flex gap-8 mt-4">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-318 -*.md"
      :sections="['frontmatter', 'Description', 'Acceptance Criteria']"
      :click-offset="1"
      max-height="24rem"
      :refresh-interval="2000"
      class="w-260"
    />
    <div class="w-120">
        <ul>
          <li v-click="1">✅ Frontmatter with metadata</li>
          <li v-click="2">✅ Description (WHY)</li>
          <li v-click="3">✅ Acceptance Criteria (WHAT)</li>
        </ul>
        <card v-click="4" class="mt-10">
            #1 review step!
        </card>
    </div>
</div>

