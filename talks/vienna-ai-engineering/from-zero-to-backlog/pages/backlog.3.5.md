---
layout: default
section: Backlog.md
---

# What else you got? (Said Claude)

<div v-click class="task-cheatsheet h-80">

| Action      | Example                                              |
|-------------|------------------------------------------------------|
| Create task | `backlog task create "Add OAuth System"`                    |
| Create with description | `backlog task create "Feature" -d "Add authentication system"` |
| Create with assignee | `backlog task create "Feature" -a @sara`           |
| Create with status | `backlog task create "Feature" -s "In Progress"`    |
| Create with labels | `backlog task create "Feature" -l auth,backend`     |
| Create with priority | `backlog task create "Feature" --priority high`     |
| Create with plan | `backlog task create "Feature" --plan "1. Research\n2. Implement"`     |
| Create with AC | `backlog task create "Feature" --ac "Must work,Must be tested"` |
| Create with notes | `backlog task create "Feature" --notes "Started initial research"` |
| Create with deps | `backlog task create "Feature" --dep task-1,task-2` |
| Create sub task | `backlog task create -p 14 "Add Login with Google"`|
| Create (all options) | `backlog task create "Feature" -d "Description" -a @sara -s "To Do" -l auth --priority high --ac "Must work" --notes "Initial setup done" --dep task-1 -p 14` |
| List tasks  | `backlog task list [-s <status>] [-a <assignee>] [-p <parent>]` |
| List by parent | `backlog task list --parent 42` or `backlog task list -p task-42` |
| View detail | `backlog task 7` (interactive UI, press 'E' to edit in editor) |
| View (AI mode) | `backlog task 7 --plain`                           |
| Edit        | `backlog task edit 7 -a @sara -l auth,backend`       |
| Add plan    | `backlog task edit 7 --plan "Implementation approach"`    |
| Add AC      | `backlog task edit 7 --ac "New criterion" --ac "Another one"` |
| Remove AC   | `backlog task edit 7 --remove-ac 2` (removes AC #2)      |
| Remove multiple ACs | `backlog task edit 7 --remove-ac 2 --remove-ac 4` (removes AC #2 and #4) |
| Check AC    | `backlog task edit 7 --check-ac 1` (marks AC #1 as done) |
| Check multiple ACs | `backlog task edit 7 --check-ac 1 --check-ac 3` (marks AC #1 and #3 as done) |
| Uncheck AC  | `backlog task edit 7 --uncheck-ac 3` (marks AC #3 as not done) |
| Mixed AC operations | `backlog task edit 7 --check-ac 1 --uncheck-ac 2 --remove-ac 4` |
| Add notes   | `backlog task edit 7 --notes "Completed X, working on Y"` (replaces existing) |
| Append notes | `backlog task edit 7 --append-notes "New findings"` |
| Add deps    | `backlog task edit 7 --dep task-1 --dep task-2`     |
| Create draft | `backlog task create "Feature" --draft`             |
| Draft flow  | `backlog draft create "Spike GraphQL"` → `backlog draft promote 3.1` |
| Demote to draft| `backlog task demote <id>` |
| Archive     | `backlog task archive 7`                             |
| Search tasks       | `backlog search "auth"`                        |
| Filter by status   | `backlog search "api" --status "In Progress"`   |
| Filter by priority | `backlog search "bug" --priority high`        |
| Combine filters    | `backlog search "web" --status "To Do" --priority medium` |
| Plain text output  | `backlog search "feature" --plain` (for scripts/AI) |
| Kanban board      | `backlog board` (interactive UI, press 'E' to edit in editor) |
| Export board | `backlog board export [file]` (exports Kanban board to markdown) |
| Export with version | `backlog board export --export-version "v1.0.0"` (includes version in export) |
| Project overview | `backlog overview` (interactive TUI showing project statistics) |
| Web interface | `backlog browser` (launches web UI on port 6420) |
| Web custom port | `backlog browser --port 8080 --no-open` |
| Create doc | `backlog doc create "API Guidelines"` |
| Create with path | `backlog doc create "Setup Guide" -p guides/setup` |
| Create with type | `backlog doc create "Architecture" -t technical` |
| List docs | `backlog doc list` |
| View doc | `backlog doc view doc-1` |
| Create decision | `backlog decision create "Use PostgreSQL for primary database"` |
| Create with status | `backlog decision create "Migrate to TypeScript" -s proposed` |
| Update agent files | `backlog agents --update-instructions` (updates CLAUDE.md, AGENTS.md, GEMINI.md, .github/copilot-instructions.md) |
| Cleanup done tasks | `backlog cleanup` (move old completed tasks to completed folder) |
| View all configs | `backlog config list` |
| Get specific config | `backlog config get defaultEditor` |
| Set config value | `backlog config set defaultEditor "code --wait"` |
| Enable auto-commit | `backlog config set autoCommit true` |
| Bypass git hooks | `backlog config set bypassGitHooks true` |
| Enable cross-branch check | `backlog config set checkActiveBranches true` |
| Set active branch days | `backlog config set activeBranchDays 30` |

</div>

<style scoped>

.task-cheatsheet {
  @apply mt-10 rounded-3xl border border-white/10 bg-[#282A36] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.65)];
  padding: 1rem;
  max-height: 24rem;
  overflow: auto;
  font-family: var(--slidev-code-font, 'Fira Code', monospace);
  font-size: 0.72rem;
  line-height: 1.4;
  color: #F8F8F2;
}

.task-cheatsheet :deep(table) {
  width: 100%;
  border-collapse: collapse;
}

.task-cheatsheet :deep(thead) {
  background: #282A36;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.68rem;
  color: #BD93F9;
}

.task-cheatsheet :deep(th),
.task-cheatsheet :deep(td) {
  padding: 0.45rem 0.75rem;
  text-align: left;
}

.task-cheatsheet :deep(th) {
  font-weight: 600;
}

.task-cheatsheet :deep(td:first-child) {
  width: 14rem;
  font-weight: 600;
  color: #FFB86C;
}

.task-cheatsheet :deep(tr + tr td) {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.task-cheatsheet :deep(code) {
  display: inline-block;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: rgba(30, 31, 42, 0.7);
  color: #50FA7B;
}
</style>
