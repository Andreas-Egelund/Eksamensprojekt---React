import { type Page, type Route } from '@playwright/test';
import { API_BASE } from '../src/api/f1Api';
import {
  australianResult,
  constructorStandings,
  driverStandings,
  races,
} from '../src/test/fixtures';

type MockF1ApiOptions = {
  failDriverStandingsOnce?: boolean;
};

type JolpicaTestPayload = Record<string, unknown>;

function stableRelativeDate(yearOffset: number, month: number, day: number) {
  const year = new Date().getFullYear() + yearOffset;
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay}`;
}

export const e2eRaces = [
  {
    ...races[0],
    date: stableRelativeDate(-1, 3, 8),
  },
  {
    ...races[1],
    date: stableRelativeDate(1, 5, 24),
  },
];

function responseWith(payload: JolpicaTestPayload) {
  return {
    MRData: {
      limit: '100',
      offset: '0',
      series: 'f1',
      total: '1',
      ...payload,
    },
  };
}

function routeParts(route: Route) {
  const url = new URL(route.request().url());
  const path = url.pathname.replace('/ergast/f1/', '');

  return path.split('/');
}

export async function mockF1Api(page: Page, options: MockF1ApiOptions = {}) {
  let hasFailedDriverStandings = false;

  await page.route(`${API_BASE}/**`, async (route) => {
    const parts = routeParts(route);
    const [season, roundOrEndpoint, maybeEndpoint] = parts;
    const endpoint = maybeEndpoint ?? roundOrEndpoint;

    if (endpoint === 'races.json') {
      await route.fulfill({
        contentType: 'application/json',
        json: responseWith({
          RaceTable: {
            season,
            Races: e2eRaces,
          },
          total: String(e2eRaces.length),
        }),
      });
      return;
    }

    if (endpoint === 'driverstandings.json') {
      if (options.failDriverStandingsOnce && !hasFailedDriverStandings) {
        hasFailedDriverStandings = true;
        await route.fulfill({
          contentType: 'application/json',
          json: { message: 'Service unavailable' },
          status: 503,
        });
        return;
      }

      await route.fulfill({
        contentType: 'application/json',
        json: responseWith({
          StandingsTable: {
            season,
            StandingsLists: [
              {
                season,
                round: '2',
                DriverStandings: driverStandings,
              },
            ],
          },
          total: String(driverStandings.length),
        }),
      });
      return;
    }

    if (endpoint === 'constructorstandings.json') {
      await route.fulfill({
        contentType: 'application/json',
        json: responseWith({
          StandingsTable: {
            season,
            StandingsLists: [
              {
                season,
                round: '2',
                ConstructorStandings: constructorStandings,
              },
            ],
          },
          total: String(constructorStandings.length),
        }),
      });
      return;
    }

    if (endpoint === 'results.json') {
      const round = roundOrEndpoint;
      await route.fulfill({
        contentType: 'application/json',
        json: responseWith({
          RaceTable: {
            season,
            round,
            Races: round === '1' ? [australianResult] : [],
          },
          total: round === '1' ? '1' : '0',
        }),
      });
      return;
    }

    await route.abort('failed');
  });
}
