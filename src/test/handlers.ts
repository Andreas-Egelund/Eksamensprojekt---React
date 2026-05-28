import { http, HttpResponse } from 'msw';
import { API_BASE } from '../api/f1Api';
import {
  australianResult,
  constructorStandings,
  driverStandings,
  races,
} from './fixtures';

type JolpicaTestPayload = Record<string, unknown>;

function asParam(value: unknown): string {
  return Array.isArray(value) ? String(value[0]) : String(value);
}

function responseWith(payload: JolpicaTestPayload) {
  return HttpResponse.json({
    MRData: {
      limit: '100',
      offset: '0',
      series: 'f1',
      total: '1',
      ...payload,
    },
  });
}

export const handlers = [
  http.get(`${API_BASE}/:season/races.json`, ({ params }) =>
    responseWith({
      RaceTable: {
        season: asParam(params.season),
        Races: races,
      },
      total: String(races.length),
    }),
  ),

  http.get(`${API_BASE}/:season/driverstandings.json`, ({ params }) =>
    responseWith({
      StandingsTable: {
        season: asParam(params.season),
        StandingsLists: [
          {
            season: asParam(params.season),
            round: '2',
            DriverStandings: driverStandings,
          },
        ],
      },
      total: String(driverStandings.length),
    }),
  ),

  http.get(`${API_BASE}/:season/constructorstandings.json`, ({ params }) =>
    responseWith({
      StandingsTable: {
        season: asParam(params.season),
        StandingsLists: [
          {
            season: asParam(params.season),
            round: '2',
            ConstructorStandings: constructorStandings,
          },
        ],
      },
      total: String(constructorStandings.length),
    }),
  ),

  http.get(`${API_BASE}/:season/:round/results.json`, ({ params }) => {
    const round = asParam(params.round);

    return responseWith({
      RaceTable: {
        season: asParam(params.season),
        round,
        Races: round === '1' ? [australianResult] : [],
      },
      total: round === '1' ? '1' : '0',
    });
  }),
];
