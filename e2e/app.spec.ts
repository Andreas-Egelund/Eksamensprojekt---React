import { expect, test } from '@playwright/test';
import {
  australianResult,
  constructorStandings,
  driverStandings,
} from '../src/test/fixtures';
import { e2eRaces, mockF1Api } from './mockF1Api';

function driverName(entry: { Driver?: { givenName?: string; familyName?: string } }) {
  return [entry.Driver?.givenName, entry.Driver?.familyName].filter(Boolean).join(' ');
}

const firstDriverName = driverName(driverStandings[0]);
const alternateDriverName = driverName(driverStandings[driverStandings.length - 1]);
const firstDriverTeam = driverStandings[0].Constructors[0].name;
const firstDriverPoints = driverStandings[0].points;
const firstConstructorName = constructorStandings[0].Constructor.name;
const secondConstructorName = constructorStandings[1].Constructor.name;
const raceWithResults = australianResult;
const unpublishedRace = e2eRaces[1];
const resultDriverNames = raceWithResults.Results.slice(0, 2).map(driverName);

test.describe('F1 SeasonViewer', () => {
  test.beforeEach(async ({ page }) => {
    await mockF1Api(page);
  });

  test('loads the dashboard with season summary and top drivers', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Season Overview' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Current season' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top Drivers' })).toBeVisible();

    const topDrivers = page.locator('section.table-panel').filter({ hasText: 'Top Drivers' });
    await expect(topDrivers.getByRole('cell', { name: firstDriverName })).toBeVisible();
    await expect(topDrivers.getByRole('cell', { name: firstDriverTeam })).toBeVisible();
    await expect(topDrivers.getByRole('cell', { name: firstDriverPoints })).toBeVisible();
    const topDriversOverflow = await topDrivers.locator('.table-wrap').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(topDriversOverflow.scrollWidth).toBeLessThanOrEqual(
      topDriversOverflow.clientWidth,
    );

    await expect(page.getByText(unpublishedRace.raceName)).toBeVisible();
    await expect(page.getByText(unpublishedRace.Circuit.circuitName)).toBeVisible();
  });

  test('changes seasons and toggles standings tables', async ({ page }) => {
    await page.goto('/standings');

    await expect(
      page.getByRole('heading', { name: 'Driver Standings' }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: firstDriverName })).toBeVisible();
    await expect(page.getByRole('cell', { name: alternateDriverName })).toBeVisible();

    await page.getByRole('button', { name: 'Constructors' }).click();

    await expect(
      page.getByRole('heading', { name: 'Constructor Standings' }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: firstConstructorName })).toBeVisible();
    await expect(page.getByText(alternateDriverName)).toBeHidden();

    const seasonSelect = page.getByRole('combobox', { name: 'Season' });
    const explicitSeason = await seasonSelect.locator('option').nth(1).getAttribute('value');

    expect(explicitSeason).not.toBeNull();
    await seasonSelect.selectOption(explicitSeason as string);

    await expect(page.getByText(`${explicitSeason} season`)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Constructor Standings' }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: secondConstructorName })).toBeVisible();
  });

  test('opens race details from the calendar and handles unpublished results', async ({
    page,
  }) => {
    await page.goto('/races');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Race Calendar' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: raceWithResults.raceName })).toBeVisible();
    await expect(page.getByRole('link', { name: unpublishedRace.raceName })).toBeVisible();

    await page.getByRole('link', { name: raceWithResults.raceName }).click();

    await expect(
      page.getByRole('heading', { level: 1, name: raceWithResults.raceName }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Classified Result' })).toBeVisible();
    await expect(page.getByRole('cell', { name: resultDriverNames[0] })).toBeVisible();
    await expect(page.getByRole('cell', { name: resultDriverNames[1] })).toBeVisible();

    await page.getByRole('link', { name: 'Back to races' }).click();
    await page.getByRole('link', { name: unpublishedRace.raceName }).click();

    await expect(page.getByText('Results not published yet')).toBeVisible();
  });

  test('recovers standings after a retryable API error', async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await mockF1Api(page, { failDriverStandingsOnce: true });

    await page.goto('/standings');

    await expect(page.getByRole('alert')).toContainText('Could not load F1 data');
    await expect(page.getByRole('alert')).toContainText(
      'Jolpica request failed with 503',
    );

    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(
      page.getByRole('heading', { name: 'Driver Standings' }),
    ).toBeVisible();
    await expect(page.getByRole('cell', { name: firstDriverName })).toBeVisible();
  });
});
