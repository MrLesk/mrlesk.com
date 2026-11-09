/**
 * The finale's production line as an isometric line drawing (pages/30-finale.md draws it with
 * components/FactoryFloor.vue). It holds two scenes on one floor plan, and the CSS shows one at a time:
 *
 * - building the car: people work on every car of the line, each with a tool;
 * - building the factory: a robot arm, an agent, stands at every station instead, and behind the line stairs lead
 *   up to a raised platform where a person oversees on three monitors.
 *
 * The scene is a small model in world units: x runs towards the bottom right of the slide, y towards the bottom
 * left, z up. `scene()` projects it onto the 980 x 551 slide, scaled to fit, and lists the parts back to front so
 * later parts cover earlier ones. To move or resize something, change its numbers in the constants below.
 */

type XY = [number, number]
type P3 = [number, number, number]
export type P2 = [number, number]

export type Part =
  /** A face, or a line when `cls` contains "line". */
  | { kind: 'path', cls: string, d: string }
  /** A robot arm: a base, then an upper arm, an elbow and a forearm that swings around the elbow, with sparks at the tool. */
  | { kind: 'arm', base: string[], shoulder: P2, elbow: P2, wrist: P2, tool: P2, sparks: string, swing: 'left' | 'right' }
  /** The light on top of a pillar. */
  | { kind: 'beacon', at: P2, r: number }
  /** A monitor's picture, drawn into the monitor's plane by an SVG matrix. */
  | { kind: 'screen', cls: string, matrix: string, width: number, height: number }
  /** The person who oversees from the platform, seen from behind, as one filled outline. */
  | { kind: 'person', d: string }
  /** A person building a car, seen from the side and facing it (see `workerParts()`). */
  | Worker

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
  /** The far arm, resting on the car, then the legs and the trunk. */
  restArm: string
  legs: string
  trunk: string
  head: { at: P2, r: number }
  upperArm: string
  forearm: string
  /** The tool's handle, and the bar across its end (empty for the torch). */
  tool: string
  toolEnd: string
  /** Short rays around the torch's tip (empty for the other tools). */
  sparks: string
  elbow: P2
  tip: P2
  /** Stroke widths in slide pixels, so the lines keep their proportions at any scale. */
  widths: { limb: number, trunk: number, tool: number }
}

const SLIDE = { width: 980, height: 551, margin: 26 }
/** The band at the top of the slide that the car's framing leaves free for the title. */
const TITLE_BAND = 96

/** The raised platform: an octagon `half` units from the centre, with cut corners. */
const PLATFORM = { half: 2.3, backCut: 1.6, sideCut: 0.8, frontCut: 1.0, height: 1.7 }
/** Monitors stand on the three back edges. `border` is the bezel around the picture. */
const MONITOR = { inset: 0.15, lift: 0.55, height: 1.6, border: 0.04 }
/** The stairs: one down each front side, `run` units long. */
const STAIRS = { start: -1.35, width: 0.9, run: 2.2, steps: 8 }
/** The line: two belts that meet in front at (centre, centre) on a turntable. */
const LINE = { start: -3.2, centre: 6.15, width: 1.3, height: 0.3, turntable: 1.5, turntableHeight: 0.4 }
const PILLAR = { size: 0.22, height: 1.8, rail: 1.05 }

/** World x and y to slide x and y before fitting: the classic 30 degree isometric. */
const COS = Math.cos(Math.PI / 6)
function raw([x, y, z]: P3): P2 {
  return [(x - y) * COS, (x + y) * 0.5 - z]
}

/** The same parts in world units, before `scene()` projects them. */
type WorldPart =
  | { kind: 'path', cls: string, points: P3[], closed: boolean }
  | { kind: 'arm', base: WorldPart[], shoulder: P3, elbow: P3, wrist: P3, tool: P3, swing: 'left' | 'right' }
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
  /** Up on the platform: the monitors and the person fill most of the slide. */
  deck: string
}

export function scene(): { platform: Part[], floor: Part[], cameras: Cameras } {
  const platformModel: Model = { parts: [] }
  const floorModel: Model = { parts: [] }
  const deckPoints: P3[] = []
  platform(platformModel, deckPoints)
  floor(floorModel)

  // Fit every point onto the slide, then project with that scale and origin.
  const all = [...allPoints(platformModel.parts), ...allPoints(floorModel.parts)]
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
    floor: floorModel.parts.map(part => resolve(part, project, scale)),
    cameras: {
      // Below the slide's title, "Factories before." (see pages/30-finale.md).
      car: camera(allPoints(floorModel.parts).map(project), 0.92, TITLE_BAND),
      factory: camera([[0, 0], [SLIDE.width, SLIDE.height]], 1),
      // The platform fills 80% of the slide, so the monitors keep clear of the deck's frame.
      deck: camera(deckPoints.map(project), 0.8),
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

  // Monitors on the left-back, back and right-back edges, facing the person.
  const screens: Array<{ cls: string, from: XY, to: XY }> = [
    { cls: 'left', from: outline[7], to: outline[0] },
    { cls: 'main', from: outline[0], to: outline[1] },
    { cls: 'right', from: outline[1], to: outline[2] },
  ]
  for (const { cls, from, to } of screens) monitor(model, deckPoints, cls, from, to)

  // The console and the person at it, far enough forward that the main monitor shows above their head.
  const desk = rotatedBox([-0.4, -0.4], unit([1, -1]), 2.0, 0.55)
  prism(model, 'console', desk, h, h + 0.85)
  for (const along of [-0.6, -0.3, 0.3, 0.6]) {
    const at = add([-0.4, -0.4], scaleXY(unit([1, -1]), along))
    model.parts.push({ kind: 'path', cls: 'console-light line', points: [[at[0], at[1], h + 0.86], [at[0] + 0.12, at[1] + 0.12, h + 0.86]], closed: false })
  }
  model.parts.push({ kind: 'person', at: [0.25, 0.25, h], height: 1.75 })
  deckPoints.push([0.25, 0.25, h])

  // Railings along the front edges, with gaps where the stairs come up.
  const { start, width } = STAIRS
  const rails: XY[][] = [
    [outline[7], outline[6], [start, r]],
    [[start + width, r], outline[5], outline[4], [r, start + width]],
    [[r, start], outline[3], outline[2]],
  ]
  for (const rail of rails) railing(model, rail, h, 0.85)

  stairs(model, 'left')
  stairs(model, 'right')
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
    model.parts.push({ kind: 'path', cls: 'monitor-post line', points: [[end[0], end[1], h], [end[0], end[1], bottom]], closed: false })
  }
  model.parts.push({ kind: 'path', cls: 'monitor', points: [[a[0], a[1], top], [b[0], b[1], top], [b[0], b[1], bottom], [a[0], a[1], bottom]], closed: true })
  const ia = add(a, scaleXY(along, border))
  const ib = add(b, scaleXY(along, -border))
  model.parts.push({ kind: 'screen', cls, corner: [ia[0], ia[1], top - border], right: [ib[0], ib[1], top - border], down: [ia[0], ia[1], bottom + border] })
  deckPoints.push([a[0], a[1], top], [b[0], b[1], top])
}

function stairs(model: Model, side: 'left' | 'right'): void {
  const { start, width, run, steps } = STAIRS
  const r = PLATFORM.half
  const h = PLATFORM.height
  // The left stairs run down along +y from the front-left edge, the right ones along +x from the front-right edge.
  const at = (across: number, out: number, z: number): P3 => side === 'left' ? [across, r + out, z] : [r + out, across, z]
  const outer = start + width
  // The visible side, a triangle under the steps.
  model.parts.push({ kind: 'path', cls: 'stairs', points: [at(outer, 0, h), at(outer, run, 0), at(outer, 0, 0)], closed: true })
  // The steps' slope, then a line across it for every step.
  model.parts.push({ kind: 'path', cls: 'stairs', points: [at(start, 0, h), at(outer, 0, h), at(outer, run, 0), at(start, run, 0)], closed: true })
  for (let step = 1; step < steps; step++) {
    const out = run * step / steps
    const z = h * (1 - step / steps)
    model.parts.push({ kind: 'path', cls: 'stair-step line', points: [at(start, out, z), at(outer, out, z)], closed: false })
  }
  // A handrail on the outer side.
  model.parts.push({ kind: 'path', cls: 'rail line', points: [at(outer, 0, h + 0.85), at(outer, run, 0.85)], closed: false })
  model.parts.push({ kind: 'path', cls: 'rail line', points: [at(outer, run, 0), at(outer, run, 0.85)], closed: false })
}

/** A handrail along `points`, with a post at every corner and a thin bar about every half unit between. */
function railing(model: Model, points: XY[], z: number, height: number): void {
  model.parts.push({ kind: 'path', cls: 'rail line', points: points.map(([x, y]) => [x, y, z + height]), closed: false })
  points.forEach((a, i) => {
    model.parts.push({ kind: 'path', cls: 'rail line', points: [[a[0], a[1], z], [a[0], a[1], z + height]], closed: false })
    const b = points[i + 1]
    if (b === undefined) return
    const bars = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.45)
    for (let bar = 1; bar < bars; bar++) {
      const [x, y] = add(a, scaleXY(sub(b, a), bar / bars))
      model.parts.push({ kind: 'path', cls: 'baluster line', points: [[x, y, z], [x, y, z + height]], closed: false })
    }
  })
}

// ---------- The floor ----------

/** Things on the floor, drawn back to front by how far forward they stand (x + y). */
interface FloorThing { depth: number, draw: () => void }

function floor(model: Model): void {
  const { start, centre: c, width: w, height, turntable, turntableHeight } = LINE
  // The two belts and the turntable where they meet.
  prism(model, 'belt', [[start, c - w / 2], [c, c - w / 2], [c, c + w / 2], [start, c + w / 2]], 0, height)
  prism(model, 'belt', [[c - w / 2, start], [c + w / 2, start], [c + w / 2, c], [c - w / 2, c]], 0, height)
  for (let x = start + 0.5; x < c - turntable; x += 0.55) {
    model.parts.push({ kind: 'path', cls: 'roller line', points: [[x, c - w / 2 + 0.1, height], [x, c + w / 2 - 0.1, height]], closed: false })
    model.parts.push({ kind: 'path', cls: 'roller line', points: [[c - w / 2 + 0.1, x, height], [c + w / 2 - 0.1, x, height]], closed: false })
  }
  cylinder(model, 'turntable', [c, c], turntable, 0, turntableHeight)

  const things: FloorThing[] = []
  const cars: Array<{ at: XY, dir: XY, z: number }> = [
    { at: [start + 3.4, c], dir: [1, 0], z: height },
    { at: [c, start + 3.4], dir: [0, 1], z: height },
    { at: [c, c], dir: unit([1, 1]), z: turntableHeight },
  ]
  for (const { at, dir, z } of cars) things.push({ depth: at[0] + at[1], draw: () => car(model, at, dir, z) })

  // Building the car, people work on every car: one behind each side car, on the floor just behind its belt and
  // beside the bonnet (the cabin would hide their tools), and two on the turntable beside the front car. Each faces
  // the car they work on.
  const workers: Array<{ at: P3, car: XY, job: Job }> = [
    { at: [start + 4.45, c - 1.0, 0], car: cars[0].at, job: 'weld' },
    { at: [c - 1.0, start + 4.45, 0], car: cars[1].at, job: 'hammer' },
    { at: [c - 0.57, c + 0.78, turntableHeight], car: cars[2].at, job: 'wrench' },
    { at: [c + 0.78, c - 0.57, turntableHeight], car: cars[2].at, job: 'weld' },
  ]
  for (const { at, car, job } of workers) {
    const facing = raw([car[0], car[1], 0])[0] > raw(at)[0] ? 1 : -1
    things.push({ depth: at[0] + at[1], draw: () => model.parts.push({ kind: 'worker', at, height: 1.75, facing, job }) })
  }

  // Building the factory, an arm (an agent) stands at every station instead, reaching over a car's roof. Each arm is
  // drawn just after the car it works on, so its tool and sparks show on the roof; its base stands clear of the car.
  const roof = height + 1.1
  const arms: Array<{ base: XY, target: P3, car: XY, swing: 'left' | 'right' }> = [
    { base: [start + 4.2, c - w / 2 - 0.8], target: [start + 3.3, c, roof], car: cars[0].at, swing: 'left' },
    { base: [c - w / 2 - 0.8, start + 4.2], target: [c, start + 3.3, roof], car: cars[1].at, swing: 'right' },
    { base: [c - 2.3, c - 0.2], target: [c - 0.25, c + 0.15, turntableHeight + 1.1], car: cars[2].at, swing: 'left' },
    { base: [c - 0.2, c - 2.3], target: [c + 0.15, c - 0.25, turntableHeight + 1.1], car: cars[2].at, swing: 'right' },
  ]
  for (const { base, target, car, swing } of arms) {
    things.push({ depth: car[0] + car[1] + 0.01, draw: () => arm(model, base, target, swing) })
  }

  // Pillars with lights at both ends of each belt, and a rail between the outer ones.
  const out = w / 2 + 0.4
  const pillars: XY[] = [
    [start - 0.2, c - out], [start - 0.2, c + out], [c - out, start - 0.2], [c + out, start - 0.2],
    [c - 2.4, c + out], [c + out, c - 2.4],
  ]
  for (const at of pillars) things.push({ depth: at[0] + at[1], draw: () => pillar(model, at) })
  const outerRails: XY[][] = [[pillars[1], pillars[4]], [pillars[3], pillars[5]]]
  for (const [a, b] of outerRails) {
    things.push({
      depth: (a[0] + a[1] + b[0] + b[1]) / 2 + 0.01,
      draw: () => model.parts.push({ kind: 'path', cls: 'rail line', points: [[a[0], a[1], PILLAR.rail], [b[0], b[1], PILLAR.rail]], closed: false }),
    })
  }

  things.sort((a, b) => a.depth - b.depth).forEach(thing => thing.draw())
}

function car(model: Model, centre: XY, dir: XY, z: number): void {
  const across: XY = [-dir[1], dir[0]]
  const local = (a: number, c: number): XY => add(add(centre, scaleXY(dir, a)), scaleXY(across, c))
  const body: XY[] = [[-1.2, -0.42], [-1.05, -0.58], [1.0, -0.58], [1.2, -0.4], [1.2, 0.4], [1.0, 0.58], [-1.05, 0.58], [-1.2, 0.42]].map(([a, c]) => local(a, c))
  prism(model, 'car', body, z + 0.18, z + 0.62)
  // Headlights on the front, when the front faces the room.
  if (dot(dir, [1, 1]) > 0) {
    for (const c of [-0.36, 0.36]) {
      const [x, y] = local(1.2, c)
      model.parts.push({ kind: 'path', cls: 'headlight', points: [[x, y, z + 0.44], [x - across[0] * 0.1, y - across[1] * 0.1, z + 0.44]], closed: false })
    }
  }
  const cabinBase: XY[] = [[-0.85, -0.54], [0.35, -0.54], [0.35, 0.54], [-0.85, 0.54]].map(([a, c]) => local(a, c))
  const cabinTop: XY[] = [[-0.68, -0.44], [0.0, -0.44], [0.0, 0.44], [-0.68, 0.44]].map(([a, c]) => local(a, c))
  frustum(model, 'car', cabinBase, cabinTop, z + 0.62, z + 1.02, true)
  // Wheels on the side that faces the room.
  for (const side of [-1, 1]) {
    const normal = scaleXY(across, side)
    if (dot(normal, [1, 1]) <= 0.2) continue
    for (const a of [-0.72, 0.72]) {
      const [x, y] = local(a, 0.59 * side)
      const points: P3[] = []
      for (let i = 0; i < 24; i++) {
        const t = (i / 24) * Math.PI * 2
        points.push([x + dir[0] * Math.cos(t) * 0.24, y + dir[1] * Math.cos(t) * 0.24, z + 0.24 + Math.sin(t) * 0.24])
      }
      model.parts.push({ kind: 'path', cls: 'wheel', points, closed: true })
    }
  }
}

function arm(model: Model, base: XY, target: P3, swing: 'left' | 'right'): void {
  const baseFaces: Model = { parts: [] }
  cylinder(baseFaces, 'arm-base', base, 0.4, 0, 0.36)
  const reach = sub([target[0], target[1]], base)
  const elbow: P3 = [base[0] + reach[0] * 0.3, base[1] + reach[1] * 0.3, 2.35]
  model.parts.push({
    kind: 'arm',
    base: baseFaces.parts,
    shoulder: [base[0], base[1], 0.6],
    elbow,
    wrist: [target[0], target[1], target[2] + 0.45],
    tool: [target[0], target[1], target[2]],
    swing,
  })
}

function pillar(model: Model, [x, y]: XY): void {
  const s = PILLAR.size / 2
  prism(model, 'pillar', [[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]], 0, PILLAR.height)
  model.parts.push({ kind: 'beacon', at: [x, y, PILLAR.height + 0.14] })
}

// ---------- Solids ----------

/** An upright solid with the same outline top and bottom; only the faces turned to the room are drawn. */
function prism(model: Model, cls: string, outline: XY[], z0: number, z1: number): void {
  const clockwise = signedArea(outline) < 0
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length]
    const [dx, dy] = sub(b, a)
    const normal: XY = clockwise ? [-dy, dx] : [dy, -dx]
    if (dot(normal, [1, 1]) <= 1e-9) return
    model.parts.push({ kind: 'path', cls, points: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], closed: true })
  })
  model.parts.push({ kind: 'path', cls, points: outline.map(([x, y]) => [x, y, z1]), closed: true })
}

/** Like a prism, with a smaller top: a car's cabin. With `windows`, every side shows a pane. */
function frustum(model: Model, cls: string, bottom: XY[], top: XY[], z0: number, z1: number, windows: boolean): void {
  const centre: P3 = [average(bottom.map(p => p[0])), average(bottom.map(p => p[1])), (z0 + z1) / 2]
  bottom.forEach((a, i) => {
    const b = bottom[(i + 1) % bottom.length]
    const face: P3[] = [[a[0], a[1], z0], [b[0], b[1], z0], [top[(i + 1) % top.length][0], top[(i + 1) % top.length][1], z1], [top[i][0], top[i][1], z1]]
    let normal = cross(sub3(face[1], face[0]), sub3(face[3], face[0]))
    const middle: P3 = [average(face.map(p => p[0])), average(face.map(p => p[1])), average(face.map(p => p[2]))]
    if (dot3(normal, sub3(middle, centre)) < 0) normal = [-normal[0], -normal[1], -normal[2]]
    if (dot3(normal, [1, 1, 1]) <= 1e-9) return
    model.parts.push({ kind: 'path', cls, points: face, closed: true })
    if (windows) model.parts.push({ kind: 'path', cls: 'window', points: face.map(p => lerp3(middle, p, 0.72)), closed: true })
  })
  model.parts.push({ kind: 'path', cls, points: top.map(([x, y]) => [x, y, z1]), closed: true })
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
  model.parts.push({ kind: 'path', cls, points: [...ring(z0, -Math.PI / 4, (3 * Math.PI) / 4), ...ring(z1, (3 * Math.PI) / 4, -Math.PI / 4)], closed: true })
  model.parts.push({ kind: 'path', cls, points: ring(z1, 0, Math.PI * 2), closed: true })
}

function rotatedBox(centre: XY, dir: XY, length: number, width: number): XY[] {
  const across: XY = [-dir[1], dir[0]]
  return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, c]) => add(add(centre, scaleXY(dir, (a * length) / 2)), scaleXY(across, (c * width) / 2)))
}

// ---------- Projection ----------

function allPoints(parts: WorldPart[]): P3[] {
  return parts.flatMap((part): P3[] => {
    switch (part.kind) {
      case 'path': return part.points
      case 'arm': return [...allPoints(part.base), part.elbow, part.wrist]
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
      return { kind: 'path', cls: part.cls, d: pathOf(part.points.map(project), part.closed) }
    case 'arm':
      return {
        kind: 'arm',
        base: part.base.map(face => face.kind === 'path' ? pathOf(face.points.map(project), face.closed) : ''),
        shoulder: project(part.shoulder),
        elbow: project(part.elbow),
        wrist: project(part.wrist),
        tool: project(part.tool),
        sparks: sparkRays(project(part.tool), scale * 0.1, scale * 0.36),
        swing: part.swing,
      }
    case 'beacon':
      return { kind: 'beacon', at: project(part.at), r: round(scale * 0.11) }
    case 'person':
      return { kind: 'person', d: personOutline(project(part.at), scale * part.height) }
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

/** A person seen from behind, feet at `at`, arms down: the head, then the body as one outline. */
function personOutline([x, y]: P2, height: number): string {
  const r = height * 0.085
  const headY = round(y - height * 0.89)
  const head = `M${round(x - r)} ${headY} A${round(r)} ${round(r)} 0 1 0 ${round(x + r)} ${headY} A${round(r)} ${round(r)} 0 1 0 ${round(x - r)} ${headY} Z`
  // Half the body, from the neck down the left side to the middle; the right side mirrors it.
  const left: XY[] = [[-0.04, -0.8], [-0.17, -0.76], [-0.21, -0.5], [-0.165, -0.49], [-0.135, -0.68], [-0.12, -0.46], [-0.11, 0], [-0.03, 0], [0, -0.4]]
  const right = left.slice(0, -1).reverse().map(([a, b]): XY => [-a, b])
  const body = [...left, ...right].map(([a, b]): P2 => [round(x + a * height), round(y + b * height)])
  return `${head} ${pathOf(body, true)}`
}

/**
 * A worker's pose, facing right, in fractions of their height from the feet (y up is negative): leaning in, the
 * far arm resting on the car, the working arm reaching forward with the tool.
 */
const POSE = {
  backFoot: [-0.11, 0], frontFoot: [0.07, 0], hip: [-0.02, -0.47], shoulder: [0.08, -0.74], head: [0.14, -0.865],
  elbow: [0.2, -0.6], hand: [0.34, -0.58], restElbow: [0.17, -0.55], restHand: [0.3, -0.49],
} satisfies Record<string, XY>

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
  const line = (...points: XY[]) => pathOf(points.map(at), false)
  const { end, bar, sparks } = TOOLS[job]
  const tip = add(POSE.hand, end)
  // The bar runs across the handle's end, at right angles to it.
  const across = scaleXY(unit([-end[1], end[0]]), bar)
  return {
    kind: 'worker',
    job,
    facing,
    restArm: line(POSE.shoulder, POSE.restElbow, POSE.restHand),
    legs: `${line(POSE.backFoot, POSE.hip)} ${line(POSE.frontFoot, POSE.hip)}`,
    trunk: line(POSE.hip, POSE.shoulder),
    head: { at: at(POSE.head), r: round(height * 0.085) },
    upperArm: line(POSE.shoulder, POSE.elbow),
    forearm: line(POSE.elbow, POSE.hand),
    tool: line(POSE.hand, tip),
    toolEnd: bar ? line(add(tip, scaleXY(across, -1)), add(tip, across)) : '',
    sparks: sparks ? sparkRays(at(tip), height * 0.035, height * 0.11) : '',
    elbow: at(POSE.elbow),
    tip: at(tip),
    widths: { limb: round(height * 0.085), trunk: round(height * 0.17), tool: round(height * 0.028) },
  }
}

/** Sparks flying from a torch: six short rays around `centre`, from `inner` to `outer` slide pixels out. */
function sparkRays([x, y]: P2, inner: number, outer: number): string {
  return [-80, -35, 5, 45, 90, 135].map(degrees => {
    const [dx, dy] = [Math.cos((degrees * Math.PI) / 180), Math.sin((degrees * Math.PI) / 180)]
    return pathOf([[round(x + dx * inner), round(y + dy * inner)], [round(x + dx * outer), round(y + dy * outer)]], false)
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
