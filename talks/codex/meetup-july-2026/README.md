# Codex Meetup: July 2026

## Automatic Realtime slide director

The play and presenter views can listen to the presenter's microphone and use OpenAI Realtime
to infer slide transitions from the talk itself. It does not require spoken
"next slide" commands and it never produces audible model output. This control
is intentionally available only from the local Slidev development server; it
does not appear in the statically deployed deck.

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
the model is listening. After the presenter has spoken, three seconds of
continuous silence advances one slide if the model has not already done so.

Fast mode is the default. It uses `gpt-realtime-1.5` with server VAD tuned to
close a speech turn after 350 ms of silence. To favor reasoning quality over
latency, add `SLIDE_DIRECTOR_MODE=balanced` to `.env`; balanced mode uses
`gpt-realtime-2.1` with high-eagerness semantic VAD.

The browser sends microphone audio directly to OpenAI Realtime over WebRTC.
The Vite server creates the session through OpenAI's unified Realtime endpoint,
so `OPENAI_API_KEY` never enters the browser bundle. Every model turn is forced
to choose exactly one silent function:
`next_slide`, `previous_slide`, or `hold_slide`.

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
