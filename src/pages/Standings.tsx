import { useState } from 'react';
import {
  type ConstructorStanding,
  type DriverStanding,
  getConstructorStandings,
  getDriverStandings,
} from '../api/f1Api';
import SeasonPicker from '../components/SeasonPicker';
import { EmptyState, ErrorState, LoadingState } from '../components/Status';
import useF1Data from '../hooks/useF1Data';
import { seasonLabel } from '../utils/stats';

type StandingsMode = 'drivers' | 'constructors';
type DriverStandingsData = {
  mode: 'drivers';
  rows: DriverStanding[];
};
type ConstructorStandingsData = {
  mode: 'constructors';
  rows: ConstructorStanding[];
};
type StandingsData = DriverStandingsData | ConstructorStandingsData;

export default function Standings() {
  const [season, setSeason] = useState('current');
  const [mode, setMode] = useState<StandingsMode>('drivers');
  const { data, error, refresh, status } = useF1Data<StandingsData>(
    async () => {
      if (mode === 'drivers') {
        return {
          mode,
          rows: await getDriverStandings(season),
        };
      }

      return {
        mode,
        rows: await getConstructorStandings(season),
      };
    },
    [season, mode],
  );
  const currentData = data?.mode === mode ? data : null;

  return (
    <section className="page-shell">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">{seasonLabel(season)}</p>
          <h1>Standings</h1>
        </div>
        <SeasonPicker value={season} onChange={setSeason} />
      </div>

      <div className="control-row">
        <div className="segmented-control" aria-label="Standings type">
          <button
            aria-pressed={mode === 'drivers'}
            className={mode === 'drivers' ? 'segment segment-active' : 'segment'}
            onClick={() => setMode('drivers')}
            type="button"
          >
            Drivers
          </button>
          <button
            aria-pressed={mode === 'constructors'}
            className={mode === 'constructors' ? 'segment segment-active' : 'segment'}
            onClick={() => setMode('constructors')}
            type="button"
          >
            Constructors
          </button>
        </div>
      </div>

      {status === 'loading' ? <LoadingState label="Loading standings" /> : null}
      {status === 'error' ? <ErrorState error={error} onRetry={refresh} /> : null}
      {status !== 'error' && currentData?.rows.length === 0 ? (
        <EmptyState title="No standings found" message="Try another season." />
      ) : null}
      {currentData?.rows.length ? (
        <section className="content-panel table-panel" aria-live="polite">
          <h2>{mode === 'drivers' ? 'Driver Standings' : 'Constructor Standings'}</h2>
          {currentData.mode === 'drivers' ? (
            <DriverTable rows={currentData.rows} />
          ) : (
            <ConstructorTable rows={currentData.rows} />
          )}
        </section>
      ) : null}
    </section>
  );
}

type DriverTableProps = {
  rows: DriverStanding[];
};

function DriverTable({ rows }: DriverTableProps) {
  return (
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
          {rows.map((driver) => (
            <tr key={driver.driverId}>
              <td>{driver.positionText}</td>
              <td>
                <strong>{driver.name}</strong>
                <small>{driver.nationality}</small>
              </td>
              <td>{driver.constructorNames.join(', ')}</td>
              <td>{driver.wins}</td>
              <td>{driver.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ConstructorTableProps = {
  rows: ConstructorStanding[];
};

function ConstructorTable({ rows }: ConstructorTableProps) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Constructor</th>
            <th>Nationality</th>
            <th>Wins</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((constructor) => (
            <tr key={`${constructor.position}-${constructor.constructorId}`}>
              <td>{constructor.positionText}</td>
              <td>
                <strong>{constructor.name}</strong>
              </td>
              <td>{constructor.nationality}</td>
              <td>{constructor.wins}</td>
              <td>{constructor.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
