import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getRaceSchedule } from '../api/f1Api';
import SeasonPicker from '../components/SeasonPicker';
import { EmptyState, ErrorState, LoadingState } from '../components/Status';
import useF1Data from '../hooks/useF1Data';
import {
  formatRaceDate,
  formatRaceTime,
  getRaceStatus,
  seasonLabel,
} from '../utils/stats';

export default function Races() {
  const [season, setSeason] = useState('current');
  const { data, error, refresh, status } = useF1Data(
    () => getRaceSchedule(season),
    [season],
  );

  return (
    <section className="page-shell">
      <div className="page-toolbar">
        <div>
          <p className="eyebrow">{seasonLabel(season)}</p>
          <h1>Race Calendar</h1>
        </div>
        <SeasonPicker value={season} onChange={setSeason} />
      </div>

      {status === 'loading' ? <LoadingState label="Loading race calendar" /> : null}
      {status === 'error' ? <ErrorState error={error} onRetry={refresh} /> : null}
      {status !== 'error' && data?.length === 0 ? (
        <EmptyState title="No races found" message="Try another season." />
      ) : null}

      {data?.length ? (
        <section className="content-panel table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Race</th>
                  <th>Circuit</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((race) => (
                  <tr key={race.round}>
                    <td>{race.round}</td>
                    <td>
                      <Link to={`/races/${race.season}/${race.round}`}>
                        {race.raceName}
                      </Link>
                    </td>
                    <td>
                      {race.circuit}, {race.country}
                    </td>
                    <td>
                      <time dateTime={`${race.date}T${race.time ?? '12:00:00Z'}`}>
                        {formatRaceDate(race)} at {formatRaceTime(race)}
                      </time>
                    </td>
                    <td>{getRaceStatus(race)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
