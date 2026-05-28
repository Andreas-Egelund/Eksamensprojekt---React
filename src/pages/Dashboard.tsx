import { useState } from 'react';
import { getDashboardData, type DashboardData, type Race } from '../api/f1Api';
import SeasonPicker from '../components/SeasonPicker';
import { EmptyState, ErrorState, LoadingState } from '../components/Status';
import useF1Data from '../hooks/useF1Data';
import {
  formatRaceDate,
  formatRaceTime,
  getRaceStatus,
  seasonLabel,
} from '../utils/stats';

export default function Dashboard() {
  const [season, setSeason] = useState('current');
  const { data, error, refresh, status } = useF1Data(
    () => getDashboardData(season),
    [season],
  );

  return (
    <section className="page-shell">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">{seasonLabel(season)}</p>
          <h1>Season Overview</h1>
        </div>
        <SeasonPicker value={season} onChange={setSeason} />
      </div>

      {status === 'loading' ? <LoadingState /> : null}
      {status === 'error' ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data ? <DashboardContent data={data} season={season} /> : null}
    </section>
  );
}

type DashboardContentProps = {
  data: DashboardData;
  season: string;
};

function DashboardContent({ data, season }: DashboardContentProps) {
  const completedRaces = data.races.filter(
    (race) => getRaceStatus(race) === 'Completed',
  );
  const nextRace = getNextRace(data.races);
  const topDrivers = data.drivers.slice(0, 5);

  if (!data.races.length && !data.drivers.length) {
    return (
      <EmptyState
        title="No season data yet"
        message="Try selecting a completed season from the picker."
      />
    );
  }

  return (
    <div className="overview-layout">
      <section className="content-panel summary-panel">
        <h2>{seasonLabel(season)}</h2>
        <dl className="summary-list">
          <div>
            <dt>Completed races</dt>
            <dd>
              {completedRaces.length} of {data.races.length}
            </dd>
          </div>
          <div>
            <dt>Next race</dt>
            <dd>{nextRace?.raceName ?? 'Season complete'}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>
              {nextRace
                ? `${formatRaceDate(nextRace)} at ${formatRaceTime(nextRace)}`
                : 'No upcoming race'}
            </dd>
          </div>
          <div>
            <dt>Circuit</dt>
            <dd>{nextRace?.circuit ?? 'Final standings available'}</dd>
          </div>
        </dl>
      </section>

      <section className="content-panel table-panel top-drivers-panel">
        <h2>Top Drivers</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Wins</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers.map((driver) => (
                <tr key={driver.driverId}>
                  <td>{driver.positionText}</td>
                  <td>{driver.name}</td>
                  <td>{driver.constructorNames.join(', ')}</td>
                  <td>{driver.wins}</td>
                  <td>{driver.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function getNextRace(races: Race[]): Race | null {
  return races.find((race) => getRaceStatus(race) === 'Upcoming') ?? null;
}
