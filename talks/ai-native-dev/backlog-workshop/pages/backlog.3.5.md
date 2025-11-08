---
layout: default
transition: slide-up
section: Backlog.md
---

# Tasks are stored as Markdown files

<div class="flex gap-8 mt-4">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-297 -*.md"
      :sections="['frontmatter', 'Description', 'Acceptance Criteria', 'Implementation Plan', 'Implementation Notes']"
      :click-offset="1"
      max-height="24rem"
      :refresh-interval="2000"
      class="w-260"
    />
    <div class="w-120">
        <ul>
          <li v-click="1">Frontmatter with metadata</li>
          <li v-click="2">Description (WHY)</li>
          <li v-click="3">Acceptance Criteria (WHAT)</li>
          <li v-click="4">Implementation Plan (HOW)</li>
          <li v-click="5">Implementation Notes (PR notes)</li>
        </ul>
        <card v-click="6" class="mt-10">
            #1 review step!
        </card>
    </div>
</div>
