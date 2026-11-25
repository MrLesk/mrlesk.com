# OpenAI GPT-Live 1 on stage

Eight visual slides for a roughly six-minute showcase of OpenAI GPT-Live 1 through a Slidev Speech Navigation demo, with a seventh minute available for pauses or questions. Uses the shared Codex light theme with deck-local layouts and styling.

## Run

```sh
cd /Users/alex/projects/mrlesk.com/talks/slidev/speech-navigation
bun install
bun run dev
```

This checkout uses the addon at `../../../../slidev-addon-speech-navigation`, so it follows Alex's local plugin source. On another computer, keep the same sibling repository layout or replace the package dependency with a released addon version. The shared site build already declares a pinned GitHub addon dependency.

## Live speech

Put your OpenAI API key in an ignored `.env` file in this directory as `OPENAI_API_KEY`, then restart Slidev. Do not add credentials to slides or commit them. No key is bundled with the deck.

1. Open the Presenter URL printed by Slidev. Keep the audience display on the ordinary slide URL.
2. Allow the addon to prepare all eight slides and their reveal images.
3. Wait for **Learning slides** to finish and **Ready** to appear. Then click **Speech nav**, allow microphone access, and wait for **Listening**.
4. Present using the notes in `slides.md`. They include natural topic transitions, timings, and the intentional pause on slide 6.
5. Turn speech navigation off at the end.

Slide 5 uses a vector microphone with an animated red dot. This icon does not show live status. The three audio states on slide 6 and the rehearsal panel on slide 7 are also examples.

The addon requires Slidev 52+, Node 22.12+, a microphone, and online OpenAI API access. It works in local Presenter view. Static builds and PDFs do not run speech navigation. This deck enables speech reveals with `speechNavigation.reveals: speech`. Slide 2 shows one benefit at a time from speech. Manual clicks also work. The final slide uses `speechNavigation.hold: true` to keep the QR code visible during questions.

Use the main presenter button to **Pause** or **Resume**. The adjacent **Stop** button ends the session. Open **Speech controls** to set up **Rehearsal**. Rehearsal shows suggestions without changing the view. The panel also shows recent speech and a short reason for the last decision. Pause mutes the audio track but keeps the connection open.

## Rehearsal

| Slide | Target time | Speaking goal |
| --- | --- | --- |
| 1. OpenAI GPT-Live 1 on stage | 0:00–0:40 | Introduce the voice model and the live Slidev demo. |
| 2. Use both hands | 0:40–1:20 | Explain each benefit in order. Let speech show each item, or use a manual click. |
| 3. Use images and notes | 1:20–2:05 | Explain slide images and speaker notes. |
| 4. OpenAI voice. Slidev actions. | 2:05–2:50 | Show live audio through GPT-Live 1, then slide decisions through GPT-5.6 Luna. |
| 5. Set up the addon | 2:50–3:40 | Show installation, both model options, speech reveals, and the microphone control. |
| 6. Pause when you need to | 3:40–4:35 | Select Pause, wait 3–5 seconds, then select Resume. Explain that the connection stays open. |
| 7. You have control | 4:35–5:35 | Show rehearsal suggestions, speech feedback, and the per-slide hold rule. |
| 8. Use it for your next talk | 5:35–6:00 | Leave the repository QR visible for questions. |

Optional backward demo: on slide 7, clearly revisit pacing to return to slide 6. Explain pacing briefly, then clearly return to manual controls. Rehearse this loop first. Skip it when time is short.

The model can advance when it considers an idea complete, so these notes describe speaking goals rather than exact trigger phrases. Test with your microphone, speaking pace, and network. Keep a keyboard or remote ready. If necessary, switch `speechNavigation.behavior` to `careful` and rehearse again.

## Build and export

```sh
bun run build
bun run export
```

The build goes into `dist/`. PDF export produces `speech-navigation.pdf`. Both are ignored build artifacts. The PDF shows completed slides. Slide 2 has three click reveals; there are no timed slide changes.

The deck pins `floating-vue` to 5.2.2, the version used by the existing July lightning deck, to avoid an incompatible tooltip patch in the current transitive dependency.

## Visuals and sources

- `public/voice-slides.png` and `public/hands-free.png`: created with built-in ImageGen for this deck. The presenter is fictional.
- Slide 2 uses `public/alex-speaker-laptop.png`, a stylized likeness based on Alex's supplied photo with the laptop and stand preserved, and `public/audience-full-feet.png`, a separate audience image showing full legs and chairs behind a translucent frosted footer. Both were created with built-in ImageGen. The original photo is not bundled with the deck.
- Slide 3 uses the original speaker and audience images. This removes the small text and duplicate footer from the old slide screenshot. The note is an example instruction.
- Diagrams in `components/` remain editable SVG or HTML inside Vue components. Slide 4 shows four possible actions, including an item reveal. Slide 6 shows Listening, Pause, and Resume. Slide 7 shows an example rehearsal panel with a close icon, transcript, suggestion, and short reason.
- `components/SpeechMicIcon.vue`: vector microphone using the addon's original icon paths, with a pulsing red indicator. This is an illustration, not live status. Setup commands use native Slidev code blocks.
- `public/repository-qr.svg`: generated from the repository URL with `qrcode`.
- Feature claims follow the local addon's README, navigation prompts, and client implementation. No accuracy or speed measurements are claimed.

Local sources: `/Users/alex/projects/slidev-addon-speech-navigation/README.md`, `src/core/prompts.ts`, `src/client/director.ts`, and `custom-nav-controls.vue`.

The audience artwork was edited with the built-in image tool to restore the shoes cut off by the original left edge.

## Language

Slide text, diagram labels, image descriptions, and speaker notes use STE writing principles. Instructions use short sentences and direct verbs. Technical terms and actual interface labels remain consistent. The notes explain addon, Presenter view, PNG, API, API key, and YAML. Code, package names, and URLs stay unchanged.

Reference: [ASD-STE100, Issue 9](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf). This is an editorial STE revision, not a certified compliance review.

`uno.config.ts` supplies Slidev’s toolbar style tokens explicitly. This corrects a development-mode style loading issue in Slidev 52.19.1.

## Feature coverage

The deck stays at eight slides. Slide 2 demonstrates speech reveals. Slide 4 explains all four actions. Slide 5 shows `liveModel`, `model`, and `reveals` in native YAML. Slide 6 shows pause and resume. Slide 7 explains rehearsal, decision feedback, and `hold: true`. Slide 8 uses a manual hold while the audience scans the QR code. Detailed limits and behavior settings stay in the speaker notes.

## OpenAI model showcase

The cover, shared footer, architecture slide, setup slide, and closing slide name OpenAI GPT-Live 1. The implementation uses the **Live API** (`/v1/live/sessions`). OpenAI’s **Realtime API** is a separate API. The deck uses the implementation’s exact name.

GPT-Live 1 handles live audio and text updates. GPT-5.6 Luna handles slide images, notes, and navigation decisions. The addon applies the action through Slidev. This demo keeps GPT-Live silent; it does not demonstrate its spoken replies or simultaneous listening and speaking.

Official sources, checked September 15, 2026: [GPT-Live 1](https://developers.openai.com/api/docs/models/gpt-live-1) and [Getting started with GPT-Live](https://developers.openai.com/api/docs/guides/live). Technical source links are also in the speaker notes.
