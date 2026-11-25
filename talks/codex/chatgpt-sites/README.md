# ChatGPT Sites

Slidev deck for Alex Gavrilescu's session at Vienna Build Day (Saturday 28 November 2026, Main
room, 11:10 to 11:40): a presentation of ChatGPT Sites, followed at once by a workshop in which
everyone builds a first Site. It uses the Codex light theme (`slidev-theme-codex` at the
repository root).

The presentation follows the storyboard and the wording of Alex's earlier deck on the same topic,
made for the DevDay Community Hackathon in Berlin:
https://chatgpt-sites-devday-exchange.mrlesk.chatgpt.site.

Read https://sli.dev/llms.txt before changing how Slidev itself is used.

## Run it

```bash
bun install
bun run dev      # opens the deck in the browser
bun run build    # production build in ./dist
```

The presenter view is at `/presenter`. The speaker notes are in each page file, with a `[click]`
mark where a click belongs and a `⏱` mark for the minute the slide should start.

## Slides

`slides.md` holds the settings of the deck and the order of the slides. Each slide is one file in
`pages/`, and a page's number is its place in the deck. Each animated slide has one component in
`components/`.

| Page | Slide | Component | Clicks |
| --- | --- | --- | --- |
| `01-get-ready.md` | Get ready | `GetReadyStage` | 0 |
| `02-cover.md` | ChatGPT Sites | `SitesPromptLoop` | 0 |
| `03-first-site.md` | Your first site | `FirstSiteStage` | 3 |
| `04-visibility.md` | Visibility | `VisibilityStage` | 2 |
| `05-custom-domain.md` | Custom domain | `DomainStage` | 2 |
| `06-storage-and-database.md` | Storage & database | `StorageStack` | 2 |
| `07-automations.md` | Automations | `AutomationStage` | 2 |
| `08-plans-and-limits.md` | Plans & limits | `PlanStage` | 2 |
| `09-live-demo.md` | Live demo | `LiveSiteFrame` | 0 |
| `10-your-turn.md` | Your turn | `YourTurnStage` | 0 |
| `11-pick-a-starter.md` | Pick a starter | `StarterCards` | 1 |
| `12-your-prompt.md` | Your prompt | `PromptTemplate` | 3 |
| `13-one-change.md` | Ask for one change | `ChangeLoop` | 1 |
| `14-make-it-work.md` | Make it work | `TimedRound` | 1 |
| `15-publish-and-share.md` | Publish and share | `PublishFlow` | 1 |
| `16-neighbor-test.md` | Neighbor test | `TimedRound` | 1 |
| `17-keep-building.md` | Keep building | `NextSteps` | 0 |
| `18-thanks.md` | Thank you | `QrCard` | 0 |

Slide 1 is on screen while people sit down. Slides 2 to 9 are the presentation, slides 10 to 17
the workshop, and slide 18 closes the session.

To add a slide, give its page the number of its place, rename the pages after it, and list it in
`slides.md`. Then move the `⏱` marks of the slides after it (see "The 30 minutes").

The comment at the top of each component says what every click does.

Never add a line called `presenter` to the first block of `slides.md`. The theme's cover layout
reads its footer text from a frontmatter line of that name, which is why the cover page has
one. Slidev has a deck setting with the same name, and in the first block it switches off
Slidev's presenter view.

## The 30 minutes

The session is planned to the minute. The presentation takes about 9 minutes, and everyone
builds for 17 of the 30.

| Minute | Slides | Who is busy |
| --- | --- | --- |
| before 0:00 | 1 Get ready | people sitting down |
| 0:00 | 2 to 9, the presentation | Alex |
| 0:09 | 10 Your turn | Alex |
| 0:10 | 11 Pick a starter, 2 minutes | everyone |
| 0:12 | 12 Your prompt, 2 minutes | everyone |
| 0:14 | 13 Ask for one change, while the Sites build | Alex |
| 0:16 | 14 Make it work, 6 minutes | everyone |
| 0:22 | 15 Publish and share, 2 minutes | everyone |
| 0:24 | 16 Neighbor test, 5 minutes | everyone |
| 0:29 | 17 Keep building, 18 Thank you | Alex |

A time lives in three places. When you change one, change all three:

- the `⏱` mark in the page's speaker notes
- the length of the page's countdown: `:minutes` on `<StationTracker>` or `<TimedRound>`
- the minutes of its station on "Your turn": `STATIONS` in `lib/workshop.ts`

## How the motion works

Each kind of motion has one way to build it.

- **Entrances** are plain CSS animations (`sites-rise` and `sites-pop` in `style.css`). Slidev
  hides every slide but the current one with `display: none`, so an animation starts again each
  time its slide is shown. No script is needed.
- **Clicks** go through `composables/useSlideSteps.ts`. A component calls `useSlideSteps(2)` and
  puts `stepClasses` on its root element. That adds the class `s1` after the first click and `s2`
  after the second. The CSS then describes each step with a transition, for example
  `.s2 .domain-card { ... }`. A click back removes the class, so the step undoes itself. The
  number given to `useSlideSteps` must be the same as `clicks:` in the page's frontmatter.
- **Typing** goes through `composables/useTypewriter.ts`. `useTypedOnStep` types a text when the
  presenter clicks forward onto its step. In the overview, in the presenter's preview of the next
  slide and in exports the whole text is simply there.
- **Loops** keep a slide alive while it stays up: the steps that light up one after another on
  "Get ready", the small scenes on "Pick a starter". They are CSS animations that repeat forever.
  Elements take turns through a `--order` number that sets each one's delay.
- **Clocks** go through `composables/useCountdown.ts` and `components/CountdownTimer.vue`.
- **The running day** on "Automations" is the one place where a script moves things frame by
  frame. `AutomationStage.vue` keeps the made-up time in `hoursSinceMonday` and draws the clock,
  the sky and the runs from it.

A delay belongs on the rule of the step that starts it (`.s2 .thing { transition-delay: ... }`),
never on the base rule. That way things come in one after another, and a click back hides them
all at once.

### The clocks

Every slide where the room works has a countdown: a small one in the corner, or a big one in
the middle.

- The slide's first click starts the clock.
- Once started, a clock runs to zero whatever happens next. You can show another slide and come
  back: it has kept counting.
- A click back within five seconds of the start cancels it. That is the way out of a start by
  mistake.
- At zero the ring turns amber and the time blinks.
- Reloading the page resets every clock.

A slide can hold only one clock, because a clock is named after its slide's number.

## Where to change what

- **The workshop's words and numbers**: `lib/workshop.ts`. It holds the three stations, the
  three starters, the prompt sentence and the deck's address.
- **The example Site** that the presentation follows (its name, headline and addresses):
  `lib/example-site.ts`. Its picture is `components/MiniSite.vue`, and the map in it is
  `components/MapArt.vue`.
- **The schedule on "Automations"**: `TASK` and `RUN_HOUR` in `components/AutomationStage.vue`.
- **Colours and motion curves shared by the mock screens**: the `--sites-` variables at the top of
  `style.css`. The theme's own colours start with `--codex-`.
- **The prompts on the cover**: `PROMPTS` in `components/SitesPromptLoop.vue`.
- **The prompt on "Your first site"**: `PROMPT` in `components/FirstSiteStage.vue`.
- **Plans and numbers**: `PLANS` and `INCLUDED_TODAY` in `components/PlanStage.vue`.
- **The rest of the day on "Keep building"**: `STOPS` in `components/NextSteps.vue`.
- **Icons**: `ICON_PATHS` in `components/SiteIcon.vue`.

## The QR codes

Both QR codes are made from `DECK_URL` in `lib/workshop.ts`, the address of the published deck.

- "Thank you" opens the deck.
- "Pick a starter" opens "Your prompt" on a person's own screen, where the "Copy prompt" button
  copies the prompt that is shown. It leads to `/your-prompt`, the `routeAlias` of
  `pages/12-your-prompt.md`, not to a slide number, so it keeps working when slides move. If you
  rename the alias, change `PROMPT_SLIDE_ALIAS` in `lib/workshop.ts` too.

## The live demo

`pages/09-live-demo.md` frames the participant map. Its `url` is the live Site.

Without more settings the frame shows a drawn map. The arrow button opens the live Site in a new
tab, and Expand lets the frame fill the slide.

To load the live Site inside the slide, add `embed`:

```html
<LiveSiteFrame url="https://your-map.yourname.chatgpt.site" embed />
```

This only works when the Site allows this deck to embed it. A Site lists the addresses that may
embed it in its `Content-Security-Policy` header, under `frame-ancestors`. The Berlin map allows
only the Berlin deck and chatgpt.com, so on this deck its frame stays empty. Ask ChatGPT, in the
Site's own chat, to allow these two addresses:

- `https://mrlesk.com`, for the published deck
- `http://localhost:3030`, for `bun run dev` (use the port your dev server prints)

Check the result with:

```bash
curl -sI https://your-map.yourname.chatgpt.site | grep -i content-security-policy
```

## Facts on the slides

Checked on 2026-11-25. ChatGPT Sites changes often: on that day, the end of free hosting had
moved by a month since the check three days before. Check these again before each talk.

| Fact | Source |
| --- | --- |
| Start with the word "website" or by mentioning `@Sites`; on the web, select Work | [Help Center: Creating and using ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-managing-chatgpt-sites) |
| New Sites are private; who has access is set under Share | Help Center, same article |
| Add a domain you own in the Site's settings; Sites does not register domains | Help Center, and [Sites docs](https://learn.chatgpt.com/docs/sites) |
| Database: 10 GB per Site. File storage: no fixed storage limit | Help Center |
| Automations: open the Site's Automations, select Create schedule, review the task and timing, confirm. Schedules run in the cloud, can be edited, paused or resumed under Scheduled, and can't use app access a visitor approved | Help Center, section "Schedule updates to a Site"; [release notes](https://help.openai.com/en/articles/6825453-chatgpt-release-notes), September 29, 2026 |
| Plus, Pro and Business have Sites; Free and Go do not | Help Center |
| Building and editing a Site count toward the plan's Codex usage | Sites docs, "Usage and cost" |
| "You can create as many Sites as you want." | Sites docs, "Usage and cost" |
| Hosting is free through January 31, 2027 | Sites docs, "Usage and cost" |
| OpenAI plans to start charging on February 1, 2027, above a monthly allowance of 125 credits (Plus), 375 (Pro), 125 per seat (Business). The rates are "approximate" | Sites docs, "Usage and cost" |
| On the web, open the preview and select Edit to describe a change | [Walkthrough: Build a shareable site](https://developers.openai.com/training/walkthroughs/build-a-shareable-site) |
| The times on "Keep building": 11:40, 13:15, 16:00 | The Build Day agenda |

The schedule's task on "Automations" (new guests from the event's guest list) is our example.
OpenAI's docs give no example.

Only in the speaker notes, because no official page states it: Sites has been available in the
UK, the EEA and Switzerland for Plus and Pro since July 20, 2026. This comes from an article
that quotes a post by OpenAI Developers.

Not checked against the product: the three starter prompts in `lib/workshop.ts`. Send each one
to ChatGPT before the event and see what it builds and how long it takes.

## Publishing

The deck is listed in `deploy/talks.json`. A push to `main` that changes it publishes it at
https://mrlesk.com/talks/codex/chatgpt-sites/: GitHub Actions builds it, and the Raspberry Pi
picks up the new release within five minutes (see `deploy/README.md`). It is unlisted: the
site's Talks page does not link to it, so people only reach it through its address or the QR
codes.
