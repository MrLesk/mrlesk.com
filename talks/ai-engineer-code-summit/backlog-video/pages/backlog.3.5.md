---
layout: default
transition: slide-up
section: Backlog.md
---

# Tasks are stored as Markdown files

<div class="flex gap-8">
    <MarkdownSectionViewer
      file="/Users/agavrilescu/Projects/Backlog.md/backlog/tasks/task-315 - Fix-NixOS-flake-to-use-baseline-Bun-for-build-process.md"
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
    </div>
</div>

