import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataAdapter, DataLoadState, DataRequest } from './types';

/**
 * Loads a page and discards results from superseded requests, even if the
 * adapter ignores AbortSignal. Memoize adapter and request to avoid refetching
 * on unrelated renders. Refresh retains the last successful page; on error it
 * remains available as stale data. Call retry to issue the same request again.
 */
export function useDataAdapter<T>(adapter: DataAdapter<T>, request: DataRequest) {
  const [state, setState] = useState<DataLoadState<T>>({ status: 'loading', data: null, error: null });
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const current = ++generation.current;
    setState((previous) => previous.data
      ? { status: 'refreshing', data: previous.data, error: null }
      : { status: 'loading', data: null, error: null });
    // The extra promise boundary also handles adapters that throw synchronously.
    Promise.resolve().then(() => {
      controller.signal.throwIfAborted();
      return adapter.load(request, controller.signal);
    }).then(
      (data) => {
        if (!controller.signal.aborted && generation.current === current) {
          setState({ status: 'success', data, error: null });
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted && generation.current === current) {
          setState((previous) => ({ status: 'error', data: previous.data, error }));
        }
      },
    );
    return () => controller.abort();
  }, [adapter, request, revision]);

  return { ...state, retry };
}
