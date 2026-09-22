# Brag Plan: groma.md

## What is this app?
Groma scans a repository and draws it as a live C4 architecture map in the browser. The map is stored as plain Markdown in Git, updates when code changes, and shows where coding agents are working.

## The angle
Agents write the code now, and most people no longer read every diff. That is "being in the dark". The video starts in the dark (Groma's own blueprint theme), then turns the lights on: the same map, on paper, alive. Every shot after that is the real product, filmed frame by frame from a running `groma web`, never a mockup. The closing line is Alex's talk title: "In the loop. Not in the dark."

Source for the angle: the flash talk (`talks/groma/flash`), the Devoxx deck concept (dark to light), and the README tagline "Your architecture, alive."

## Hook (first 4 seconds, two bars of music)
A glowing blueprint map glides past in the dark. Two lines, one per bar:
1. "Agents write the code."
2. "You're in the dark."
On the downbeat at 4.02 s a diagonal light sweep turns the blueprint into the paper map. Same camera, same frame: only the light changes.

## Key moments (the middle)
- **Lights on (4.0 to 8.0 s).** Wordmark "groma.md" and "Your architecture, alive." Then a terminal chip types `groma web`, and the flat map lifts apart into its three C4 layers (System, Container, Component). Caption: "Scans your code. Draws the map."
- **Walk it (8.0 to 12.0 s).** Real input on the real app: type "web h" in search (components and tasks both show up), press Enter and the camera dives to the "Web host" component with its glow, then "How it's built", then the source file opens. Captions: "Find anything." / "Read what it does." / "Open the code."
- **Trace a flow (12.0 to 16.0 s).** The "Scan project source" flow, steps 1 to 4, one per beat, with the green path and the camera following. Caption: "Trace a flow, step by step."
- **Watch agents build (16.0 to 20.0 s, the music lifts here).** A timelapse of a small order service built by an agent with Backlog.md tasks: task pins drop, components appear, a commit counter runs to 48. Caption: "Watch your agents build."
- **Your stack (20.0 to 21.5 s).** Twelve language chips cascade in: TypeScript, JavaScript, Angular, React, Vue, C#, Go, Java, Python, Rust, PHP, Swift.

## Outro / punchline
`npm i -g groma.md` types itself, then `groma web`. "Free. MIT. Local." The wordmark and groma.md. Last line, held: "In the loop. Not in the dark."

## User flow worth showing
Run `groma web` in a repo, then the map appears, then click a component to read what it does and open its source, then step through a flow, then watch tasks and new components land while agents work.

## Tone
- Preset: cinematic (structure and reveals), with app-store cleanliness in the feature beats
- Creative direction (from Alex): "stunning, mouths open, want to install it immediately; better and more appealing than the flash talk"
- Interpretation: one dramatic device (dark to light), then fast, confident product shots cut on the beat. Few words, large type, real footage. No jokes, no mockups, no claims beyond the README.

## Format: landscape, 1920x1080, 60 fps
## Duration: 31 seconds (Alex asked for more room than the /brag 25 s guideline)

## Visual identity (from the project)
- Background: paper `#F7F6F2` (deck) and `#FFFFFF` (product light theme); dark act `#07152B` (product blueprint theme)
- Accent: Groma green `#1D9E75`
- Text: ink `#171B1A` on paper, `#D8F3FF` on blueprint
- Display font: Inter (700 and 800, tight tracking), as in the decks
- Body and label font: IBM Plex Mono, close to the product's monospace UI
- Strongest visual element: the isometric map itself, especially the exploded Layers view and a traced flow

## Share copy (draft)
Agents write the code. groma.md keeps you in the loop: a live architecture map of your repo, in plain Markdown. `npm i -g groma.md`, then `groma web`.

## Audio direction
- Role: cinematic support that turns into a confident rhythmic layer
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120 BPM, 8 bar intro, lift at 16.02 s)
- Music treatment: starts at 0, volume 0.34, slightly lower under the dark hook, fades out over the last 1.2 s
- Music cue guidance: preset read from `assets/music/cues/`. Bars every 2 s from 0.02. Strong cues used: 16.02 (timelapse starts), 4.02 (lights on, a bar line), 23.02 (closing line). Beat grid windows: walk beats 8.02/9.02/10.02, flow steps 12.02/13.02/14.02/15.02, timelapse commits on sixteenths from 16.02, language chips on eighths from 20.02
- Audio-reactive treatment: subtle. Music energy breathes the green glow behind the wordmark and the frame's corner marks. No waveforms.
- SFX posture: moderate and motion matched. A low hit on lights on, soft clicks on the real clicks, light ticks in the timelapse, key presses on the typed commands, one bell on the final line.
- Audio-coupled moments: typed `groma web` and `npm i -g groma.md`, the three clicks in the walk, the four flow steps, the commit run, the chip cascade
- Restraint rule: nothing louder than the music hit at 4.02; no SFX on every commit

## Storyboard

### Scene 1: In the dark, 0.0 to 4.0 s
Blueprint theme, map only, camera glides and slowly pulls back over Groma's own architecture. Line 1 at 0.3 s "Agents write the code." (holds 1.5 s). Line 2 at 2.02 s "You're in the dark." (holds 1.7 s); the map dims as it lands.
Sequential/interaction: none
Audio intent: quiet, a little tense
Audio-coupled idea: a soft low thud under line 2
Music: intro bars 1 and 2, held slightly lower
Transition mood: dramatic (diagonal light sweep with a flash) into Scene 2

### Scene 2: Lights on, 4.0 to 8.0 s
The same shot, now the light paper theme. Wordmark "groma.md" and "Your architecture, alive." land on 4.02 and hold 1.8 s. At 6.02 a terminal chip types `groma web`; the map lifts into System, Container, Component layers and orbits slightly. Caption: "From system to component." (holds 1.6 s). It no longer says the scan draws this finished map.
Sequential/interaction: typed command, then the layers separate
Audio intent: release, brightness
Audio-coupled idea: key ticks on the typed command; a soft rise as the layers lift
Transition mood: clean (camera settles, cut on the bar) into Scene 3

### Scene 3: Walk it, 8.0 to 12.0 s
Full app chrome inside a framed card on the paper sheet. 8.02 click the search box and type "web h" (results list components and tasks), 9.02 Enter: the camera dives to the "Web host" component (green glow, panel "What it does"), 10.02 the "How it's built" tab lists its source files, 11.02 `src/viewers/web/server.ts` opens with syntax highlighting. The card pushes in toward the panel, then toward the code. Captions: "Find anything." (8.0 to 9.0) / "Read what it does." (9.0 to 10.9) / "Open the code." (11.0 to 12.0).
Sequential/interaction: typed search, Enter, two clicks, all with a visible cursor
Audio intent: tactile, precise
Audio-coupled idea: key presses on the typed search, one mouse click per beat, a swish on the dive
Transition mood: clean into Scene 4

### Scene 4: Trace a flow, 12.0 to 16.0 s
The "Scan project source" flow. Steps 1, 2, 3, 4 on 12.02, 13.02, 14.02, 15.02. The green dashed path runs, the camera follows each step, the step list highlights on the right. Caption for the whole scene: "Trace a flow, step by step."
Sequential/interaction: four steps, one per beat
Audio intent: forward motion
Audio-coupled idea: a soft switch tick per step
Transition mood: hard cut on the lift into Scene 5

### Scene 4b: Scan, then curate, 16.02 to 20.02 s (added 2026-09-22)
Real footage of the demo order service. On the music's lift, "Groma scans your code." over the raw first scan: one container named `order-service`, nine grey blocks named after files, a grey STARTING POINT tag. On the 17.52 beat, "Your agent curates it." while the map glides into the curated architecture (container "API server", groups Delivery, Shopping, Fulfilment and Integrations, the Customer, the Payment provider and Email service), filmed with Groma's map morph at 0.35x. A green YOUR ARCHITECTURE tag lands at 19.52. Everything after this scene moves 4 s later; the ending now shows INSTALL, SCAN, CURATE and holds the closing line about 3.5 s.

### Scene 5: Watch agents build, 16.0 to 20.0 s
The demo order service grows from an empty map: planned tasks pin themselves, components appear as the agent's commits land, tasks flip to done. Overlay: a large commit counter running 1 to 48 and the current commit subject. Caption: "Watch your agents build." The finished map holds for the last half second.
Sequential/interaction: 48 commits in about 3.5 s, then a hold
Audio intent: momentum, the music lift does the work
Audio-coupled idea: light ticks on every fourth commit, a chip sound when the last task completes
Transition mood: clean into Scene 6

### Scene 6: Your stack, 20.0 to 21.5 s
Paper background, the finished map faint behind. Headline "Works with your stack." Twelve language chips cascade in on eighth notes and hold together for 0.6 s.
Sequential/interaction: twelve chips, revealed fast, held as a set
Audio intent: light, quick
Audio-coupled idea: one card sound for the cascade, not twelve
Transition mood: clean into Scene 7

### Scene 7: Install, 21.5 to 25.0 s
Paper sheet with the drawing frame from the decks. Terminal line types `npm i -g groma.md`, then `groma web` under it. Chips: "Free. MIT. Local." Wordmark with groma.md. On 23.02 the closing line lands and holds to the end: "In the loop. Not in the dark."
Sequential/interaction: typed commands, then the closing line
Audio intent: confident finish
Audio-coupled idea: key ticks on the typing, one bell on the closing line
Music: fades out from 23.8 to 25.0

**Music mood for this video:** cinematic, turning upbeat
**Audio summary:** A held-back intro under the dark hook, a hit on lights on, clicks and ticks that follow the real interactions, the track's own lift under the timelapse, and a clean fade under the closing line.

## Claims check
Everything on screen is in the README today: live C4 map, source behind every component, flows, Backlog.md task pins, 12 language scanners, free, MIT, local, `npm i -g groma.md`, `groma web`. No drafts, no design-first planning. The timelapse is a demo project built with the real CLIs; the rest is Groma's own repository. Footage shows Groma at commit 3ce5689b (the last commit), not the header redesign that is in progress in the working tree.
