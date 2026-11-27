// The Codex Community events in Vienna in 2026, oldest first, for "A year in review".
// Titles, dates, places and sign-ups come from each event's own page (Meetup and Luma), read on
// 2026-11-27. "Sign-ups" are the people who registered, not people counted at the door. The
// hackathon and today's event use the numbers of Alex's Luma overview of the same day.

export interface YearEvent {
  /** The folder under ./photos that holds this event's pictures and clips. */
  photos: string
  /** The day of the event, as YYYY-MM-DD. */
  date: string
  title: string
  /** The kind of event, in a few words. */
  kind: string
  /** Where it took place, and with whom. */
  place: string
  /** How many people signed up for the event. */
  signUps: number
  /** True for the event that is happening today. */
  isToday?: boolean
}

export const YEAR_EVENTS: YearEvent[] = [
  {
    photos: '01-openclaw',
    date: '2026-03-10',
    title: '🦞 OpenClaw & Codex - Lightning Talks Night',
    kind: 'Lightning talks',
    place: 'Magenta HQ · with Vienna AI Engineering',
    signUps: 253,
  },
  {
    photos: '02-hackathon',
    date: '2026-04-18',
    title: 'Codex Community Hackathon: Vienna',
    kind: 'Hackathon',
    place: 'Together with Sentry',
    // Everyone who applied on Luma: 84 going, 182 waiting for approval and 23 on the waitlist.
    signUps: 289,
  },
  {
    photos: '03-meetup',
    date: '2026-04-27',
    title: 'Codex Community Meetup: Vienna',
    kind: 'Meetup',
    place: 'Greentube',
    signUps: 154,
  },
  {
    photos: '04-build-june',
    date: '2026-06-20',
    title: 'Codex Community Build Meetup: Vienna',
    kind: 'Build day',
    place: 'WU Vienna',
    signUps: 108,
  },
  {
    photos: '05-build-week',
    date: '2026-07-16',
    title: 'OpenAI Build Week Community Meetup - Vienna',
    kind: 'Meetup',
    place: 'Vienna',
    signUps: 158,
  },
  {
    photos: '06-astra-commons',
    date: '2026-09-19',
    title: 'Astra Commons: Vienna',
    kind: 'Coffee meetup',
    place: 'Lia Coffee · WU campus',
    signUps: 161,
  },
  {
    photos: '07-today',
    date: '2026-11-28',
    title: 'Codex Community Build: Vienna',
    kind: 'Build day',
    place: 'TU Wien · with EULiST',
    // Going on Luma on 2026-11-27, for 400 places.
    signUps: 393,
    isToday: true,
  },
]

/** All sign-ups of the year, today included. */
export const SIGN_UP_TOTAL = YEAR_EVENTS.reduce((total, event) => total + event.signUps, 0)
