import { type DependencyList, useEffect, useState } from 'react';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

type LoadState<T> = {
  data: T | null;
  error: Error | null;
  status: LoadStatus;
};

type UseF1DataResult<T> = LoadState<T> & {
  refresh: () => void;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error('Unknown data loading error');
}

export default function useF1Data<T>(
  loadData: () => Promise<T>,
  deps: DependencyList = [],
): UseF1DataResult<T> {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<LoadState<T>>({
    data: null,
    error: null,
    status: 'idle',
  });

  useEffect(() => {
    let isActive = true;

    setState({
      data: null,
      error: null,
      status: 'loading',
    });

    loadData()
      .then((data) => {
        if (isActive) {
          setState({
            data,
            error: null,
            status: 'success',
          });
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setState({
            data: null,
            error: toError(error),
            status: 'error',
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [...deps, reloadToken]);

  return {
    ...state,
    refresh: () => setReloadToken((value) => value + 1),
  };
}
