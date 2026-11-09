/**
 * The finale's production line as an isometric drawing (pages/30-finale.md draws it with
 * components/FactoryFloor.vue). It holds two scenes on one floor plan, and the CSS shows one at a time:
 *
 * - building the car: people in hard hats work on every car of the line, each with a tool, and in the middle of the
 *   floor is their workshop: a workbench with a tool board, tyres and a crate;
 * - building the factory: a robot arm, an agent, stands at every station instead, and behind the line stairs lead
 *   up to a raised platform where a person oversees on three monitors.
 *
 * The scene is a small model in world units: x runs towards the bottom right of the slide, y towards the bottom
 * left, z up. `scene()` projects it onto the 980 x 551 slide, scaled to fit, and lists the parts back to front so
 * later parts cover earlier ones. To move or resize something, change its numbers in the constants below.
 *
 * Every face carries a tone class (`tone-top`, `tone-left`, `tone-front`, `tone-right`) for the way it faces, and
 * style.css gives each tone a fill per light. That shading is what makes the drawing look solid.
 */

type XY = [number, number]
type P3 = [number, number, number]
export type P2 = [number, number]

/** A face or a line as an SVG path. `cls` holds its name, its tone, and "line" when it is not a face. */
export interface Path { kind: 'path', cls: string, d: string }

/** A soft shadow on the ground under someone's feet. */
export interface Ellipse { cx: number, cy: number, rx: number, ry: number }

export type Part =
  | Path
  /** A robot arm, an agent (see `Arm`). */
  | Arm
  /** The lamp on top of a pillar. */
  | { kind: 'beacon', at: P2, r: number }
  /** A monitor's picture, drawn into the monitor's plane by an SVG matrix. */
  | { kind: 'screen', cls: string, matrix: string, width: number, height: number }
  /** The person who oversees from the platform, seen from behind, as one filled outline. */
  | { kind: 'person', d: string, shadow: Ellipse }
  /** A person building a car, seen from the side and facing it (see `workerParts()`). */
  | Worker

/**
 * A robot arm in slide pixels: a base, an upper arm from the shoulder to the elbow and a forearm from the elbow to
 * the wrist, with the welding tool below the wrist. The upper arm and the forearm are their own groups in
 * FactoryFloor.vue, so the CSS can turn them around the shoulder and the elbow ("The agents at work" in style.css).
 */
export interface Arm {
  kind: 'arm'
  /** 1 or -1: which way the tool moves as it works, so the arms left and right of a car mirror each other. */
  turn: 1 | -1
  /** 0 for the first arm, 1 for the next: they arrive and work one after the other, not in step. */
  order: number
  base: Path[]
  shoulder: P2
  elbow: P2
  wrist: P2
  /** Where the tool touches the car. */
  tip: P2
  /** The end of the stub behind the elbow, where the forearm's motor sits. */
  motor: P2
  /** Short rays around the tip. */
  sparks: string
  /** Stroke widths and radii in slide pixels, so the arm keeps its proportions at any scale. */
  sizes: { upper: number, fore: number, joint: number, glow: number }
}

/** What a worker does to the car. style.css moves each job's arm, under "The workers". */
export type Job = 'weld' | 'hammer' | 'wrench'

/**
 * A worker as stroked lines in slide pixels. The working arm's forearm and tool are their own group, so the CSS
 * can swing them around the elbow. `facing` is 1 when they face right and -1 when they face left.
 */
export interface Worker {
  kind: 'worker'
  job: Job
  facing: 1 | -1
  shadow: Ellipse
  /** The far arm, resting on the car, then the legs and the trunk. */
  restArm: string
  legs: string
  trunk: string
  head: { at: P2, r: number }
  /** The hard hat: a dome with a brim towards the car. */
  hat: string
  upperArm: string
  forearm: string
  /** The tool's handle, and the bar across its end (empty for the torch). */
  tool: string
  toolEnd: string
  /** Short rays around the torch's tip (empty for the other tools). */
  sparks: string
  elbow: P2
  tip: P2
  /** Stroke widths and the glow's radius in slide pixels, so the lines keep their proportions at any scale. */
  sizes: { limb: number, trunk: number, tool: number, glow: number }
}

const SLIDE = { width: 980, height: 551, margin: 26 }
/** The band at the top of the slide that the car's framing leaves free for the title. */
const TITLE_BAND = 96

/** The raised platform: an octagon `half` units from the centre, with cut corners. */
const PLATFORM = { half: 2.3, backCut: 1.6, sideCut: 0.8, frontCut: 1.0, height: 1.7 }
/** Monitors stand on the three back edges. `border` is the bezel around the picture. */
const MONITOR = { inset: 0.15, lift: 0.55, height: 1.6, border: 0.04 }
/** The control desk on the platform: `front` is the height of its near edge, `back` of its far edge. */
const DESK = { centre: [-0.4, -0.4] as XY, length: 2.0, depth: 0.55, front: 0.78, back: 1.0 }
/** The stairs: one down each front side, `run` units long. */
const STAIRS = { start: -1.35, width: 0.9, run: 2.2, steps: 8 }
/** How high the handrails are, on the platform and down the stairs. */
const RAIL_HEIGHT = 0.85
/** The line: two belts that meet in front at (centre, centre) on a turntable. */
const LINE = { start: -3.2, centre: 6.15, width: 1.3, height: 0.3, turntable: 1.5, turntableHeight: 0.4 }
const PILLAR = { size: 0.22, height: 1.8, rail: 1.05 }
/** A robot arm: heights above what it stands on, except `elbow`, which is above the floor. */
const ARM = { baseRadius: 0.42, baseHeight: 0.3, turretRadius: 0.26, turretHeight: 0.28, shoulder: 0.78, elbow: 2.35, tool: 0.45 }

/**
 * A car in its own measures: `a` runs along it from the rear (negative) to the front, `up` from what it stands on.
 * `body` is the side of the body below the windows, as [a, up] points from the rear bumper over the bonnet to the
 * front bumper. The cabin stands on the body and is narrower at the roof, each given from rear to front.
 */
const CAR = {
  halfWidth: 0.6,
  body: {
    rearBumper: [-1.24, 0.2], tail: [-1.28, 0.5], boot: [-1.2, 0.7], cowl: [0.52, 0.7],
    bonnetEdge: [1.06, 0.62], nose: [1.24, 0.5], frontBumper: [1.27, 0.2],
  } satisfies Record<string, XY>,
  cabin: { foot: [-1.1, 0.52] as XY, roof: [-0.78, 0.02] as XY, footHalfWidth: 0.56, roofHalfWidth: 0.43, height: 1.1 },
  wheels: { rear: -0.76, front: 0.78, radius: 0.25 },
}

/** The workbench in the people's workshop: `board` is how far the tool board rises above the bench. */
const BENCH = { centre: [1.5, 2.1] as XY, length: 2.2, depth: 0.6, height: 0.85, board: 1.15 }
/** A tyre lying flat, in a stack. */
const TYRE = { radius: 0.27, width: 0.2 }

/** How far a shadow falls across the floor per unit of height: to the right on the slide and a little back. */
const SHADOW: XY = [0.22, -0.3]

/** World x and y to slide x and y before fitting: the classic 30 degree isometric. */
const COS = Math.cos(Math.PI / 6)
function raw([x, y, z]: P3): P2 {
  return [(x - y) * COS, (x + y) * 0.5 - z]
}

/** The same parts in world units, before `scene()` projects them. */
interface WorldPath { kind: 'path', cls: string, points: P3[], closed: boolean }
type WorldPart =
  | WorldPath
  | { kind: 'arm', base: WorldPath[], shoulder: P3, elbow: P3, wrist: P3, tip: P3, motor: P3, turn: 1 | -1, order: number }
  | { kind: 'beacon', at: P3 }
  | { kind: 'screen', cls: string, corner: P3, right: P3, down: P3 }
  | { kind: 'person', at: P3, height: number }
  | { kind: 'worker', at: P3, height: number, facing: 1 | -1, job: Job }

interface Model { parts: WorldPart[] }

/** Where the camera stands for a beat: a CSS transform for the drawing, with its origin at the top left. */
export interface Cameras {
  /** Building the car: closer, on the line, as the platform is not there yet. */
  car: string
  /** Building the factory: the whole drawing. */
  factory: string
  /** Up on the platform, looking over its front railing: the monitors and the person fill most of the slide. */
  deck: string
}

/**
 * The drawing in three groups, back to front: the platform, the people's workshop in the middle of the floor, and
 * the line. style.css shows the workshop only while people build the car, and the platform only after.
 */
export function scene(): { platform: Part[], workshop: Part[], floor: Part[], cameras: Cameras } {
  const platformModel: Model = { parts: [] }
  const workshopModel: Model = { parts: [] }
  const floorModel: Model = { parts: [] }
  const deckPoints: P3[] = []
  platform(platformModel, deckPoints)
  workshop(workshopModel)
  floor(floorModel)

  // Fit every point onto the slide, then project with that scale and origin.
  const all = [platformModel, workshopModel, floorModel].flatMap(model => framedPoints(model.parts))
  const xs = all.map(p => raw(p)[0])
  const ys = all.map(p => raw(p)[1])
  const scale = Math.min(
    (SLIDE.width - 2 * SLIDE.margin) / (Math.max(...xs) - Math.min(...xs)),
    (SLIDE.height - 2 * SLIDE.margin) / (Math.max(...ys) - Math.min(...ys)),
  )
  const offsetX = SLIDE.width / 2 - scale * (Math.max(...xs) + Math.min(...xs)) / 2
  const offsetY = SLIDE.height / 2 - scale * (Math.max(...ys) + Math.min(...ys)) / 2
  const project = (p: P3): P2 => {
    const [x, y] = raw(p)
    return [round(offsetX + x * scale), round(offsetY + y * scale)]
  }

  return {
    platform: platformModel.parts.map(part => resolve(part, project, scale)),
    workshop: workshopModel.parts.map(part => resolve(part, project, scale)),
    floor: floorModel.parts.map(part => resolve(part, project, scale)),
    cameras: {
      // Below the slide's title, "Factories before." (see pages/30-finale.md).
      car: camera(framedPoints(floorModel.parts).map(project), 0.92, TITLE_BAND),
      factory: camera([[0, 0], [SLIDE.width, SLIDE.height]], 1),
      // The platform fills 86% of the slide, so the monitors keep clear of the deck's frame.
      deck: camera(deckPoints.map(project), 0.86),
    },
  }
}

/**
 * The transform that centres `points` on the slide and makes them fill `share` of it. With `top`, they fill the
 * slide below that many pixels instead, leaving the top for a title.
 */
function camera(points: P2[], share: number, top = 0): string {
  const xs = points.map(p => p[0])
  const ys = points.map(p => p[1])
  const height = SLIDE.height - top
  const zoom = Math.min(SLIDE.width * share / (Math.max(...xs) - Math.min(...xs)), height * share / (Math.max(...ys) - Math.min(...ys)))
  const x = SLIDE.width / 2 - zoom * (Math.max(...xs) + Math.min(...xs)) / 2
  const y = top + height / 2 - zoom * (Math.max(...ys) + Math.min(...ys)) / 2
  return `translate(${round(x)}px, ${round(y)}px) scale(${Number(zoom.toFixed(3))})`
}

// ---------- The platform ----------

/** The raised platform, with `deckPoints` collecting what the camera frames once it is up there. */
function platform(model: Model, deckPoints: P3[]): void {
  const { half: r, backCut: b, sideCut: s, frontCut: f, height: h } = PLATFORM
  // Clockwise on the slide from the back corner: back, right-back, right, front-right, front, front-left, left, left-back.
  const outline: XY[] = [[-r, -r + b], [-r + b, -r], [r - s, -r], [r, -r + s], [r, r - f], [r - f, r], [-r + s, r], [-r, r - s]]
  prism(model, 'platform', outline, 0, h)
  steelFrame(model, outline.slice(3, 7), h)
  deckPlates(model, outline, h)

  // Monitors on the left-back, back and right-back edges, facing the person.
  const screens: Array<{ cls: string, from: XY, to: XY }> = [
    { cls: 'left', from: outline[7], to: outline[0] },
    { cls: 'main', from: outline[0], to: outline[1] },
    { cls: 'right', from: outline[1], to: outline[2] },
  ]
  for (const { cls, from, to } of screens) monitor(model, deckPoints, cls, from, to)

  // The control desk and the person at it, far enough forward that the main monitor shows above their head.
  controlDesk(model)
  model.parts.push({ kind: 'person', at: [0.25, 0.25, h], height: 1.75 })
  deckPoints.push([0.25, 0.25, h])

  // Railings along the front edges, with gaps where the stairs come up.
  const { start, width } = STAIRS
  const rails: XY[][] = [
    [outline[7], outline[6], [start, r]],
    [[start + width, r], outline[5], outline[4], [r, start + width]],
    [[r, start], outline[3], outline[2]],
  ]
  for (const rail of rails) railing(model, rail, h, RAIL_HEIGHT)
  // The camera looks over the front railing, so that marks the bottom of its frame.
  deckPoints.push([outline[4][0], outline[4][1], h + RAIL_HEIGHT], [outline[5][0], outline[5][1], h + RAIL_HEIGHT])

  stairs(model, 'left')
  stairs(model, 'right')
}

/** The steel frame on the platform's sides that face the room: a band at the top and the bottom, and cross braces. */
function steelFrame(model: Model, edge: XY[], height: number): void {
  const band = 0.2
  line(model, 'platform-band', edge.map(([x, y]) => [x, y, height - band]))
  line(model, 'platform-band', edge.map(([x, y]) => [x, y, band]))
  for (let i = 0; i + 1 < edge.length; i++) {
    const [from, to] = [edge[i], edge[i + 1]]
    // One cross about every 1.4 units along the side.
    const bays = Math.max(1, Math.round(Math.hypot(to[0] - from[0], to[1] - from[1]) / 1.4))
    for (let bay = 0; bay < bays; bay++) {
      const a = add(from, scaleXY(sub(to, from), bay / bays))
      const b = add(from, scaleXY(sub(to, from), (bay + 1) / bays))
      line(model, 'platform-brace', [[a[0], a[1], band], [b[0], b[1], height - band]])
      line(model, 'platform-brace', [[a[0], a[1], height - band], [b[0], b[1], band]])
      line(model, 'platform-brace', [[b[0], b[1], band], [b[0], b[1], height - band]])
    }
  }
}

/** The deck's floor plates: a grid of thin lines, cut off at the platform's outline. */
function deckPlates(model: Model, outline: XY[], height: number): void {
  const r = PLATFORM.half
  const plate = (2 * r) / 8
  for (let at = -r + plate; at < r - 1e-9; at += plate) {
    const lines: Array<[XY, XY]> = [[[at, -r], [at, r]], [[-r, at], [r, at]]]
    for (const [from, to] of lines) {
      const inside = clipToOutline(from, to, outline)
      if (inside) line(model, 'deck-plate', inside.map(([x, y]) => [x, y, height]))
    }
  }
}

function monitor(model: Model, deckPoints: P3[], cls: string, from: XY, to: XY): void {
  const { inset, lift, height, border } = MONITOR
  const h = PLATFORM.height
  // Pull the monitor a little in from the corners and towards the middle of the platform.
  const along = unit(sub(to, from))
  const inward = unit([-from[0] - to[0], -from[1] - to[1]])
  const a = add(add(from, scaleXY(along, inset)), scaleXY(inward, 0.25))
  const b = add(add(to, scaleXY(along, -inset)), scaleXY(inward, 0.25))
  const bottom = h + lift
  const top = bottom + height
  for (const end of [add(a, scaleXY(along, 0.35)), add(b, scaleXY(along, -0.35))]) {
    line(model, 'monitor-post', [[end[0], end[1], h], [end[0], end[1], bottom]])
  }
  model.parts.push({ kind: 'path', cls: 'monitor', points: [[a[0], a[1], top], [b[0], b[1], top], [b[0], b[1], bottom], [a[0], a[1], bottom]], closed: true })
  const ia = add(a, scaleXY(along, border))
  const ib = add(b, scaleXY(along, -border))
  model.parts.push({ kind: 'screen', cls, corner: [ia[0], ia[1], top - border], right: [ib[0], ib[1], top - border], down: [ia[0], ia[1], bottom + border] })
  deckPoints.push([a[0], a[1], top], [b[0], b[1], top])
}

/**
 * The control desk: a front panel towards the person and a top that slopes up to the monitors, with a keyboard in
 * the middle and three status lights on each side.
 */
function controlDesk(model: Model): void {
  const h = PLATFORM.height
  const { centre, length, depth, front, back } = DESK
  // The desk runs across the slide; its near edge is the one towards the person and the viewer.
  const across = unit([1, -1])
  const near = unit([1, 1])
  const corner = (side: -1 | 1, edge: -1 | 1, z: number): P3 => {
    const [x, y] = add(add(centre, scaleXY(across, (side * length) / 2)), scaleXY(near, (edge * depth) / 2))
    return [x, y, z]
  }
  // The front panel, from the bottom left: a sunken panel in it, and three vents on each side of the person.
  const panel: P3[] = [corner(-1, 1, h), corner(1, 1, h), corner(1, 1, h + front), corner(-1, 1, h + front)]
  model.parts.push({ kind: 'path', cls: 'desk tone-front', points: panel, closed: true })
  model.parts.push({ kind: 'path', cls: 'seam line', points: patch(panel, 0.04, 0.96, 0.12, 0.86), closed: true })
  for (const left of [0.1, 0.72]) {
    for (const up of [0.5, 0.6, 0.7]) line(model, 'seam', [patch(panel, left, left + 0.18, up, up)[0], patch(panel, left, left + 0.18, up, up)[1]])
  }
  // The top, as near left, near right, far right, far left: `patch()` places things on it from left to right and near to far.
  const top: P3[] = [corner(-1, 1, h + front), corner(1, 1, h + front), corner(1, -1, h + back), corner(-1, -1, h + back)]
  model.parts.push({ kind: 'path', cls: 'desk tone-top', points: top, closed: true })

  const keys = 9
  const keyboard = { from: 0.33, to: 0.67, rows: [[0.16, 0.36], [0.44, 0.64]] }
  const pitch = (keyboard.to - keyboard.from) / keys
  for (const [near0, far0] of keyboard.rows) {
    for (let key = 0; key < keys; key++) {
      const left = keyboard.from + key * pitch
      model.parts.push({ kind: 'path', cls: 'desk-key', points: patch(top, left, left + pitch * 0.72, near0, far0), closed: true })
    }
  }
  for (const left of [0.07, 0.14, 0.21, 0.75, 0.82, 0.89]) {
    model.parts.push({ kind: 'path', cls: 'desk-light', points: patch(top, left, left + 0.04, 0.4, 0.66), closed: true })
  }
}

function stairs(model: Model, side: 'left' | 'right'): void {
  const { start, width, run, steps } = STAIRS
  const r = PLATFORM.half
  const h = PLATFORM.height
  // The left stairs run down along +y from the front-left edge, the right ones along +x from the front-right edge.
  const at = (across: number, out: number, z: number): P3 => side === 'left' ? [across, r + out, z] : [r + out, across, z]
  const outer = start + width
  // The visible side, a triangle under the steps: the left stairs show the side that faces right, and the other way round.
  model.parts.push({ kind: 'path', cls: `stairs ${side === 'left' ? 'tone-right' : 'tone-left'}`, points: [at(outer, 0, h), at(outer, run, 0), at(outer, 0, 0)], closed: true })
  // The steps' slope, then a line across it for every step.
  model.parts.push({ kind: 'path', cls: 'stairs tone-top', points: [at(start, 0, h), at(outer, 0, h), at(outer, run, 0), at(start, run, 0)], closed: true })
  for (let step = 1; step < steps; step++) {
    const out = run * step / steps
    const z = h * (1 - step / steps)
    line(model, 'stair-step', [at(start, out, z), at(outer, out, z)])
  }
  // A handrail on the outer side, with a post at the foot and one halfway.
  line(model, 'rail', [at(outer, 0, h + RAIL_HEIGHT), at(outer, run, RAIL_HEIGHT)])
  line(model, 'rail', [at(outer, run, 0), at(outer, run, RAIL_HEIGHT)])
  line(model, 'baluster', [at(outer, run / 2, h / 2), at(outer, run / 2, h / 2 + RAIL_HEIGHT)])
}

/** A handrail along `points`, with a post at every corner and a thin bar about every half unit between. */
function railing(model: Model, points: XY[], z: number, height: number): void {
  line(model, 'rail', points.map(([x, y]) => [x, y, z + height]))
  points.forEach((a, i) => {
    line(model, 'rail', [[a[0], a[1], z], [a[0], a[1], z + height]])
    const b = points[i + 1]
    if (b === undefined) return
    const bars = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.45)
    for (let bar = 1; bar < bars; bar++) {
      const [x, y] = add(a, scaleXY(sub(b, a), bar / bars))
      line(model, 'baluster', [[x, y, z], [x, y, z + height]])
    }
  })
}

/** Something that stands on the floor. Things are drawn back to front, by how far forward they stand (x + y). */
interface FloorThing { depth: number, draw: () => void }

// ---------- The workshop ----------

/**
 * What people need to build cars by hand, in the middle of the floor: a workbench with a tool board and someone
 * hammering at it, stacks of tyres and a crate of parts. It stands where the platform rises later.
 */
function workshop(model: Model): void {
  const [x, y] = BENCH.centre
  // To the right of the bench: two stacks of tyres, and a crate behind them.
  const stacks: Array<{ at: XY, tyres: number }> = [{ at: [3.3, 1.2], tyres: 4 }, { at: [3.9, 1.55], tyres: 2 }]
  const box = { at: [2.9, 0.7] as XY, size: 0.75, height: 0.55 }

  // Shadows first, so no shadow falls over a neighbour.
  shadow(model, benchOutline(), 0, BENCH.height)
  for (const { at, tyres } of stacks) shadow(model, circle(at, TYRE.radius), 0, tyres * TYRE.width)
  shadow(model, square(box.at, box.size), 0, box.height)

  const things: FloorThing[] = [
    { depth: x + y, draw: () => workbench(model) },
    // The worker stands in front of the bench, turned to the part that lies on it.
    { depth: x + y + 1, draw: () => model.parts.push({ kind: 'worker', at: [x - 0.1, y + BENCH.depth / 2 + 0.25, 0], height: 1.75, facing: 1, job: 'hammer' }) },
    { depth: box.at[0] + box.at[1], draw: () => crate(model, box.at, box.size, box.height) },
    ...stacks.map(({ at, tyres }): FloorThing => ({ depth: at[0] + at[1], draw: () => tyreStack(model, at, tyres) })),
  ]
  things.sort((a, b) => a.depth - b.depth).forEach(thing => thing.draw())
}

function benchOutline(): XY[] {
  const { centre: [x, y], length, depth } = BENCH
  return [[x - length / 2, y - depth / 2], [x + length / 2, y - depth / 2], [x + length / 2, y + depth / 2], [x - length / 2, y + depth / 2]]
}

/** The workbench runs along x. Behind it stands a board with tools hung on it; in front are three cupboard doors. */
function workbench(model: Model): void {
  const { centre: [x, y], length, depth, height, board } = BENCH
  const left = x - length / 2
  const back = y - depth / 2
  const front = y + depth / 2

  // The tool board on its two posts, facing the room.
  const top = height + board
  for (const post of [left + 0.06, left + length - 0.06]) line(model, 'rail', [[post, back, 0], [post, back, top]])
  model.parts.push({ kind: 'path', cls: 'tool-board tone-left', points: [[left + 0.06, back, height + 0.2], [left + length - 0.06, back, height + 0.2], [left + length - 0.06, back, top], [left + 0.06, back, top]], closed: true })
  // Each tool hangs from near the top of the board: how far along the bench, how long, and half the width of its head.
  const hung: Array<{ along: number, length: number, head: number }> = [
    { along: 0.3, length: 0.5, head: 0.12 }, { along: 0.65, length: 0.42, head: 0.06 },
    { along: 0.95, length: 0.3, head: 0 }, { along: 1.1, length: 0.3, head: 0 }, { along: 1.25, length: 0.3, head: 0 },
    { along: 1.6, length: 0.5, head: 0.1 }, { along: 1.92, length: 0.36, head: 0.05 },
  ]
  const hook = top - 0.16
  for (const tool of hung) {
    line(model, 'hung-tool', [[left + tool.along, back, hook], [left + tool.along, back, hook - tool.length]])
    if (tool.head) line(model, 'hung-tool', [[left + tool.along - tool.head, back, hook], [left + tool.along + tool.head, back, hook]])
  }

  prism(model, 'bench', benchOutline(), 0, height)
  // The front: a line under the top, and three doors with a handle each.
  const under = height - 0.14
  line(model, 'seam', [[left, front, under], [left + length, front, under]])
  for (let door = 0; door < 3; door++) {
    const from = left + (length * door) / 3
    if (door) line(model, 'seam', [[from, front, 0.05], [from, front, under]])
    line(model, 'seam', [[from + length / 6 - 0.1, front, under - 0.16], [from + length / 6 + 0.1, front, under - 0.16]])
  }
  // On the bench: the part being hammered, and a tyre.
  prism(model, 'bench-part', square([x + 0.2, y + 0.04], 0.3), height, height + 0.1)
  tyreStack(model, [x + 0.75, y - 0.02], 1, height)
}

/** A stack of `count` tyres lying flat on something `z` high, with the hole of the top one showing. */
function tyreStack(model: Model, at: XY, count: number, z = 0): void {
  for (let tyre = 0; tyre < count; tyre++) cylinder(model, 'rubber', at, TYRE.radius, z + tyre * TYRE.width, z + (tyre + 1) * TYRE.width)
  model.parts.push({ kind: 'path', cls: 'rubber-hole', points: circle(at, TYRE.radius * 0.5).map(([x, y]) => [x, y, z + count * TYRE.width]), closed: true })
}

/** A wooden crate: a box with a cross brace on each side that shows. */
function crate(model: Model, at: XY, size: number, height: number): void {
  const [a, b, c, d] = square(at, size)
  prism(model, 'crate', [a, b, c, d], 0, height)
  // The two sides towards the room run from b to c and from c to d.
  for (const [from, to] of [[b, c], [c, d]]) {
    line(model, 'seam', [[from[0], from[1], 0], [to[0], to[1], height]])
    line(model, 'seam', [[from[0], from[1], height], [to[0], to[1], 0]])
  }
}

// ---------- The floor ----------

function floor(model: Model): void {
  const { start, centre: c, width: w, height, turntable, turntableHeight } = LINE
  const leftBelt: XY[] = [[start, c - w / 2], [c, c - w / 2], [c, c + w / 2], [start, c + w / 2]]
  const rightBelt: XY[] = [[c - w / 2, start], [c + w / 2, start], [c + w / 2, c], [c - w / 2, c]]

  const cars: Array<{ at: XY, dir: XY, z: number }> = [
    { at: [start + 3.4, c], dir: [1, 0], z: height },
    { at: [c, start + 3.4], dir: [0, 1], z: height },
    { at: [c, c], dir: unit([1, 1]), z: turntableHeight },
  ]

  // Building the car, people work on every car: one behind each side car, on the floor just behind its belt and
  // beside the bonnet (the cabin would hide their tools), and two on the turntable beside the front car. Each faces
  // the car they work on.
  const workers: Array<{ at: P3, car: XY, job: Job }> = [
    { at: [start + 4.45, c - 1.0, 0], car: cars[0].at, job: 'weld' },
    { at: [c - 1.0, start + 4.45, 0], car: cars[1].at, job: 'hammer' },
    { at: [c - 0.57, c + 0.78, turntableHeight], car: cars[2].at, job: 'wrench' },
    { at: [c + 0.78, c - 0.57, turntableHeight], car: cars[2].at, job: 'weld' },
  ]

  // Building the factory, an arm (an agent) stands at every station instead, reaching over a car's roof: one on
  // the floor behind each side car, and two on the belts beside the turntable. `turn` mirrors left and right.
  const roof = CAR.cabin.height
  const arms: Array<{ base: P3, target: P3, car: XY, turn: 1 | -1 }> = [
    { base: [start + 4.2, c - w / 2 - 0.8, 0], target: [start + 3.3, c, height + roof], car: cars[0].at, turn: 1 },
    { base: [c - w / 2 - 0.8, start + 4.2, 0], target: [c, start + 3.3, height + roof], car: cars[1].at, turn: -1 },
    { base: [c - 2.3, c - 0.2, height], target: [c - 0.25, c + 0.15, turntableHeight + roof], car: cars[2].at, turn: 1 },
    { base: [c - 0.2, c - 2.3, height], target: [c + 0.15, c - 0.25, turntableHeight + roof], car: cars[2].at, turn: -1 },
  ]

  // Pillars with lamps at both ends of each belt, and a rail between the outer ones.
  const out = w / 2 + 0.4
  const pillars: XY[] = [
    [start - 0.2, c - out], [start - 0.2, c + out], [c - out, start - 0.2], [c + out, start - 0.2],
    [c - 2.4, c + out], [c + out, c - 2.4],
  ]

  // First what lies flat on the floor, under everything: the shadows, and a marked pad at each side station.
  shadow(model, leftBelt, 0, height)
  shadow(model, rightBelt, 0, height)
  shadow(model, circle([c, c], turntable), 0, turntableHeight)
  for (const at of pillars) shadow(model, square(at, PILLAR.size), 0, PILLAR.height)
  for (const { base } of arms.slice(0, 2)) {
    const pad = square([base[0], base[1]], 1.5)
    model.parts.push({ kind: 'path', cls: 'station-pad line', points: pad.map(([x, y]) => [x, y, 0]), closed: true })
  }

  // The two belts and the turntable where they meet. On each belt: a rail along both edges, rollers across, and
  // the chain down the middle, which runs towards the turntable (style.css moves its dashes).
  prism(model, 'belt', leftBelt, 0, height)
  prism(model, 'belt', rightBelt, 0, height)
  const edge = w / 2 - 0.12
  const belts: Array<(along: number, across: number) => P3> = [
    (along, across) => [along, c + across, height],
    (along, across) => [c + across, along, height],
  ]
  for (const at of belts) {
    for (const side of [-edge, edge]) line(model, 'belt-rail', [at(start + 0.1, side), at(c - turntable + 0.2, side)])
    for (let along = start + 0.5; along < c - turntable; along += 0.55) line(model, 'roller', [at(along, -edge), at(along, edge)])
    line(model, 'belt-chain', [at(start + 0.15, 0), at(c - turntable, 0)])
  }
  cylinder(model, 'turntable', [c, c], turntable, 0, turntableHeight)
  line(model, 'turntable-ring', [...circle([c, c], turntable - 0.22), circle([c, c], turntable - 0.22)[0]].map(([x, y]) => [x, y, turntableHeight]))

  const things: FloorThing[] = []
  for (const { at, dir, z } of cars) things.push({ depth: at[0] + at[1], draw: () => car(model, at, dir, z) })
  for (const { at, car, job } of workers) {
    const facing = raw([car[0], car[1], 0])[0] > raw(at)[0] ? 1 : -1
    things.push({ depth: at[0] + at[1], draw: () => model.parts.push({ kind: 'worker', at, height: 1.75, facing, job }) })
  }
  // Each arm is drawn just after the car it works on, so its tool and sparks show on the roof.
  arms.forEach(({ base, target, car, turn }, order) => {
    things.push({ depth: car[0] + car[1] + 0.01, draw: () => arm(model, base, target, turn, order) })
  })
  for (const at of pillars) things.push({ depth: at[0] + at[1], draw: () => pillar(model, at) })
  const outerRails: XY[][] = [[pillars[1], pillars[4]], [pillars[3], pillars[5]]]
  for (const [a, b] of outerRails) {
    things.push({
      depth: (a[0] + a[1] + b[0] + b[1]) / 2 + 0.01,
      draw: () => line(model, 'rail', [[a[0], a[1], PILLAR.rail], [b[0], b[1], PILLAR.rail]]),
    })
  }

  things.sort((a, b) => a.depth - b.depth).forEach(thing => thing.draw())
}

/**
 * A car at `centre`, its front towards `dir`, standing on something `z` high. Every car on the line shows its
 * front to the room; one that stands across the view also shows a side, with its wheels and doors.
 */
function car(model: Model, centre: XY, dir: XY, z: number): void {
  const { halfWidth: hw, body, cabin, wheels } = CAR
  const across: XY = [-dir[1], dir[0]]
  const flat = (a: number, c: number): XY => add(add(centre, scaleXY(dir, a)), scaleXY(across, c))
  const at = (a: number, c: number, up: number): P3 => [...flat(a, c), z + up]
  // The side that faces the room: 1 or -1 across the car, or 0 when the car points straight at the viewer.
  const side = [1, -1].find(s => dot(scaleXY(across, s), [1, 1]) > 0.2) ?? 0
  const frontShows = dot(dir, [1, 1]) > 0
  // A face of the body between two points of its profile, from one side of the car to the other.
  const strip = (from: XY, to: XY): P3[] => [at(from[0], -hw, from[1]), at(from[0], hw, from[1]), at(to[0], hw, to[1]), at(to[0], -hw, to[1])]

  shadow(model, [flat(body.rearBumper[0], -hw), flat(body.frontBumper[0], -hw), flat(body.frontBumper[0], hw), flat(body.rearBumper[0], hw)], z, 0.5)

  // The body: every face of its profile that is turned to the room, then the side.
  const profile: XY[] = [body.rearBumper, body.tail, body.boot, body.cowl, body.bonnetEdge, body.nose, body.frontBumper]
  for (let i = 0; i + 1 < profile.length; i++) {
    const [from, to] = [profile[i], profile[i + 1]]
    // Which way the face looks: `forwards` along the car and `upwards`.
    const forwards = from[1] - to[1]
    const upwards = to[0] - from[0]
    if (forwards * dot(dir, [1, 1]) + upwards <= 1e-9) continue
    const tone = upwards > 2 * Math.abs(forwards) ? 'tone-top' : sideTone(scaleXY(dir, Math.sign(forwards)))
    model.parts.push({ kind: 'path', cls: `car ${tone}`, points: strip(from, to), closed: true })
  }
  if (side) {
    model.parts.push({ kind: 'path', cls: `car ${sideTone(scaleXY(across, side))}`, points: profile.map(([a, up]) => at(a, side * hw, up)), closed: true })
    // The doors' seams and a handle, then the wheels.
    for (const a of [-0.36, 0.46]) line(model, 'seam', [at(a, side * hw, 0.27), at(a, side * hw, 0.7)])
    line(model, 'seam', [at(0.18, side * hw, 0.58), at(0.34, side * hw, 0.58)])
    for (const a of [wheels.rear, wheels.front]) {
      for (const [cls, radius] of [['tyre', wheels.radius], ['hub', wheels.radius * 0.5]] as const) {
        const ring = circle([a, wheels.radius], radius).map(([along, up]) => at(along, side * (hw + 0.01), up))
        model.parts.push({ kind: 'path', cls, points: ring, closed: true })
      }
    }
  }
  if (frontShows) {
    // Two creases down the bonnet, the headlights on the nose and the grille in the bumper.
    const bonnet = strip(body.cowl, body.bonnetEdge)
    for (const c of [0.26, 0.74]) {
      const crease = patch(bonnet, c, c, 0.1, 0.96)
      line(model, 'seam', [crease[0], crease[3]])
    }
    const nose = strip(body.bonnetEdge, body.nose)
    for (const [from, to] of [[0.05, 0.3], [0.7, 0.95]]) model.parts.push({ kind: 'path', cls: 'headlight', points: patch(nose, from, to, 0.2, 0.9), closed: true })
    model.parts.push({ kind: 'path', cls: 'grille', points: patch(strip(body.nose, body.frontBumper), 0.3, 0.7, 0.22, 0.6), closed: true })
  }

  // The cabin, narrower at the roof, with glass in every side that shows.
  const corners = ([rear, front]: XY, half: number): XY[] => [flat(rear, -half), flat(front, -half), flat(front, half), flat(rear, half)]
  const beltline = body.cowl[1]
  const sides = frustum(model, 'car', corners(cabin.foot, cabin.footHalfWidth), corners(cabin.roof, cabin.roofHalfWidth), z + beltline, z + cabin.height)
  for (const { edge, points } of sides) {
    // Edges 1 and 3 are the windscreen and the rear window. Edges 0 and 2 are the sides: two windows and a pillar.
    const panes = edge % 2 === 1 ? [[0.07, 0.93]] : [[0.06, 0.47], [0.53, 0.94]]
    for (const [from, to] of panes) model.parts.push({ kind: 'path', cls: 'glass', points: patch(points, from, to, 0.14, 0.88), closed: true })
  }
}

/** An arm on its base at `base`, reaching over to `target` on a car's roof. */
function arm(model: Model, base: P3, target: P3, turn: 1 | -1, order: number): void {
  const [x, y, z] = base
  // The base and the turret on it are drawn with the arm, so they arrive together.
  const foot: Model = { parts: [] }
  cylinder(foot, 'arm-base', [x, y], ARM.baseRadius, z, z + ARM.baseHeight)
  cylinder(foot, 'arm-base', [x, y], ARM.turretRadius, z + ARM.baseHeight, z + ARM.baseHeight + ARM.turretHeight)
  const elbow: P3 = [x + (target[0] - x) * 0.3, y + (target[1] - y) * 0.3, ARM.elbow]
  const wrist: P3 = [target[0], target[1], target[2] + ARM.tool]
  model.parts.push({
    kind: 'arm',
    base: foot.parts.filter((part): part is WorldPath => part.kind === 'path'),
    shoulder: [x, y, z + ARM.shoulder],
    elbow,
    wrist,
    tip: target,
    // A short stub past the elbow, away from the wrist.
    motor: lerp3(elbow, wrist, -0.2),
    turn,
    order,
  })
}

function pillar(model: Model, at: XY): void {
  prism(model, 'pillar', square(at, PILLAR.size), 0, PILLAR.height)
  model.parts.push({ kind: 'beacon', at: [at[0], at[1], PILLAR.height + 0.14] })
}

// ---------- Solids ----------

/** A line, or several joined, through `points`. */
function line(model: Model, cls: string, points: P3[]): void {
  model.parts.push({ kind: 'path', cls: `${cls} line`, points, closed: false })
}

/** The tone of an upright face from the direction it faces on the floor plan. */
function sideTone([x, y]: XY): string {
  if (Math.abs(x - y) < 0.25 * Math.hypot(x, y)) return 'tone-front'
  return x > y ? 'tone-right' : 'tone-left'
}

/** An upright solid with the same outline top and bottom; only the faces turned to the room are drawn. */
function prism(model: Model, cls: string, outline: XY[], z0: number, z1: number): void {
  const clockwise = signedArea(outline) < 0
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    const [dx, dy] = sub(b, a)
    const normal: XY = clockwise ? [-dy, dx] : [dy, -dx]
    if (dot(normal, [1, 1]) <= 1e-9) return
    model.parts.push({ kind: 'path', cls: `${cls} ${sideTone(normal)}`, points: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], closed: true })
  })
  model.parts.push({ kind: 'path', cls: `${cls} tone-top`, points: outline.map(([x, y]) => [x, y, z1]), closed: true })
}

/**
 * Like a prism, with a smaller top: a car's cabin. Returns the sides that are turned to the room, each with the
 * number of its bottom edge, so the caller can put a window in them.
 */
function frustum(model: Model, cls: string, bottom: XY[], top: XY[], z0: number, z1: number): Array<{ edge: number, points: P3[] }> {
  const centre: P3 = [average(bottom.map(p => p[0])), average(bottom.map(p => p[1])), (z0 + z1) / 2]
  const shown: Array<{ edge: number, points: P3[] }> = []
  bottom.forEach((a, edge) => {
    const next = (edge + 1) % bottom.length
    const b = bottom[next]
    const face: P3[] = [[a[0], a[1], z0], [b[0], b[1], z0], [top[next][0], top[next][1], z1], [top[edge][0], top[edge][1], z1]]
    let normal = cross(sub3(face[1], face[0]), sub3(face[3], face[0]))
    const middle: P3 = [average(face.map(p => p[0])), average(face.map(p => p[1])), average(face.map(p => p[2]))]
    if (dot3(normal, sub3(middle, centre)) < 0) normal = [-normal[0], -normal[1], -normal[2]]
    if (dot3(normal, [1, 1, 1]) <= 1e-9) return
    model.parts.push({ kind: 'path', cls: `${cls} ${sideTone([normal[0], normal[1]])}`, points: face, closed: true })
    shown.push({ edge, points: face })
  })
  model.parts.push({ kind: 'path', cls: `${cls} tone-top`, points: top.map(([x, y]) => [x, y, z1]), closed: true })
  return shown
}

/** An upright cylinder: its front side, then its top. */
function cylinder(model: Model, cls: string, [cx, cy]: XY, r: number, z0: number, z1: number): void {
  const ring = (z: number, from: number, to: number): P3[] => {
    const points: P3[] = []
    for (let i = 0; i <= 32; i++) {
      const t = from + (to - from) * i / 32
      points.push([cx + r * Math.cos(t), cy + r * Math.sin(t), z])
    }
    return points
  }
  // The half facing the room runs from the right-most point on the slide (-45 degrees) to the left-most (135).
  model.parts.push({ kind: 'path', cls: `${cls} tone-front`, points: [...ring(z0, -Math.PI / 4, (3 * Math.PI) / 4), ...ring(z1, (3 * Math.PI) / 4, -Math.PI / 4)], closed: true })
  model.parts.push({ kind: 'path', cls: `${cls} tone-top`, points: ring(z1, 0, Math.PI * 2), closed: true })
}

/**
 * The shadow of a solid that stands on a surface `z` high and rises `height` above it: its outline, and the same
 * outline pushed along SHADOW, as one shape.
 */
function shadow(model: Model, outline: XY[], z: number, height: number): void {
  const cast = outline.map(p => add(p, scaleXY(SHADOW, height)))
  model.parts.push({ kind: 'path', cls: 'shadow', points: hull([...outline, ...cast]).map(([x, y]) => [x, y, z]), closed: true })
}

/** A part of a four-cornered face: from `u0` to `u1` along its first edge and from `v0` to `v1` towards the opposite one. */
function patch([a, b, c, d]: P3[], u0: number, u1: number, v0: number, v1: number): P3[] {
  const at = (u: number, v: number) => lerp3(lerp3(a, b, u), lerp3(d, c, u), v)
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]
}

/** 24 points around a circle. */
function circle([cx, cy]: XY, r: number): XY[] {
  return Array.from({ length: 24 }, (_, i): XY => [cx + r * Math.cos((i / 24) * Math.PI * 2), cy + r * Math.sin((i / 24) * Math.PI * 2)])
}

function square([x, y]: XY, size: number): XY[] {
  const s = size / 2
  return [[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]]
}

// ---------- Projection ----------

/** The points that decide how big the drawing is. Shadows are left out: they may run off the slide. */
function framedPoints(parts: WorldPart[]): P3[] {
  return parts.flatMap((part): P3[] => {
    switch (part.kind) {
      case 'path': return part.cls === 'shadow' ? [] : part.points
      case 'arm': return [...framedPoints(part.base), part.elbow, part.wrist]
      case 'screen': return [part.corner]
      case 'beacon': return [part.at]
      case 'person': return [part.at]
      case 'worker': return [part.at]
    }
  })
}

function resolve(part: WorldPart, project: (p: P3) => P2, scale: number): Part {
  switch (part.kind) {
    case 'path':
      return resolvePath(part, project)
    case 'arm': {
      const tip = project(part.tip)
      return {
        kind: 'arm',
        turn: part.turn,
        order: part.order,
        base: part.base.map(face => resolvePath(face, project)),
        shoulder: project(part.shoulder),
        elbow: project(part.elbow),
        wrist: project(part.wrist),
        tip,
        motor: project(part.motor),
        sparks: sparkRays(tip, scale * 0.1, scale * 0.42),
        sizes: { upper: round(scale * 0.27), fore: round(scale * 0.2), joint: round(scale * 0.15), glow: round(scale * 1.5) },
      }
    }
    case 'beacon':
      return { kind: 'beacon', at: project(part.at), r: round(scale * 0.11) }
    case 'person': {
      const feet = project(part.at)
      const height = scale * part.height
      return { kind: 'person', d: personOutline(feet, height), shadow: groundShadow(feet, height) }
    }
    case 'worker':
      return workerParts(project(part.at), scale * part.height, part.facing, part.job)
    case 'screen': {
      // The picture is drawn in a 1600 x 900 box, then mapped onto the monitor's face.
      const width = 1600
      const height = 900
      const corner = project(part.corner)
      const right = project(part.right)
      const down = project(part.down)
      const matrix = [(right[0] - corner[0]) / width, (right[1] - corner[1]) / width, (down[0] - corner[0]) / height, (down[1] - corner[1]) / height, corner[0], corner[1]]
      return { kind: 'screen', cls: part.cls, matrix: `matrix(${matrix.map(n => Number(n.toFixed(5))).join(' ')})`, width, height }
    }
  }
}

function resolvePath(part: WorldPath, project: (p: P3) => P2): Path {
  return { kind: 'path', cls: part.cls, d: pathOf(part.points.map(project), part.closed) }
}

/** The shadow at the feet of someone `height` slide pixels tall: flat, and a little to the right, like every shadow. */
function groundShadow([x, y]: P2, height: number): Ellipse {
  return { cx: round(x + height * 0.07), cy: round(y - height * 0.005), rx: round(height * 0.21), ry: round(height * 0.055) }
}

/**
 * The person on the platform, seen from behind with their hands on their hips: someone who oversees. BACK_VIEW is
 * half the body from the neck down the right side to the crotch, in fractions of their height from the feet (up
 * is negative). ARM_GAP is the opening between that arm and the body. The left side mirrors both.
 */
const BACK_VIEW: XY[] = [
  // The neck and the shoulder.
  [0.03, -0.868], [0.035, -0.835], [0.13, -0.815], [0.185, -0.785],
  // The arm: out to the elbow, and back in to the hand on the hip.
  [0.25, -0.7], [0.295, -0.625], [0.275, -0.595], [0.165, -0.475],
  // The hip, then the leg down to the shoe and back up to the crotch.
  [0.125, -0.49], [0.118, -0.27], [0.098, -0.05], [0.125, 0], [0.025, 0], [0.03, -0.05], [0.02, -0.27], [0, -0.46],
]
const ARM_GAP: XY[] = [[0.15, -0.72], [0.232, -0.635], [0.135, -0.54], [0.108, -0.61]]

/** The head, the body and the two arm gaps as one path. style.css fills it "evenodd", which leaves the gaps open. */
function personOutline([x, y]: P2, height: number): string {
  const at = ([a, b]: XY): P2 => [round(x + a * height), round(y + b * height)]
  const mirrored = (points: XY[]) => points.map(([a, b]): XY => [-a, b])
  const r = round(height * 0.065)
  const [left, headY] = at([-0.065, -0.935])
  const head = `M${left} ${headY} A${r} ${r} 0 1 0 ${round(left + 2 * r)} ${headY} A${r} ${r} 0 1 0 ${left} ${headY} Z`
  // Down the right side, then back up the left one; the crotch, the last point, belongs to both.
  const body = [...BACK_VIEW, ...mirrored(BACK_VIEW.slice(0, -1)).reverse()]
  return [head, pathOf(body.map(at), true), pathOf(ARM_GAP.map(at), true), pathOf(mirrored(ARM_GAP).map(at), true)].join(' ')
}

/**
 * A worker's pose, facing right, in fractions of their height from the feet (y up is negative): leaning in, the
 * far arm resting on the car, the working arm reaching forward with the tool.
 */
const POSE = {
  backFoot: [-0.11, 0], frontFoot: [0.07, 0], hip: [-0.02, -0.47], shoulder: [0.08, -0.74], head: [0.14, -0.865],
  elbow: [0.2, -0.6], hand: [0.34, -0.58], restElbow: [0.17, -0.55], restHand: [0.3, -0.49],
} satisfies Record<string, XY>

/** The hard hat, in fractions of the worker's height: a dome this wide, sitting a little above the middle of the head. */
const HAT = { radius: 0.1, brim: 0.075, sits: 0.02 }

/**
 * Each job's tool, from the hand: where its handle ends (`end`), half the length of the bar across that end
 * (`bar`, 0 for none), and whether sparks fly from it.
 */
const TOOLS: Record<Job, { end: XY, bar: number, sparks: boolean }> = {
  // A torch, pointed down at the car.
  weld: { end: [0.1, 0.07], bar: 0, sparks: true },
  // The handle points up from the fist; the head lies across its end.
  hammer: { end: [0.06, -0.15], bar: 0.06, sparks: false },
  // Held out level, the jaw across its end.
  wrench: { end: [0.12, 0.02], bar: 0.04, sparks: false },
}

function workerParts([x, y]: P2, height: number, facing: 1 | -1, job: Job): Worker {
  const at = ([a, b]: XY): P2 => [round(x + facing * a * height), round(y + b * height)]
  const stroke = (...points: XY[]) => pathOf(points.map(at), false)
  const { end, bar, sparks } = TOOLS[job]
  const tip = add(POSE.hand, end)
  // The bar runs across the handle's end, at right angles to it.
  const across = scaleXY(unit([-end[1], end[0]]), bar)
  // The hat's dome, from the back of the head over the top to the front, then out to the tip of the brim.
  const brow = POSE.head[1] - HAT.sits
  const dome: XY[] = Array.from({ length: 9 }, (_, i): XY => {
    const turn = (Math.PI * i) / 8
    return [POSE.head[0] - Math.cos(turn) * HAT.radius, brow - Math.sin(turn) * HAT.radius]
  })
  return {
    kind: 'worker',
    job,
    facing,
    shadow: groundShadow([x, y], height),
    restArm: stroke(POSE.shoulder, POSE.restElbow, POSE.restHand),
    legs: `${stroke(POSE.backFoot, POSE.hip)} ${stroke(POSE.frontFoot, POSE.hip)}`,
    trunk: stroke(POSE.hip, POSE.shoulder),
    head: { at: at(POSE.head), r: round(height * 0.085) },
    hat: pathOf([...dome, [POSE.head[0] + HAT.radius + HAT.brim, brow] as XY].map(at), true),
    upperArm: stroke(POSE.shoulder, POSE.elbow),
    forearm: stroke(POSE.elbow, POSE.hand),
    tool: stroke(POSE.hand, tip),
    toolEnd: bar ? stroke(add(tip, scaleXY(across, -1)), add(tip, across)) : '',
    sparks: sparks ? sparkRays(at(tip), height * 0.035, height * 0.12) : '',
    elbow: at(POSE.elbow),
    tip: at(tip),
    sizes: { limb: round(height * 0.085), trunk: round(height * 0.17), tool: round(height * 0.028), glow: round(height * 0.42) },
  }
}

/**
 * Sparks flying from a weld: short rays around `centre`, from `inner` slide pixels out. Each ray has its angle in
 * degrees (0 points right, -90 up) and how much of `outer` it reaches, so the burst is uneven and mostly upwards.
 */
const SPARK_RAYS: Array<[number, number]> = [[-150, 0.6], [-115, 1], [-80, 0.7], [-45, 1], [-10, 0.65], [30, 0.9], [80, 0.5], [160, 0.75]]

function sparkRays([x, y]: P2, inner: number, outer: number): string {
  return SPARK_RAYS.map(([degrees, reach]) => {
    const [dx, dy] = [Math.cos((degrees * Math.PI) / 180), Math.sin((degrees * Math.PI) / 180)]
    const end = inner + (outer - inner) * reach
    return pathOf([[round(x + dx * inner), round(y + dy * inner)], [round(x + dx * end), round(y + dy * end)]], false)
  }).join(' ')
}

function pathOf(points: P2[], closed: boolean): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + (closed ? ' Z' : '')
}

// ---------- Small vector helpers ----------

const round = (n: number) => Math.round(n * 10) / 10
const add = (a: XY, b: XY): XY => [a[0] + b[0], a[1] + b[1]]
const sub = (a: XY, b: XY): XY => [a[0] - b[0], a[1] - b[1]]
const scaleXY = (a: XY, k: number): XY => [a[0] * k, a[1] * k]
const dot = (a: XY, b: XY) => a[0] * b[0] + a[1] * b[1]
const unit = (a: XY): XY => scaleXY(a, 1 / Math.hypot(a[0], a[1]))
const sub3 = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot3 = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const lerp3 = (a: P3, b: P3, t: number): P3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length
function signedArea(points: XY[]): number {
  return points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length]
    return sum + x * ny - nx * y
  }, 0) / 2
}

/** The smallest outline without dents around `points` (a convex hull), for shadows. */
function hull(points: XY[]): XY[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const turnsLeft = (o: XY, a: XY, b: XY) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) > 0
  // Walk the points once for the lower edge and once backwards for the upper edge, dropping every point that makes a dent.
  const half = (list: XY[]): XY[] => {
    const edge: XY[] = []
    for (const p of list) {
      while (edge.length >= 2 && !turnsLeft(edge[edge.length - 2], edge[edge.length - 1], p)) edge.pop()
      edge.push(p)
    }
    return edge.slice(0, -1)
  }
  return [...half(sorted), ...half(sorted.reverse())]
}

/** The part of the line from `a` to `b` that lies inside an outline without dents, or null when it misses it. */
function clipToOutline(a: XY, b: XY, outline: XY[]): [XY, XY] | null {
  const inwards = signedArea(outline) > 0 ? 1 : -1
  const step = sub(b, a)
  let from = 0
  let to = 1
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i]
    const [ex, ey] = sub(outline[(i + 1) % outline.length], p)
    const normal: XY = [-ey * inwards, ex * inwards]
    const distance = dot(normal, sub(a, p))
    const change = dot(normal, step)
    if (Math.abs(change) < 1e-9) {
      if (distance < 0) return null
      continue
    }
    if (change > 0) from = Math.max(from, -distance / change)
    else to = Math.min(to, -distance / change)
  }
  return from < to ? [add(a, scaleXY(step, from)), add(a, scaleXY(step, to))] : null
}
