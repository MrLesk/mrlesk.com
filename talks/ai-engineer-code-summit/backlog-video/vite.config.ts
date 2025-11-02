import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'
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
  plugins: [
    {
      name: 'directory-listing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Check if this is a directory listing request for @fs paths
          if (req.url?.startsWith('/@fs/') && req.headers['x-markdown-section-viewer'] === 'dir-list') {
            try {
              // Remove /@fs prefix and query params
              const fsPath = req.url.slice(4).split('?')[0]
              const decodedPath = decodeURIComponent(fsPath)

              // Try to read directory
              const entries = readdirSync(decodedPath, { withFileTypes: true })

              // Generate simple HTML directory listing
              const html = `
<!DOCTYPE html>
<html>
<head><title>Directory listing</title></head>
<body>
${entries
  .filter(entry => entry.isFile())
  .map(entry => `<a href="${encodeURIComponent(entry.name)}">${entry.name}</a>`)
  .join('\n')}
</body>
</html>
              `.trim()

              res.setHeader('Content-Type', 'text/html')
              res.end(html)
              return
            } catch (error) {
              // Not a directory or error reading, continue
              next()
              return
            }
          }
          next()
        })
      },
    },
  ],
})
