#!/usr/bin/env bun

/**
 * Simple HTTP server that forwards text to tmux sessions via send-keys
 */

const PORT = 3031

Bun.serve({
  port: PORT,
  async fetch(req) {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    if (req.method === 'POST' && new URL(req.url).pathname === '/send-keys') {
      try {
        const body = await req.json()
        const { session, text } = body

        if (!session || !text) {
          return new Response(
            JSON.stringify({ error: 'Missing session or text' }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          )
        }

        // Use tmux send-keys to inject text into the session
        const result = Bun.spawnSync({
          cmd: ['tmux', 'send-keys', '-t', session, '-l', text],
          stdout: 'pipe',
          stderr: 'pipe',
        })

        // Send Enter key
        Bun.spawnSync({
          cmd: ['tmux', 'send-keys', '-t', session, 'Enter'],
          stdout: 'pipe',
          stderr: 'pipe',
        })

        if (result.exitCode !== 0) {
          const error = new TextDecoder().decode(result.stderr)
          console.error(`[send-keys-api] Failed to send keys to session ${session}:`, error)
          return new Response(
            JSON.stringify({ error: `tmux error: ${error}` }),
            { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`[send-keys-api] Sent text to session ${session}: ${text.substring(0, 50)}...`)

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      } catch (e) {
        console.error('[send-keys-api] Error:', e)
        return new Response(
          JSON.stringify({ error: String(e) }),
          { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response('Not Found', { status: 404, headers })
  },
})

console.log(`[send-keys-api] Listening on http://localhost:${PORT}`)
