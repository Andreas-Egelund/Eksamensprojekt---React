export const API_BASE = 'https://api.jolpi.ca/ergast/f1';

export type Season = string;

export type Race = {
  season: string;
  round: number;
  raceName: string;
  date: string;
  time?: string;
  url?: string;
  circuit: string;
  circuitId?: string;
  locality: string;
  country: string;
  coordinates: {
    lat?: string;
    long?: string;
  };
};

export type DriverStanding = {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  driverId: string;
  code?: string;
  name: string;
  nationality?: string;
  constructorNames: string[];
};

export type ConstructorStanding = {
  position: number;
  positionText: string;
  points: number;
  wins: number;
  constructorId: string;
  name: string;
  nationality?: string;
};

export type RaceResult = {
  position: number;
  number?: string;
  grid?: string;
  laps?: string;
  status?: string;
  points: number;
  time?: string;
  driverId: string;
  driverCode?: string;
  driverName: string;
  constructorName: string;
};

export type DashboardData = {
  constructors: ConstructorStanding[];
  drivers: DriverStanding[];
  races: Race[];
};

export type RaceResultsResponse = {
  race: Race | null;
  results: RaceResult[];
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

type JolpicaDriver = {
  driverId?: string;
  code?: string;
  givenName?: string;
  familyName?: string;
  nationality?: string;
};

type JolpicaConstructor = {
  constructorId?: string;
  name?: string;
  nationality?: string;
};

type JolpicaCircuit = {
  circuitId?: string;
  circuitName?: string;
  Location?: {
    lat?: string;
    long?: string;
    locality?: string;
    country?: string;
  };
};

type JolpicaRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  url?: string;
  Circuit?: JolpicaCircuit;
  Results?: JolpicaResult[];
};

type JolpicaDriverStanding = {
  position: string;
  positionText: string;
  points: string;
  wins?: string;
  Driver?: JolpicaDriver;
  Constructors?: JolpicaConstructor[];
};

type JolpicaConstructorStanding = {
  position: string;
  positionText: string;
  points: string;
  wins?: string;
  Constructor?: JolpicaConstructor;
};

type JolpicaResult = {
  number?: string;
  position: string;
  points: string;
  grid?: string;
  laps?: string;
  status?: string;
  Time?: {
    time?: string;
  };
  Driver?: JolpicaDriver;
  Constructor?: JolpicaConstructor;
};

type JolpicaResponse = {
  MRData?: {
    RaceTable?: {
      Races?: JolpicaRace[];
    };
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: JolpicaDriverStanding[];
        ConstructorStandings?: JolpicaConstructorStanding[];
      }>;
    };
  };
};

const responseCache = new Map<string, Promise<JolpicaResponse>>();

function buildUrl(path: string, params: QueryParams = {}): string {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function requestJson(path: string, params?: QueryParams): Promise<JolpicaResponse> {
  const url = buildUrl(path, params);

  if (responseCache.has(url)) {
    return responseCache.get(url) as Promise<JolpicaResponse>;
  }

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Jolpica request failed with ${response.status}`);
      }

      return response.json() as Promise<JolpicaResponse>;
    })
    .catch((error: unknown) => {
      responseCache.delete(url);
      throw error;
    });

  responseCache.set(url, request);
  return request;
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

function driverName(driver?: JolpicaDriver): string {
  const name = [driver?.givenName, driver?.familyName].filter(Boolean).join(' ');
  return name || 'Unknown driver';
}

function normalizeRace(race: JolpicaRace): Race {
  return {
    season: race.season,
    round: Number(race.round),
    raceName: race.raceName,
    date: race.date,
    time: race.time,
    url: race.url,
    circuit: race.Circuit?.circuitName ?? 'Unknown circuit',
    circuitId: race.Circuit?.circuitId,
    locality: race.Circuit?.Location?.locality ?? '',
    country: race.Circuit?.Location?.country ?? '',
    coordinates: {
      lat: race.Circuit?.Location?.lat,
      long: race.Circuit?.Location?.long,
    },
  };
}

function normalizeDriverStanding(entry: JolpicaDriverStanding): DriverStanding {
  const constructors = entry.Constructors ?? [];

  return {
    position: Number(entry.position),
    positionText: entry.positionText,
    points: toNumber(entry.points),
    wins: Number(entry.wins ?? 0),
    driverId: entry.Driver?.driverId ?? entry.Driver?.code ?? 'unknown-driver',
    code: entry.Driver?.code,
    name: driverName(entry.Driver),
    nationality: entry.Driver?.nationality,
    constructorNames: constructors.map((constructor) => constructor.name ?? 'Unknown constructor'),
  };
}

function normalizeConstructorStanding(
  entry: JolpicaConstructorStanding,
): ConstructorStanding {
  return {
    position: Number(entry.position),
    positionText: entry.positionText,
    points: toNumber(entry.points),
    wins: Number(entry.wins ?? 0),
    constructorId: entry.Constructor?.constructorId ?? 'unknown-constructor',
    name: entry.Constructor?.name ?? 'Unknown constructor',
    nationality: entry.Constructor?.nationality,
  };
}

function normalizeResult(entry: JolpicaResult): RaceResult {
  return {
    position: Number(entry.position),
    number: entry.number,
    grid: entry.grid,
    laps: entry.laps,
    status: entry.status,
    points: toNumber(entry.points),
    time: entry.Time?.time ?? entry.status,
    driverId: entry.Driver?.driverId ?? entry.Driver?.code ?? 'unknown-driver',
    driverCode: entry.Driver?.code,
    driverName: driverName(entry.Driver),
    constructorName: entry.Constructor?.name ?? 'Unknown constructor',
  };
}

export function getSeasonOptions(): Season[] {
  const currentYear = new Date().getFullYear();
  const seasons: Season[] = ['current'];

  for (let season = currentYear; season >= currentYear - 6; season -= 1) {
    seasons.push(String(season));
  }

  return seasons;
}

export async function getRaceSchedule(season: Season = 'current'): Promise<Race[]> {
  const json = await requestJson(`/${season}/races.json`, { limit: 100 });
  const races = json.MRData?.RaceTable?.Races ?? [];

  return races.map(normalizeRace);
}

export async function getDriverStandings(
  season: Season = 'current',
): Promise<DriverStanding[]> {
  const json = await requestJson(`/${season}/driverstandings.json`, { limit: 100 });
  const standings =
    json.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  return standings.map(normalizeDriverStanding);
}

export async function getConstructorStandings(
  season: Season = 'current',
): Promise<ConstructorStanding[]> {
  const json = await requestJson(`/${season}/constructorstandings.json`, {
    limit: 100,
  });
  const standings =
    json.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return standings.map(normalizeConstructorStanding);
}

export async function getRaceResults(
  season: Season,
  round: string | number,
): Promise<RaceResultsResponse> {
  const json = await requestJson(`/${season}/${round}/results.json`, {
    limit: 100,
  });
  const race = json.MRData?.RaceTable?.Races?.[0];

  if (!race) {
    return {
      race: null,
      results: [],
    };
  }

  return {
    race: normalizeRace(race),
    results: (race.Results ?? []).map(normalizeResult),
  };
}

export async function getDashboardData(season: Season = 'current'): Promise<DashboardData> {
  const [races, drivers, constructors] = await Promise.all([
    getRaceSchedule(season),
    getDriverStandings(season),
    getConstructorStandings(season),
  ]);

  return {
    constructors,
    drivers,
    races,
  };
}

export function clearF1Cache(): void {
  responseCache.clear();
}
