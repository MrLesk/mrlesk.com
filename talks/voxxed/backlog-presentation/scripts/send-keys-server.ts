#!/usr/bin/env bun

/**
 * Simple HTTP server that forwards text to tmux sessions via send-keys
 */

const PORT = Number.parseInt(process.env.SEND_KEYS_PORT ?? '3099', 10) || 3099

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
        const { session, text, sendEnter = false } = body

        if (!session) {
          return new Response(
            JSON.stringify({ error: 'Missing session' }),
            { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
          )
        }

        // Use tmux send-keys to inject text into the session (if text provided)
        if (text) {
          const normalized = String(text).replace(/\r\n/g, '\n')
          const needsBracketedPaste = normalized.includes('\n')
          const payload = needsBracketedPaste
            ? `\u001b[200~${normalized}\u001b[201~`
            : normalized

          const result = Bun.spawnSync({
            cmd: ['tmux', 'send-keys', '-t', session, '-l', payload],
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

          if (sendEnter) {
            const enterResult = Bun.spawnSync({
              cmd: ['tmux', 'send-keys', '-t', session, 'Enter'],
              stdout: 'pipe',
              stderr: 'pipe',
            })

            if (enterResult.exitCode !== 0) {
              const error = new TextDecoder().decode(enterResult.stderr)
              console.error(`[send-keys-api] Failed to send Enter to session ${session}:`, error)
              return new Response(
                JSON.stringify({ error: `tmux error: ${error}` }),
                { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
              )
            }
          }
        } else if (sendEnter) {
          const enterResult = Bun.spawnSync({
            cmd: ['tmux', 'send-keys', '-t', session, 'Enter'],
            stdout: 'pipe',
            stderr: 'pipe',
          })

          if (enterResult.exitCode !== 0) {
            const error = new TextDecoder().decode(enterResult.stderr)
            console.error(`[send-keys-api] Failed to send Enter to session ${session}:`, error)
            return new Response(
              JSON.stringify({ error: `tmux error: ${error}` }),
              { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
            )
          }
        }

        console.log(`[send-keys-api] Sent to session ${session}${text ? `: ${text.substring(0, 50)}...` : ' (Enter key)'}`)

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
