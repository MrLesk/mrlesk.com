#!/usr/bin/env python3
"""Writes index.html for the groma.md launch film.

The composition is static HTML (Hyperframes reads timing from the markup), but it has many repeated
pieces: one <audio> per key press, one element per commit in the timelapse, twelve language chips.
This script expands those, so the timings live in one place. Run it after changing anything here:

    python3 build.py
"""
import json
import pathlib

HERE = pathlib.Path(__file__).parent
marks = json.loads((HERE / "../capture/timelapse.json").read_text())
energy_track = json.loads((HERE / "../capture/music-energy.json").read_text())  # the track's loudness, 0 to 1, 30 samples a second

# ---------------------------------------------------------------- the clock (120 BPM, bars every 2 s from 0.02)
# The track (Sunny Launchpad, ElevenLabs Music v2.5) is 120 BPM with its bars on the same grid. It plays its bar 4 twice
# (see "music" below), so the bass enters with the walk at 10.02 (track 8.02) and the drop lands on the scan scene at
# 18.02 (track 16.02).
LIGHTS = 4.02          # beat-locked: lights on, a bar line
RISE = 6.02            # beat-locked: the cursor clicks Iso and the map rises out of 2D (filmed at frame 361)
REPEAT = 8.02          # bar line: the repeated bar, while the camera pushes in on the iso components
BAR = 2.0
WALK = 10.02           # search click
DIVE = 11.02           # Enter: the camera dives to the component
HOW = 12.02            # "How it's built"
CODE = 13.02           # the source file opens
FLOW = 14.02
STEPS = [15.01, 16.02, 17.02]
SCANNED = 18.02        # beat-locked: the track's drop, the raw first scan of the order service
CURATING = 19.52       # beat-locked: the agent's curation lands and the map glides (filmed at frame 90)
CURATED = 21.52        # the glide settles (0.7 s of Groma's morph, filmed at 0.35x)
BUILD = 24.02          # bar line: the timelapse opens on the empty map; the first commit lands one second later
STACK = 32.02
INSTALL = 35.52
CURATE = 37.02         # beat-locked: the third step, ask your agent (beat 3)
CLOSE = 37.52          # beat-locked: closing line (beat 4)
END = 41.0

TIMELAPSE_MEDIA_START = 0.0
def commit_time(frame):  # composition time at which a filmed timelapse frame is on screen
    return round(BUILD + frame / 60 - TIMELAPSE_MEDIA_START, 3)

# ---------------------------------------------------------------- sound
sfx = []  # (time, file, volume, duration)
def sound(time, file, volume, duration):
    sfx.append((round(time, 3), file, volume, duration))

KEYS = ["003", "007", "011", "016", "021", "024", "028", "031"]
def typing(start, text, every, volume=0.3, skip=2):
    for index, char in enumerate(text):
        if char != " " and index % skip == 0:
            sound(start + index * every, f"keyboard/keypress-{KEYS[(index * 5 + len(text)) % len(KEYS)]}.wav", volume, 0.25)

sound(2.0, "impact/impactSoft_medium_001.ogg", 0.5, 0.18)
sound(LIGHTS - 0.03, "impact/impactSoft_heavy_003.ogg", 0.7, 0.54)
sound(RISE, "ui/click2.ogg", 0.5, 0.055)
sound(RISE + 0.1, "casino/card-slide-1.ogg", 0.36, 0.6)
sound(WALK, "ui/click2.ogg", 0.5, 0.055)
typing(WALK + 0.1, "web h", 0.117, 0.28, skip=1)
sound(DIVE, "keyboard/keypress-021.wav", 0.4, 0.25)
sound(DIVE + 0.02, "casino/card-slide-1.ogg", 0.4, 0.6)
sound(HOW, "ui/click2.ogg", 0.5, 0.055)
sound(CODE, "ui/click2.ogg", 0.5, 0.055)
for step in STEPS:
    sound(step, "ui/click2.ogg", 0.45, 0.055)
    sound(step + 0.02, "interface/switch_007.ogg", 0.3, 0.61)
sound(SCANNED, "ui/rollover2.ogg", 0.4, 0.057)
sound(CURATING, "impact/impactSoft_medium_001.ogg", 0.45, 0.18)
sound(CURATING + 0.02, "casino/card-slide-1.ogg", 0.4, 0.6)
sound(CURATED, "interface/drop_002.ogg", 0.45, 0.19)
first_commit, last_commit = commit_time(marks["marks"][0]["frame"]), commit_time(marks["marks"][-1]["frame"])
for beat in [first_commit + 0.5 * index for index in range(int((last_commit - first_commit) / 0.5) + 1)]:
    sound(beat, "ui/rollover2.ogg", 0.34, 0.057)
sound(commit_time(marks["marks"][-1]["frame"]), "interface/drop_002.ogg", 0.55, 0.19)
sound(STACK + 0.1, "casino/card-slide-1.ogg", 0.4, 0.6)
NPM_AT, NPM_EVERY = INSTALL + 0.1, 0.04
WEB_AT, WEB_EVERY = INSTALL + 0.95, 0.045
typing(NPM_AT, "npm i -g groma.md", NPM_EVERY, 0.28)
typing(WEB_AT, "groma web", WEB_EVERY, 0.28)
sound(CURATE, "interface/drop_002.ogg", 0.55, 0.19)
sound(CLOSE, "impact/impactBell_heavy_003.ogg", 0.45, 0.65)

audio_tags = "\n".join(
    f'      <audio id="sfx-{index}" src="assets/sfx/{file}" data-start="{time}" data-duration="{duration}" data-track-index="{20 + index}" data-volume="{volume}"></audio>'
    for index, (time, file, volume, duration) in enumerate(sorted(sfx))
)

# ---------------------------------------------------------------- music
# Clips of the one track. Each entry is (composition time, track time) where a clip takes over; the clip before it
# plays until then. Bar 4, the last light bar before the bass comes in, plays twice for the iso push-in. The 20 ms
# seam ends 5 ms before the next bar's attack, which starts about 20 ms ahead of the bar line, so both sides are only
# a tail there. Lane times are clip-local.
MUSIC_FILE = "assets/music/sunny-launchpad-elevenlabs.mp3"
MUSIC = [(0.0, 0.0), (REPEAT, REPEAT - BAR)]
LEVEL = 0.44  # this track is about 1.2 dB louder than the first cut's, so the clicks and hits keep their balance
SEAM_LEAD, SEAM_END = 0.045, 0.025
def lane(points):
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in points]}]})
music_tags = []
for index, (at, track_at) in enumerate(MUSIC):
    start = 0.0 if index == 0 else round(at - SEAM_LEAD, 3)
    last = index == len(MUSIC) - 1
    end = END if last else round(MUSIC[index + 1][0] - SEAM_END, 3)
    rise = [(0, 0), (0.2, LEVEL)] if index == 0 else [(0, 0), (SEAM_LEAD - SEAM_END, LEVEL)]
    fall = [(END - 1.4 - start, LEVEL), (END - 0.05 - start, 0)] if last else [(end - (SEAM_LEAD - SEAM_END) - start, LEVEL), (end - start, 0)]
    music_tags.append(
        f'      <audio id="music-{index + 1}" src="{MUSIC_FILE}" data-start="{start}" data-media-start="{round(track_at - (at - start), 3)}" '
        f'data-duration="{round(end - start, 3)}" data-track-index="{10 + index}" data-automation=\'{lane(rise + fall)}\'></audio>'
    )
music_tags = "\n".join(music_tags)

def track_time(at):
    """The moment of the track heard at composition time `at`."""
    clip_at, clip_track = [entry for entry in MUSIC if entry[0] <= at][-1]
    return at - clip_at + clip_track
# The glows breathe with the loudness of what is heard, 30 samples a second. The floor keeps them lit through the
# track's hushed intro, at about the level the first cut had.
bass = [round(0.22 + 0.5 * energy_track[min(round(track_time(frame / 30) * 30), len(energy_track) - 1)], 3) for frame in range(round(END * 30))]

# ---------------------------------------------------------------- repeated markup
def typed(text):
    return "".join(f'<span class="ch">{"&nbsp;" if char == " " else char}</span>' for char in text)

LANGUAGES = ["TypeScript", "JavaScript", "Angular", "React", "Vue", "C# / .NET", "Go", "Java", "Python", "Rust", "PHP", "Swift"]
chips = "\n".join(f'          <span class="lang" id="lang-{index}">{name}</span>' for index, name in enumerate(LANGUAGES))

commit_rows = "\n".join(
    f'          <div class="commit" id="commit-{index}"><b>COMMIT {mark["to"] + 1:02d} / {marks["total"]}</b><span>{mark["subject"]}</span></div>'
    for index, mark in enumerate(marks["marks"])
)
commit_times = [commit_time(mark["frame"]) for mark in marks["marks"]]

MARK = ('<svg class="mark" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="6" r="5" fill="currentColor"/>'
        '<line x1="50" y1="12" x2="50" y2="94" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>'
        '<line x1="22" y1="32" x2="78" y2="32" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>'
        '<line x1="22" y1="36" x2="22" y2="62" stroke="currentColor" stroke-width="4"/><path d="M15 62 L29 62 L22 76 Z" fill="currentColor"/>'
        '<line x1="78" y1="36" x2="78" y2="62" stroke="currentColor" stroke-width="4"/><path d="M71 62 L85 62 L78 76 Z" fill="currentColor"/>'
        '<line x1="30" y1="94" x2="70" y2="94" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>')
WORDMARK = f'{MARK}<span class="name">groma<i>.md</i></span>'

html = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>groma.md: Your architecture, alive.</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      @font-face {{ font-family: "Inter"; font-weight: 500; src: url("assets/fonts/inter-latin-500-normal.woff2") format("woff2"); }}
      @font-face {{ font-family: "Inter"; font-weight: 700; src: url("assets/fonts/inter-latin-700-normal.woff2") format("woff2"); }}
      @font-face {{ font-family: "Inter"; font-weight: 800; src: url("assets/fonts/inter-latin-800-normal.woff2") format("woff2"); }}
      @font-face {{ font-family: "IBM Plex Mono"; font-weight: 400; src: url("assets/fonts/IBMPlexMono-Regular.ttf") format("truetype"); }}
      @font-face {{ font-family: "IBM Plex Mono"; font-weight: 500; src: url("assets/fonts/IBMPlexMono-Medium.ttf") format("truetype"); }}
      @font-face {{ font-family: "IBM Plex Mono"; font-weight: 600; src: url("assets/fonts/IBMPlexMono-SemiBold.ttf") format("truetype"); }}

      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f7f6f2; }}
      #root {{
        --paper: #f7f6f2; --ink: #171b1a; --green: #1d9e75; --muted: #5d6764; --night: #07152b; --frost: #eaf6ff; --bass: 0.25;
        position: relative; width: 100%; height: 100%; overflow: hidden;
        font-family: "Inter", sans-serif; color: var(--ink); background: var(--paper);
      }}
      .layer {{ position: absolute; inset: 0; overflow: hidden; }}
      .clip {{ position: absolute; inset: 0; }}
      video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }}
      .mono {{ font-family: "IBM Plex Mono", monospace; }}

      /* The drawing sheet from the decks: paper, a fine grid, frame ticks in the corners. */
      #sheet {{
        background-color: var(--paper);
        background-image: linear-gradient(rgba(23, 27, 26, 0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(23, 27, 26, 0.05) 2px, transparent 2px);
        background-size: 40px 40px;
      }}
      #ticks {{ position: absolute; inset: 0; pointer-events: none; color: var(--frost); }}
      #ticks i {{ position: absolute; width: 34px; height: 34px; border: 0 solid currentColor; opacity: 0.55; }}
      #ticks i:nth-child(1) {{ left: 26px; top: 26px; border-left-width: 3px; border-top-width: 3px; }}
      #ticks i:nth-child(2) {{ right: 26px; top: 26px; border-right-width: 3px; border-top-width: 3px; }}
      #ticks i:nth-child(3) {{ left: 26px; bottom: 26px; border-left-width: 3px; border-bottom-width: 3px; }}
      #ticks i:nth-child(4) {{ right: 26px; bottom: 26px; border-right-width: 3px; border-bottom-width: 3px; }}

      /* ---------- Act one: in the dark ---------- */
      #act-dark {{ background: var(--night); }}
      #dim {{ position: absolute; inset: 0; background: #020812; opacity: 0; }}
      .scrim {{ position: absolute; left: -200px; bottom: -260px; width: 1900px; height: 900px; border-radius: 50%; }}
      #act-dark .scrim {{ background: radial-gradient(closest-side, rgba(3, 10, 24, 0.94), rgba(3, 10, 24, 0.7) 55%, rgba(3, 10, 24, 0)); }}
      #act-light .scrim {{ background: radial-gradient(closest-side, rgba(255, 255, 255, 0.97), rgba(255, 255, 255, 0.82) 55%, rgba(255, 255, 255, 0)); }}
      .hook {{
        position: absolute; left: 112px; bottom: 138px; width: 1500px;
        font-weight: 800; font-size: 124px; line-height: 1.02; letter-spacing: -0.045em; color: var(--frost);
      }}
      .hook .w {{ display: inline-block; margin-right: 0.24em; }}
      .kicker {{ font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 24px; letter-spacing: 0.2em; }}

      /* ---------- Act two: lights on ---------- */
      #act-light {{ background: #ffffff; }}
      #sweep {{
        position: absolute; top: -20%; left: 0; width: 360px; height: 140%; pointer-events: none; opacity: 0;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95) 45%, rgba(190, 255, 228, 0.9) 55%, rgba(255, 255, 255, 0));
      }}
      #flash {{ position: absolute; inset: 0; background: #ffffff; opacity: 0; pointer-events: none; }}
      #brand {{ position: absolute; left: 112px; bottom: 126px; width: 1400px; }}
      .wordmark {{ display: flex; align-items: center; gap: 22px; color: var(--ink); }}
      .wordmark .mark {{ width: 132px; height: 132px; flex: none; }}
      .wordmark .name {{ font-weight: 500; font-size: 138px; letter-spacing: -0.035em; line-height: 1; }}
      .wordmark .name i {{ font-style: normal; color: var(--green); }}
      #tagline {{ margin-top: 18px; font-weight: 800; font-size: 84px; letter-spacing: -0.04em; line-height: 1.05; }}
      #glow {{
        position: absolute; left: -120px; bottom: -80px; width: 1100px; height: 620px; border-radius: 50%; pointer-events: none;
        background: radial-gradient(closest-side, rgba(29, 158, 117, 0.42), rgba(29, 158, 117, 0));
        opacity: calc(0.25 + var(--bass) * 1.1);
      }}
      .typed {{ position: relative; display: inline-block; }}
      .caret {{ position: absolute; left: 4px; top: 50%; width: 0.5em; height: 1.05em; margin-top: -0.52em; background: #3ecf9f; }}
      .ch {{ opacity: 0; }}

      /* ---------- The product card (walk, flow, timelapse) ---------- */
      #card-stage {{ perspective: 2200px; }}
      #card {{
        position: absolute; left: 160px; top: 34px; width: 1600px; height: 900px; overflow: hidden; background: #ffffff;
        border: 3px solid var(--ink); box-shadow: 18px 18px 0 -5px var(--green), 0 30px 70px rgba(23, 27, 26, 0.16);
      }}
      .cam {{ position: absolute; inset: 0; }}
      .strip {{ position: absolute; left: 160px; top: 956px; width: 1600px; height: 110px; }}
      .strip .kicker {{ color: #12694d; font-size: 22px; }}
      .strip h2 {{ position: absolute; left: 0; top: 34px; width: 780px; font-weight: 800; font-size: 60px; letter-spacing: -0.04em; line-height: 1.05; white-space: nowrap; }}
      .strip .wordmark {{ position: absolute; right: 0; top: 30px; gap: 10px; }}
      .strip .wordmark .mark {{ width: 50px; height: 50px; }}
      .strip .wordmark .name {{ font-size: 46px; }}
      .state {{ position: absolute; right: 0; top: 36px; padding: 12px 22px 13px; border: 3px solid #8a9491; color: #4c5653; background: #ffffff; font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 26px; letter-spacing: 0.12em; opacity: 0; }}
      .state.curated {{ border-color: var(--green); background: var(--green); color: #ffffff; }}
      #commits {{ position: absolute; right: 0; top: 4px; width: 800px; height: 100px; }}
      .commit {{ position: absolute; right: 0; top: 0; width: 800px; text-align: right; opacity: 0; font-family: "IBM Plex Mono", monospace; }}
      .commit b {{ display: block; font-weight: 600; font-size: 40px; letter-spacing: 0.04em; color: var(--ink); }}
      .commit span {{ display: block; margin-top: 8px; font-weight: 500; font-size: 22px; color: #3f4946; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
      #build-bar {{ position: absolute; right: 0; top: 96px; width: 640px; height: 6px; background: #d5dad7; }}
      #build-bar i {{ display: block; width: 100%; height: 100%; background: var(--green); transform-origin: 0 50%; }}

      /* ---------- Your stack ---------- */
      #stack {{ padding: 150px 160px 0; }}
      #stack .kicker {{ color: #12694d; }}
      #stack h2 {{ margin-top: 22px; white-space: nowrap; font-weight: 800; font-size: 136px; letter-spacing: -0.045em; line-height: 1; }}
      #langs {{ margin-top: 84px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 36px 34px; width: 1600px; }}
      .lang {{
        display: block; padding: 34px 0 38px; text-align: center; background: #ffffff; border: 3px solid var(--ink);
        font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 48px; letter-spacing: -0.01em;
        box-shadow: 10px 10px 0 -3px var(--green);
      }}

      /* ---------- Install ---------- */
      #install-art {{ position: absolute; right: -190px; top: 40px; width: 1400px; height: 788px; mix-blend-mode: multiply; opacity: 0.95; }}
      #install-art img {{ display: block; width: 100%; height: 100%; object-fit: cover; }}
      #install-glow {{
        position: absolute; left: 40px; top: 250px; width: 1300px; height: 520px; border-radius: 50%; pointer-events: none;
        background: radial-gradient(closest-side, rgba(29, 158, 117, 0.3), rgba(29, 158, 117, 0));
        opacity: calc(0.3 + var(--bass) * 1.2);
      }}
      #install-mark {{ position: absolute; left: 160px; top: 96px; }}
      #install-mark .mark {{ width: 104px; height: 104px; }}
      #install-mark .name {{ font-size: 108px; }}
      #install-term {{ position: absolute; left: 160px; top: 240px; width: 1010px; padding: 30px 44px 34px; background: var(--ink); color: #f2f4f3; box-shadow: 18px 18px 0 -5px var(--green); }}
      #install-term .row {{ display: flex; align-items: center; height: 76px; font-family: "IBM Plex Mono", monospace; font-weight: 500; font-size: 52px; white-space: nowrap; }}
      #install-term .step {{ flex: none; width: 250px; color: #c3d0cc; font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 28px; letter-spacing: 0.14em; }}
      #install-term .curate .step {{ color: #3ecf9f; }}
      #install-term .curate .value {{ color: #3ecf9f; font-family: "Inter", sans-serif; font-weight: 800; font-size: 52px; letter-spacing: -0.03em; }}
      #facts {{ position: absolute; left: 160px; top: 556px; display: flex; gap: 20px; }}
      .fact {{ display: block; padding: 12px 26px 14px; border: 3px solid var(--ink); background: #ffffff; font-family: "IBM Plex Mono", monospace; font-weight: 600; font-size: 32px; letter-spacing: 0.06em; }}
      #closing {{ position: absolute; left: 156px; top: 690px; width: 1700px; font-weight: 800; font-size: 118px; letter-spacing: -0.045em; line-height: 1.04; }}
      #closing .line {{ display: block; }}
      #closing .dark {{ position: relative; display: inline-block; color: var(--ink); }}
      #closing-rule {{ position: absolute; left: 160px; top: 948px; width: 1010px; height: 8px; background: var(--green); transform-origin: 0 50%; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="{END}" data-fps="60">
      <div id="sheet" class="layer"></div>

      <!-- Act one: the blueprint map in the dark. The text sits inside this layer, so the light sweep wipes it away. -->
      <div id="act-dark" class="layer">
        <div class="cam" id="cam-dark"><video id="v-dark" src="assets/footage/hero-blueprint.mp4" data-start="0" data-duration="4.8" data-track-index="0" muted playsinline></video></div>
        <div id="dim"></div>
        <div id="hook" class="clip" data-start="0" data-duration="4.8" data-track-index="5">
          <div class="scrim"></div>
          <div class="hook" id="hook-1"><span class="w">Agents</span><span class="w">write</span><span class="w">the</span><span class="w">code.</span></div>
          <div class="hook" id="hook-2"><span class="w">You’re</span><span class="w">in</span><span class="w">the</span><span class="w">dark.</span></div>
        </div>
      </div>

      <!-- Act two: the same camera path filmed in the light theme, revealed by a diagonal sweep.
           In the footage the view switch appears, the cursor clicks Iso and the flat plan rises into the map. -->
      <div id="act-light" class="layer">
        <div class="cam" id="cam-light"><video id="v-light" src="assets/footage/hero-light.mp4" data-start="3.5" data-duration="{round(WALK - 0.02 - 3.5, 2)}" data-track-index="1" muted playsinline></video></div>
        <div id="reveal" class="clip" data-start="3.5" data-duration="{round(WALK - 0.02 - 3.5, 2)}" data-track-index="6">
          <div class="scrim" id="light-scrim"></div>
          <div id="glow"></div>
          <div id="brand">
            <div class="wordmark">{WORDMARK}</div>
            <div id="tagline">Your architecture, alive.</div>
          </div>
        </div>
        <div id="flash"></div>
      </div>
      <div id="sweep"></div>

      <!-- The product, in one card: three real recordings of groma web, cut on the bar lines. -->
      <div id="card-stage" class="layer">
        <div id="card">
          <div class="cam" id="cam-walk"><video id="v-walk" src="assets/footage/walk.mp4" data-start="{round(WALK - 0.3, 2)}" data-duration="4.3" data-track-index="2" muted playsinline></video></div>
          <div class="cam" id="cam-flow"><video id="v-flow" src="assets/footage/flow.mp4" data-start="{FLOW}" data-media-start="0.3" data-duration="4.0" data-track-index="2" muted playsinline></video></div>
          <div class="cam" id="cam-cur"><video id="v-cur" src="assets/footage/curate.mp4" data-start="{SCANNED}" data-duration="{round(BUILD - SCANNED, 2)}" data-track-index="2" muted playsinline></video></div>
          <div class="cam" id="cam-time"><video id="v-time" src="assets/footage/timelapse.mp4" data-start="{BUILD}" data-media-start="{TIMELAPSE_MEDIA_START}" data-duration="{round(STACK - BUILD, 2)}" data-track-index="2" muted playsinline></video></div>
        </div>
      </div>

      <div id="strip-walk" class="clip" data-start="{round(WALK - 0.3, 2)}" data-duration="4.3" data-track-index="7"><div class="strip">
        <div class="kicker">01 / WALK THE MAP</div>
        <h2 id="walk-1">Find anything.</h2>
        <h2 id="walk-2">Read what it does.</h2>
        <h2 id="walk-3">Open the code.</h2>
        <div class="wordmark">{WORDMARK}</div>
      </div></div>
      <div id="strip-flow" class="clip" data-start="{FLOW}" data-duration="4.0" data-track-index="7"><div class="strip">
        <div class="kicker">02 / FLOWS</div>
        <h2 id="flow-1">Trace a flow, step by step.</h2>
        <div class="wordmark">{WORDMARK}</div>
      </div></div>
      <div id="strip-cur" class="clip" data-start="{SCANNED}" data-duration="{round(BUILD - SCANNED, 2)}" data-track-index="7"><div class="strip">
        <div class="kicker">03 / SCAN, THEN CURATE</div>
        <h2 id="cur-1">Groma scans your code.</h2>
        <h2 id="cur-2">Your agent curates it.</h2>
        <span class="state" id="state-raw">STARTING POINT</span>
        <span class="state curated" id="state-curated">YOUR ARCHITECTURE IS READY</span>
      </div></div>
      <div id="strip-time" class="clip" data-start="{BUILD}" data-duration="{round(STACK - BUILD, 2)}" data-track-index="7"><div class="strip">
        <div class="kicker">04 / LIVE WORK</div>
        <h2 id="time-1">Watch your agents build.</h2>
        <div id="commits">
{commit_rows}
        </div>
        <div id="build-bar"><i id="build-fill"></i></div>
      </div></div>

      <div id="stack" class="clip" data-start="{STACK}" data-duration="{round(INSTALL - STACK, 2)}" data-track-index="8">
        <div class="kicker" id="stack-kicker">05 / LANGUAGES AND FRAMEWORKS</div>
        <h2 id="stack-line">Works with your stack.</h2>
        <div id="langs">
{chips}
        </div>
      </div>

      <div id="install" class="clip" data-start="{INSTALL}" data-duration="{round(END - INSTALL, 2)}" data-track-index="9">
        <div id="install-art"><img src="assets/footage/layers-still.jpg" alt="" /></div>
        <div id="install-glow"></div>
        <div id="install-mark" class="wordmark">{WORDMARK}</div>
        <div id="install-term">
          <div class="row"><span class="step">INSTALL</span><span class="typed" id="type-npm">{typed("npm i -g groma.md")}<i class="caret" id="caret-npm"></i></span></div>
          <div class="row"><span class="step">SCAN</span><span class="typed" id="type-web">{typed("groma web")}<i class="caret" id="caret-web"></i></span></div>
          <div class="row curate" id="row-curate"><span class="step">CURATE</span><span class="value">ask your agent</span></div>
        </div>
        <div id="facts"><span class="fact">FREE</span><span class="fact">MIT</span><span class="fact">LOCAL</span><span class="fact">NO ACCOUNT</span></div>
        <div id="closing"><span class="line" id="close-1">In the loop.</span><span class="line" id="close-2">Not in the dark.</span></div>
        <div id="closing-rule"></div>
      </div>

      <div id="ticks"><i></i><i></i><i></i><i></i></div>

{music_tags}
{audio_tags}
    </div>

    <script>
      const BASS = {json.dumps(bass)};
      const COMMITS = {json.dumps(commit_times)};
      const tl = gsap.timeline({{ paused: true }});
      const each = (selector) => Array.from(document.querySelectorAll(selector));
      const type = (selector, at, every, size) => each(selector + " .ch").forEach((ch, index) => {{
        tl.set(ch, {{ opacity: 1 }}, at + index * every);
        tl.set(selector + " .caret", {{ x: (index + 1) * size * 0.6 }}, at + index * every);
      }});

      // ---------- Act one: in the dark (0 to {LIGHTS})
      tl.fromTo("#cam-dark", {{ scale: 1.06 }}, {{ scale: 1, duration: 4.8, ease: "none" }}, 0);
      tl.fromTo("#hook-1 .w", {{ y: 70, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.07 }}, 0.22);
      tl.to("#hook-1 .w", {{ y: -40, opacity: 0, duration: 0.28, ease: "power2.in", stagger: 0.03 }}, 1.78);
      // beat-locked: 2.02s (bar line): the second line lands and the lights go down
      tl.fromTo("#hook-2 .w", {{ y: 70, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.06 }}, 2.02);
      tl.to("#dim", {{ opacity: 0.62, duration: 1.5, ease: "power1.in" }}, 2.1);

      // ---------- Lights on. beat-locked: {LIGHTS}s (bar line)
      const hidden = "polygon(-40% 0%, -40% 0%, -60% 100%, -60% 100%)";
      const shown = "polygon(-40% 0%, 150% 0%, 130% 100%, -60% 100%)";
      tl.fromTo("#act-light", {{ clipPath: hidden }}, {{ clipPath: shown, duration: 0.62, ease: "power2.inOut" }}, {LIGHTS} - 0.26);
      tl.fromTo("#sweep", {{ x: -700, rotation: 11, opacity: 0 }}, {{ x: 2300, rotation: 11, opacity: 1, duration: 0.62, ease: "power2.inOut" }}, {LIGHTS} - 0.26);
      tl.set("#sweep", {{ opacity: 0 }}, {LIGHTS} + 0.37);
      tl.fromTo("#flash", {{ opacity: 0.85 }}, {{ opacity: 0, duration: 0.75, ease: "power2.out" }}, {LIGHTS} - 0.2);
      tl.to("#ticks", {{ color: "#171b1a", duration: 0.4 }}, {LIGHTS});
      tl.set("#act-dark", {{ opacity: 0 }}, 4.7);
      tl.fromTo("#cam-light", {{ scale: 1.05 }}, {{ scale: 1, duration: 4.5, ease: "power1.out" }}, 3.5);
      tl.fromTo("#brand .wordmark", {{ x: -80, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {LIGHTS} + 0.02);
      tl.fromTo("#tagline", {{ y: 50, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {LIGHTS} + 0.16);
      tl.fromTo("#glow", {{ scale: 0.6 }}, {{ scale: 1, duration: 1.2, ease: "power2.out" }}, {LIGHTS});
      // The cursor clicks Iso at {RISE}s in the footage, the map rises under the title, then the camera pushes in on
      // the components through the repeated bar. The title holds until the cut.
      tl.to("#brand", {{ y: 40, opacity: 0, duration: 0.26, ease: "power2.in" }}, {WALK} - 0.58);
      tl.to("#glow", {{ opacity: 0, duration: 0.26 }}, {WALK} - 0.58);
      tl.to("#act-light", {{ opacity: 0, duration: 0.26, ease: "power1.in" }}, {WALK} - 0.4);

      // ---------- The card ({round(WALK - 0.3, 2)} to {STACK})
      tl.fromTo("#card", {{ y: 150, rotationX: 14, scale: 0.92, opacity: 0 }}, {{ y: 0, rotationX: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }}, {WALK} - 0.36);
      // Walk: search, dive, how it is built, the code. Camera pushes follow where the eye should go.
      tl.fromTo("#cam-walk", {{ scale: 1, xPercent: 0, yPercent: 0, transformOrigin: "50% 50%" }}, {{ scale: 1.05, yPercent: 2.4, duration: 1.2, ease: "power1.inOut" }}, {WALK} - 0.22);
      tl.to("#cam-walk", {{ scale: 1.1, xPercent: -2, yPercent: 0.5, duration: 0.84, ease: "power2.inOut" }}, {DIVE});
      tl.to("#cam-walk", {{ scale: 1.3, xPercent: -13.5, yPercent: 5, duration: 0.7, ease: "power2.inOut" }}, {HOW} - 0.12);
      tl.to("#cam-walk", {{ scale: 1.16, xPercent: -6, yPercent: 3.2, duration: 0.75, ease: "power2.inOut" }}, {CODE});
      tl.fromTo("#strip-walk .kicker", {{ x: -30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }}, {WALK} - 0.22);
      tl.fromTo("#strip-walk .wordmark", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.4 }}, {WALK} - 0.12);
      tl.fromTo("#walk-1", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }}, {WALK} - 0.12);
      tl.to("#walk-1", {{ y: -30, opacity: 0, duration: 0.18, ease: "power2.in" }}, {DIVE} - 0.14);
      tl.fromTo("#walk-2", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.34, ease: "power3.out" }}, {DIVE} + 0.04);
      tl.to("#walk-2", {{ y: -30, opacity: 0, duration: 0.16, ease: "power2.in" }}, {CODE} - 0.16);
      tl.fromTo("#walk-3", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, {CODE});

      // Flow: Groma's own camera follows each step, so the card only breathes and nods on the beat.
      tl.fromTo("#cam-flow", {{ scale: 1.1, xPercent: 0, transformOrigin: "46% 52%" }}, {{ scale: 1.02, duration: 0.6, ease: "power3.out" }}, {FLOW});
      tl.to("#cam-flow", {{ scale: 1.1, duration: 3.3, ease: "none" }}, {FLOW} + 0.6);
      tl.fromTo("#strip-flow .kicker", {{ x: -30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }}, {FLOW} + 0.02);
      tl.fromTo("#flow-1", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }}, {FLOW} + 0.06);
      // beat-grid: flow steps 2, 3 and 4 at {STEPS[0]}s, {STEPS[1]}s and {STEPS[2]}s
      {json.dumps(STEPS)}.forEach((at) => tl.fromTo("#card", {{ y: 0 }}, {{ y: 7, duration: 0.09, ease: "power1.out", yoyo: true, repeat: 1, immediateRender: false }}, at));

      // Scan, then curate. beat-locked: {SCANNED}s (the lift) for the raw scan, {CURATING}s for the agent's work
      tl.fromTo("#cam-cur", {{ scale: 1.08, transformOrigin: "47% 53%" }}, {{ scale: 1.16, duration: {CURATING} - {SCANNED}, ease: "none" }}, {SCANNED});
      // The map grows 2.5x as it is curated and Groma zooms out to fit it; the card pushes in to keep it readable.
      tl.to("#cam-cur", {{ scale: 1.3, duration: {CURATED} - {CURATING} + 0.3, ease: "power2.inOut" }}, {CURATING});
      // The finished architecture holds, the card drifting in a little, until the timelapse.
      tl.to("#cam-cur", {{ scale: 1.34, duration: {BUILD} - {CURATED} - 0.3, ease: "none" }}, {CURATED} + 0.3);
      tl.fromTo("#strip-cur .kicker", {{ x: -30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }}, {SCANNED} + 0.02);
      tl.fromTo("#cur-1", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }}, {SCANNED} + 0.06);
      tl.fromTo("#state-raw", {{ x: 30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.32, ease: "power3.out" }}, {SCANNED} + 0.2);
      tl.to("#cur-1", {{ y: -30, opacity: 0, duration: 0.16, ease: "power2.in" }}, {CURATING} - 0.16);
      tl.to("#state-raw", {{ opacity: 0, duration: 0.2 }}, {CURATING});
      tl.fromTo("#cur-2", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }}, {CURATING});
      tl.fromTo("#state-curated", {{ x: 30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.32, ease: "back.out(1.6)" }}, {CURATED});

      // Timelapse. beat-locked: {BUILD}s (bar line); commits land on eighth notes from one second in
      // The footage frames the service itself (capture/shot-timelapse.mjs), so the card only drifts in a little.
      tl.fromTo("#cam-time", {{ scale: 1.0, transformOrigin: "50% 50%" }}, {{ scale: 1.04, duration: {STACK} - {BUILD}, ease: "none" }}, {BUILD});
      tl.fromTo("#strip-time .kicker", {{ x: -30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }}, {BUILD} + 0.02);
      tl.fromTo("#time-1", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.36, ease: "power3.out" }}, {BUILD} + 0.06);
      // beat-grid: commits land on sixteenth notes from the bar; each one swaps the counter and its subject
      COMMITS.forEach((at, index) => {{
        tl.set("#commit-" + index, {{ opacity: 1 }}, at);
        if (index > 0) tl.set("#commit-" + (index - 1), {{ opacity: 0 }}, at);
      }});
      tl.fromTo("#build-fill", {{ scaleX: 0.02 }}, {{ scaleX: 1, duration: COMMITS[COMMITS.length - 1] - COMMITS[0], ease: "none" }}, COMMITS[0]);
      tl.to("#card", {{ y: -120, rotationX: -10, scale: 0.94, opacity: 0, duration: 0.24, ease: "power2.in" }}, {STACK} - 0.2);

      // ---------- Your stack ({STACK} to {INSTALL})
      tl.fromTo("#stack-kicker", {{ x: -30, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }}, {STACK} + 0.02);
      tl.fromTo("#stack-line", {{ y: 70, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }}, {STACK} + 0.02);
      // beat-grid: the chips cascade from the bar and hold as a set
      tl.fromTo(".lang", {{ y: 50, scale: 0.86, opacity: 0 }}, {{ y: 0, scale: 1, opacity: 1, duration: 0.26, ease: "back.out(1.7)", stagger: 0.058 }}, {STACK} + 0.12);
      tl.to("#stack-kicker, #stack-line, #langs", {{ y: -50, opacity: 0, duration: 0.16, ease: "power2.in" }}, {INSTALL} - 0.17);

      // ---------- Install ({INSTALL} to {END})
      tl.fromTo("#install-art", {{ x: 160, opacity: 0 }}, {{ x: 0, opacity: 0.95, duration: 0.9, ease: "power3.out" }}, {INSTALL});
      tl.fromTo("#install-art img", {{ scale: 1.12 }}, {{ scale: 1.0, duration: 3.4, ease: "power1.out" }}, {INSTALL});
      tl.fromTo("#install-mark", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }}, {INSTALL} + 0.02);
      tl.fromTo("#install-term", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.38, ease: "power3.out" }}, {INSTALL} + 0.04);
      type("#type-npm", {NPM_AT}, {NPM_EVERY}, 52);
      tl.set("#caret-npm", {{ opacity: 0 }}, {WEB_AT} - 0.04);
      tl.fromTo("#caret-web", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.01 }}, {WEB_AT} - 0.04);
      type("#type-web", {WEB_AT}, {WEB_EVERY}, 52);
      // beat-locked: {CURATE}s (strong cue): the third step, the one the first scan needs
      tl.set("#caret-web", {{ opacity: 0 }}, {CURATE} - 0.02);
      tl.fromTo("#row-curate", {{ x: -40, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.42, ease: "power3.out" }}, {CURATE});
      tl.fromTo(".fact", {{ y: 30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.28, ease: "back.out(1.6)", stagger: 0.07 }}, {INSTALL} + 0.72);
      // beat-locked: {CLOSE}s (strong cue): the closing line
      tl.fromTo("#close-1", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {CLOSE});
      tl.fromTo("#close-2", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {CLOSE} + 0.34);
      tl.fromTo("#closing-rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.7, ease: "power3.inOut" }}, {CLOSE} + 0.5);

      // ---------- Audio-reactive: the bass of the track breathes the green glows (30 samples a second)
      BASS.forEach((level, frame) => tl.set("#root", {{ "--bass": level }}, frame / 30));

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
(HERE / "index.html").write_text(html)
print(f"index.html written: {len(sfx)} sound cues, {len(commit_times)} commit marks")
