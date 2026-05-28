import type { Race } from '../api/f1Api';

export type RaceStatus = 'Completed' | 'Upcoming';

export function raceDateTime(race: Pick<Race, 'date' | 'time'>): Date {
  const time = race.time ?? '12:00:00Z';
  return new Date(`${race.date}T${time}`);
}

export function getRaceStatus(race: Race, now = new Date()): RaceStatus {
  return raceDateTime(race) < now ? 'Completed' : 'Upcoming';
}

export function formatRaceDate(race: Race): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(raceDateTime(race));
}

export function formatRaceTime(race: Race): string {
  if (!race.time) {
    return 'Time TBA';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(raceDateTime(race));
}

export function seasonLabel(season: string): string {
  return season === 'current' ? 'Current season' : `${season} season`;
}
