// Today's event: the Codex Community Build at TU Wien. The agenda, the rooms and the numbers on
// the slides come from here. They match the event's page on codex-events.com (read on 2026-11-27).

/** The day of the event. The live clock on "Agenda" and "Build time" only runs on this day. */
export const EVENT_DAY = '2026-11-28'

/** Where participants find the agenda and their credits. */
export const PLATFORM_URL = 'https://codex-events.com'
export const PLATFORM_LABEL = 'codex-events.com'

/** The Discord invite link. While it is empty, the Discord card on "House rules" has no QR code. */
export const DISCORD_URL = ''

export const BREAKOUT_ROOM_COUNT = 6
export const MENTOR_COUNT = 15

/** A part of the day on the agenda ribbon. Times are 24-hour clock times, for example "13:15". */
export interface AgendaBlock {
  start: string
  end: string
  title: string
  /** Sets the colour of the block. */
  kind: 'build' | 'break' | 'show' | 'social'
}

export const AGENDA: AgendaBlock[] = [
  { start: '10:40', end: '12:30', title: 'Build time', kind: 'build' },
  { start: '12:30', end: '13:15', title: 'Lunch', kind: 'break' },
  { start: '13:15', end: '17:00', title: 'Build time', kind: 'build' },
  { start: '17:00', end: '18:00', title: 'Demo walk & showcases', kind: 'show' },
  // Networking has no fixed end. The ribbon draws it one hour long and fades it out.
  { start: '18:00', end: '19:00', title: 'Networking', kind: 'social' },
]

/** An optional workshop that runs during build time. */
export interface Workshop {
  start: string
  end: string
  title: string
  room: string
}

export const WORKSHOPS: Workshop[] = [
  { start: '11:10', end: '11:40', title: 'Build your custom website with ChatGPT Sites', room: 'Main room' },
  { start: '14:00', end: '14:30', title: 'Automate your workflows with Codex Computer use and Browser use', room: 'Main room' },
]

/** Where the people of one challenge or track sit. */
export interface RoomRoute {
  name: string
  rooms: string[]
}

/** The challenges, in the order of their numbers on "Before you start". */
export const CHALLENGES: RoomRoute[] = [
  { name: 'Explorable 3D scene', rooms: ['U1-6'] },
  { name: 'One-minute game', rooms: ['U1-6'] },
  { name: 'A site someone can use', rooms: ['U1-1'] },
  { name: 'A working app or agent', rooms: ['U1-7'] },
]

export const OPEN_TRACKS: RoomRoute[] = [
  { name: 'Technical', rooms: ['U1-4', 'U1-5'] },
  { name: 'Non-technical', rooms: ['U1-2'] },
]

/** Turns a clock time such as "13:15" into minutes since midnight. */
export function minutesOf(clockTime: string): number {
  const [hours, minutes] = clockTime.split(':').map(Number)
  return hours * 60 + minutes
}

/** Minutes since midnight of `now`, or null when `now` is not on the day of the event. */
export function eventMinutes(now: Date): number | null {
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return day === EVENT_DAY ? now.getHours() * 60 + now.getMinutes() : null
}

/** Formats minutes as a short length of time, for example "45 min" or "1 h 20 min". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}
