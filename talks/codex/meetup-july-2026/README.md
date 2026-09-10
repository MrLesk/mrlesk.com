# Codex Meetup: July 2026

## Automatic Live slide director

The play and presenter views can listen to the presenter's microphone and use
OpenAI models to infer slide transitions from the talk itself. It does not
require spoken "next slide" commands and it never produces audible model
output. This control is intentionally available only from the local Slidev
development server; it does not appear in the statically deployed deck.

Create a local environment file and add an OpenAI Platform API key:

```bash
cp .env.example .env
```

```dotenv
OPENAI_API_KEY=sk-...
```

Then start or restart the presentation (`.env` is read when the server starts):

```bash
bun run dev
```

Open the play view at `http://localhost:3030/` or presenter mode at
`http://localhost:3030/presenter/`. Click the small **Auto slides** control in
the lower-right corner of the current slide and grant microphone access once.
`Option+A` on macOS or `Alt+A` toggles it from the keyboard. A green dot means
the model is listening. A pause never advances on its own. GPT-Live transcribes
speech continuously, and GPT-5.6 Luna checks the growing transcript while the
presenter is still talking. Luna compares it with the deck map and chooses
`next_slide`, `previous_slide`, or `hold_slide`.

The defaults are `gpt-live-1` for listening and `gpt-5.6-luna` for slide
decisions. You can override them with `OPENAI_LIVE_MODEL` and
`OPENAI_SLIDE_DECISION_MODEL`. Set
`OPENAI_SLIDE_DECISION_SERVICE_TIER=priority` if your project supports the
priority processing tier and you want lower decision latency.

The browser sends microphone audio directly to GPT-Live over WebRTC. The Vite
server creates the Live session and sends transcript checkpoints to the
Responses API, so `OPENAI_API_KEY` never enters the browser bundle. A late Luna
decision is ignored if the visible slide changed while that request was
running.

The deck-aware system prompt and transition map live in
`scripts/slide-director.ts`. The browser controller lives in
`scripts/realtime-slide-director-client.ts`.

## Local Slidev control

The deck includes a local-only control bridge for low-latency function tools.
It uses Slidev's navigation API directly and skips click animations when moving
between slides.

Start the presentation:

```bash
bun run dev
```

Drive the active slideshow from another process:

```bash
bun run control next
bun run control previous
bun run control state
```

The same interface is available over loopback HTTP:

```bash
curl -X POST http://localhost:3030/__slidev-control \
  -H 'Content-Type: application/json' \
  -d '{"action":"next"}'
```

`POST /__slidev-control` accepts `next` and `previous`. `GET
/__slidev-control` returns the most recently reported slide number. Commands
are sent through Vite's existing development WebSocket and acknowledged by the
active Slidev play view. Requests from non-loopback addresses are rejected.

### External Realtime tool wiring

The built-in browser controller is the recommended path. If a separate Realtime
process is useful, keep its function tools argument-free:

```ts
const tools = [
  { type: 'function', name: 'next_slide', parameters: { type: 'object', properties: {} } },
  { type: 'function', name: 'previous_slide', parameters: { type: 'object', properties: {} } },
]
```

Map tool calls to the exported client:

```ts
import { sendSlideCommand } from './scripts/slidev-control-client'

const handlers = {
  next_slide: () => sendSlideCommand('next'),
  previous_slide: () => sendSlideCommand('previous'),
}
```

Set `SLIDEV_CONTROL_URL` if Slidev starts on a port other than `3030`.
