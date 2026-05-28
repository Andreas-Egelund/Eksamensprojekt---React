import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { API_BASE } from './api/f1Api';
import {
  australianResult,
  constructorStandings,
  driverStandings,
  races,
} from './test/fixtures';
import { server } from './test/server';

function renderApp(path = '/') {
  window.history.pushState({}, 'Test page', path);
  return render(<App />);
}

function driverName(entry: { Driver?: { givenName?: string; familyName?: string } }) {
  return [entry.Driver?.givenName, entry.Driver?.familyName].filter(Boolean).join(' ');
}

function raceDateTime(race: { date: string; time?: string }) {
  return new Date(`${race.date}T${race.time ?? '12:00:00Z'}`);
}

const firstDriverName = driverName(driverStandings[0]);
const alternateDriverName = driverName(driverStandings[driverStandings.length - 1]);
const firstDriverPoints = driverStandings[0].points;
const firstConstructorName = constructorStandings[0].Constructor.name;
const completedRace = races[0];
const upcomingRace = races[1];
const raceWithResults = australianResult;
const resultDriverNames = raceWithResults.Results.slice(0, 2).map(driverName);
const timeBetweenFixtureRaces = new Date(
  (raceDateTime(completedRace).getTime() + raceDateTime(upcomingRace).getTime()) / 2,
);

describe('F1 Season Guide app', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(timeBetweenFixtureRaces);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a simple season overview from the F1 API', async () => {
    renderApp('/');

    expect(await screen.findByRole('heading', { name: /season overview/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /top drivers/i })).toBeInTheDocument();
    expect((await screen.findAllByText(firstDriverName)).length).toBeGreaterThan(0);
    expect(screen.getByText(firstDriverPoints)).toBeInTheDocument();
    expect(screen.getAllByText(upcomingRace.raceName).length).toBeGreaterThan(0);
  });

  it('lets the user switch from driver standings to constructor standings', async () => {
    const user = userEvent.setup();
    renderApp('/standings');

    expect(await screen.findByText(firstDriverName)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /constructors/i }));

    expect(await screen.findByRole('heading', { name: /constructor standings/i })).toBeInTheDocument();
    expect(screen.getByText(firstConstructorName)).toBeInTheDocument();
    expect(screen.queryByText(alternateDriverName)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /drivers/i }));

    expect(await screen.findByRole('heading', { name: /driver standings/i })).toBeInTheDocument();
    expect(screen.getByText(alternateDriverName)).toBeInTheDocument();
  });

  it('opens a race detail page from the calendar', async () => {
    const user = userEvent.setup();
    renderApp('/races');

    const raceLink = await screen.findByRole('link', {
      name: raceWithResults.raceName,
    });

    await user.click(raceLink);

    expect(await screen.findByRole('heading', { name: raceWithResults.raceName })).toBeInTheDocument();
    expect(screen.getAllByText(resultDriverNames[0]).length).toBeGreaterThan(0);
    expect(screen.getAllByText(resultDriverNames[1]).length).toBeGreaterThan(0);
  });

  it('shows a retryable error state when standings cannot be loaded', async () => {
    server.use(
      http.get(`${API_BASE}/:season/driverstandings.json`, () =>
        HttpResponse.json({ message: 'Service unavailable' }, { status: 503 }),
      ),
    );

    renderApp('/standings');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load F1 data');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

});
