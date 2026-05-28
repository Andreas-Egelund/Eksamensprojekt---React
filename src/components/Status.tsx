import { RefreshCw } from 'lucide-react';

type LoadingStateProps = {
  label?: string;
};

type ErrorStateProps = {
  error?: Error | null;
  onRetry?: () => void;
};

type EmptyStateProps = {
  title: string;
  message?: string;
};

export function LoadingState({ label = 'Loading Formula 1 data' }: LoadingStateProps) {
  return (
    <div className="state-panel" role="status">
      <span className="loader" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel state-panel-error" role="alert">
      <div>
        <strong>Could not load F1 data</strong>
        <p>{error?.message ?? 'The data service did not respond.'}</p>
      </div>
      {onRetry ? (
        <button className="icon-text-button" type="button" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="state-panel">
      <strong>{title}</strong>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
