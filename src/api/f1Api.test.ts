import { describe, expect, it } from 'vitest';
import {
  getConstructorStandings,
  getDriverStandings,
  getRaceResults,
  getRaceSchedule,
} from './f1Api';
import {
  australianResult,
  constructorStandings,
  driverStandings,
  races as fixtureRaces,
} from '../test/fixtures';

function driverName(entry: { Driver?: { givenName?: string; familyName?: string } }) {
  return [entry.Driver?.givenName, entry.Driver?.familyName].filter(Boolean).join(' ');
}

describe('f1Api', () => {
  it('normalizes driver standings into app-friendly rows', async () => {
    const standings = await getDriverStandings('current');
    const firstDriver = driverStandings[0];

    expect(standings[0]).toMatchObject({
      constructorNames: firstDriver.Constructors.map((team) => team.name),
      name: driverName(firstDriver),
      points: Number(firstDriver.points),
      position: Number(firstDriver.position),
    });
  });

  it('normalizes constructor standings', async () => {
    const standings = await getConstructorStandings('current');
    const firstConstructor = constructorStandings[0];

    expect(standings[0]).toMatchObject({
      name: firstConstructor.Constructor.name,
      points: Number(firstConstructor.points),
      wins: Number(firstConstructor.wins),
    });
  });

  it('returns schedule and result data for race detail pages', async () => {
    const schedule = await getRaceSchedule('current');
    const raceWithResults = australianResult;
    const result = await getRaceResults(raceWithResults.season, raceWithResults.round);

    expect(schedule).toHaveLength(fixtureRaces.length);
    expect(result.race?.raceName).toBe(raceWithResults.raceName);
    expect(result.results[0].driverName).toBe(driverName(raceWithResults.Results[0]));
  });
});
