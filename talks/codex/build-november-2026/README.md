# Codex Community Build · Vienna

Slidev deck for Alex Gavrilescu's opening and closing of the Codex Community Build at TU Wien
(Saturday 28 November 2026, hosted together with EULiST). It uses the Codex light theme
(`slidev-theme-codex` at the repository root).

Read https://sli.dev/llms.txt before changing how Slidev itself is used.

## Run it

```bash
bun install
bun run dev      # opens the deck in the browser
bun run build    # production build in ./dist
```

The presenter view is at `/presenter`. The speaker notes are in each page file, with a `[click]`
mark where a click belongs.

## The day

| When | Slides | What happens |
| --- | --- | --- |
| before 10:00 | 1 | on screen while people sit down |
| 10:00 | 2 to 7 | the kickoff. After slide 4, EULiST presents for about 10 minutes |
| 10:40 to 17:00 | 8 | stays on screen during build time |
| 17:00 | 9 to 14 | the year in review and the thank-yous |
| 18:00 | 15 | stays on screen during the networking |

## Slides

`slides.md` holds the settings of the deck and the order of the slides. Each slide is one file in
`pages/`, and a page's number is its place in the deck.

| Page | Slide | Component | Clicks |
| --- | --- | --- | --- |
| `01-cover.md` | Codex Community Build | the theme's cover | 0 |
| `02-news.md` | News from OpenAI | `NewsCards` | 4 |
| `03-api.md` | New API goodies to try | `NewsCards` | 6 |
| `04-thank-you-eulist.md` | Thank you, EULiST | `GradientStage` | 0 |
| `05-agenda.md` | Agenda | `AgendaTimeline` | 0 |
| `06-house-rules.md` | House rules | `HouseRules` | 0 |
| `07-before-you-start.md` | Before you start | `RoomGuide` | 0 |
| `08-build-time.md` | Build time | `BuildTimeStage` | 0 |
| `09-year-in-review.md` | A year in review | `YearInReview` | 8 |
| `10-thank-you-community.md` | Thank you, community | `PhotoWall` | 0 |
| `11-thank-you-staff.md` | Thank you, staff | `GradientStage` | 0 |
| `12-thank-you-hosts.md` | Thanks again, EULiST and TU Wien | `GradientStage` | 0 |
| `13-fiancee.md` | Thank you | `FianceeReveal` | 1 |
| `14-see-you-next-year.md` | See you next year | `GradientStage`, `ConfettiRain` | 0 |
| `15-drinks-and-friends.md` | Drinks and friends | `PhotoWall` | 0 |

To add a slide, give its page the number of its place, rename the pages after it, and list it in
`slides.md`.

The comment at the top of each component says what every click does.

Never add a line called `presenter` to the first block of `slides.md`. The theme's cover layout
reads its footer text from a frontmatter line of that name, which is why the cover page has
one. Slidev has a deck setting with the same name, and in the first block it switches off
Slidev's presenter view.

## Add today's pictures

Pictures and clips live in `photos/`, one folder per event. Today's folder is `photos/07-today`.
It starts empty, and the "Today" step of the year in review then shows a card that says "You are
here".

To add the pictures of the day, put them into one folder on your Mac and run this in the deck's
folder:

```bash
bun run photos ~/Downloads/today
```

The script copies every picture and clip of that folder into `photos/07-today`. It makes them
smaller, turns them the right way up, and removes hidden data such as the place where a picture
was taken. Your original files are not changed. It needs `magick` and `ffmpeg` from Homebrew.

The deck picks the new files up by itself while `bun run dev` is running. They appear in three
places:

- the "Today" step of the year in review, and its closing step
- the picture wall behind "Thank you for being part of this community"
- the strip along the bottom of the last slide

Files are shown in the order of their names. To add pictures to another event, name its folder:
`bun run photos ~/Downloads/more 04-build-june`. You can also drop JPEG, PNG or MP4 files into a
folder by hand.

The picture on the fiancée slide is the first file in `photos/personal`. That folder is never
part of the picture wall or the strip.

## Where to change what

- **Today's agenda, workshops, rooms and numbers**: `lib/event.ts`. It also holds the address of
  the platform and the Discord invite. The Discord card shows a QR code once `DISCORD_URL` is set.
- **The words and pictures on the two news slides**: `lib/news.ts`. OpenAI only allows its own
  pictures for its products. They are in `openai/`: the square model icons come from
  developers.openai.com, the wide pictures from OpenAI's DevDay 2026 recap deck for community
  events. News without an official picture uses one of the two text animations of
  `components/MiniScene.vue`. Never draw a picture or logo of your own for an OpenAI product.
- **The events of the year**: `lib/year.ts`, with each event's title, date, place, sign-ups and
  picture folder. The number of events plus 1 is the `clicks:` of `pages/09-year-in-review.md`.
- **How pictures are found**: `lib/photos.ts`.
- **Colours and motion curves that the slides share**: the `--deck-` variables at the top of
  `style.css`. The theme's own colours start with `--codex-`.

## How the motion works

Each kind of motion has one way to build it.

- **Entrances** are plain CSS animations (`deck-rise` and `deck-pop` in `style.css`). Slidev hides
  every slide but the current one with `display: none`, so an animation starts again each time
  its slide is shown. No script is needed.
- **Clicks** go through `composables/useSlideSteps.ts`. A component calls `useSlideSteps(2)` and
  reads `step`, the number of clicks made, or puts `stepClasses` on its root element (`s1` after
  the first click, `s2` after the second). A click back undoes the step. The number given to
  `useSlideSteps` must be the same as `clicks:` in the page's frontmatter.
- **Loops** keep a slide alive while it stays up: the drifting hearts and bubbles
  (`FloatingBits`), the confetti, the gliding picture wall. They are CSS animations that repeat
  forever.
- **The text animations on the news cards** ("Chat + Work" turning into ChatGPT, and the two
  background windows) start when the click brings in their card: `NewsCards` only mounts a scene
  once its card is shown.
- **The pile of pictures** on the year in review is `components/PhotoStack.vue`. Every few seconds
  a timer slides the top picture off and puts it at the bottom of the pile.
- **The clock** on "Agenda" and "Build time" goes through `composables/useNow.ts`. It only shows
  on the day of the event (`EVENT_DAY` in `lib/event.ts`).

A delay belongs on the rule of the step that starts it (`.s1 .thing { transition-delay: ... }`),
never on the base rule. That way things come in one after another, and a click back hides them
all at once.

### Rehearse the clock

On any other day the clock is hidden. To rehearse, add a time to the deck's address. The clock
then stands still at that time:

```text
http://localhost:3030/8?now=2026-11-28T11:42
```

## Facts and sources

The facts on the news slides and the numbers of the year in review were checked on 2026-11-27.
Each page's speaker notes name the source.

- "Coming soon to the EU" on the dots card is Alex's early information. OpenAI's public help page
  did not say so on that day.
- The sign-ups of each event are the people who registered on its Meetup or Luma page. They are
  not people counted at the door. For the hackathon they include everyone who applied, approved or
  not. The closing number is their sum, rounded down to hundreds.

## Before you publish

The pictures show people, and this repository is public. Decide which pictures may be public
before you commit `photos/`. The wide pictures in `openai/` come from a deck that OpenAI shares
with its community ambassadors. The deck is published only once it has an entry in
`deploy/talks.json` (see `deploy/README.md`).
