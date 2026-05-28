import { Link, useParams } from 'react-router-dom';
import { getRaceResults, type RaceResultsResponse } from '../api/f1Api';
import { EmptyState, ErrorState, LoadingState } from '../components/Status';
import useF1Data from '../hooks/useF1Data';
import { formatRaceDate, formatRaceTime } from '../utils/stats';

export default function RaceDetails() {
  const { round = '1', season = 'current' } = useParams<{
    round: string;
    season: string;
  }>();
  const { data, error, refresh, status } = useF1Data(
    () => getRaceResults(season, round),
    [season, round],
  );

  return (
    <section className="page-shell">
      <Link className="back-link" to="/races">
        Back to races
      </Link>

      {status === 'loading' ? <LoadingState label="Loading race result" /> : null}
      {status === 'error' ? <ErrorState error={error} onRetry={refresh} /> : null}
      {data?.race ? <RaceResult data={data} /> : null}
      {status === 'success' && !data?.race ? (
        <EmptyState
          title="Results not published yet"
          message="This race is listed in the calendar, but the result endpoint is empty."
        />
      ) : null}
    </section>
  );
}

type RaceResultProps = {
  data: RaceResultsResponse;
};

function RaceResult({ data }: RaceResultProps) {
  if (!data.race) {
    return null;
  }

  return (
    <>
      <section className="detail-hero">
        <p className="eyebrow">
          {data.race.season} - Round {data.race.round}
        </p>
        <h1>{data.race.raceName}</h1>
        <dl className="summary-list detail-list">
          <div>
            <dt>Circuit</dt>
            <dd>{data.race.circuit}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>
              {formatRaceDate(data.race)} at {formatRaceTime(data.race)}
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>
              {data.race.locality}, {data.race.country}
            </dd>
          </div>
        </dl>
      </section>

      <section className="content-panel table-panel">
        <h2>Classified Result</h2>
        {data.results.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th>Grid</th>
                  <th>Laps</th>
                  <th>Time</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((result) => (
                  <tr key={`${result.position}-${result.driverId}`}>
                    <td>{result.position}</td>
                    <td>
                      <strong>{result.driverName}</strong>
                      <small>{result.driverCode}</small>
                    </td>
                    <td>{result.constructorName}</td>
                    <td>{result.grid}</td>
                    <td>{result.laps}</td>
                    <td>{result.time}</td>
                    <td>{result.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No result rows available" />
        )}
      </section>
    </>
  );
}
