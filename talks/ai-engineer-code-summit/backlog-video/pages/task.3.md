---
layout: default
timeline:
    preset: backlog-flow
    current: task-creation
---

# Tasks are stored as Markdown files

<div class="flex gap-8">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-315 -*.md"
      :sections="['frontmatter', 'Description', 'Acceptance Criteria']"
      :click-offset="1"
      max-height="24rem"
      class="w-140"
    />
    <div class="w-120">
        <ul>
          <li v-click="1">Frontmatter with metadata</li>
          <li v-click="2">Description (WHY)</li>
          <li v-click="3">Acceptance Criteria (WHAT)</li>
        </ul>
        <card v-click="4">
            1st review step!
        </card>
    </div>
</div>

