---
layout: two-cols
---

# What's new in Codex

- Latest model updates
- New CLI capabilities
- IDE integrations
- Community wins from the last meetup

::right::

```ts
// Example: a Codex-powered tool call
const result = await codex.run({
  task: 'Refactor handleAuth() to use the new session API',
  files: ['src/auth.ts'],
})

console.log(result.diff)
```
