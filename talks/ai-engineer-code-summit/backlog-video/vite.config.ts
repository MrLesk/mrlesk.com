import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const homeDir = homedir()
const projectsDir = resolve(homeDir, 'Projects')
const backlogDir = resolve(projectsDir, 'Backlog.md')

export default defineConfig({
  server: {
    fs: {
      allow: [
        // Allow accessing files from the Backlog.md directory
        backlogDir,
        // Allow accessing the Projects directory
        projectsDir,
      ],
    },
  },
})
