import { useCallback, useEffect, useRef, useState } from "react";

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type UseFetchResult<T> = FetchState<T> & { retry: () => void };

const useFetch = <T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> => {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const run = useCallback(() => {
    const requestId = ++retryCountRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((data) => {
        if (!mountedRef.current || requestId !== retryCountRef.current) return;
        setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!mountedRef.current || requestId !== retryCountRef.current) return;
        const msg =
          err instanceof Error ? err.message : "Failed to load data. Please try again.";
        setState({ data: null, loading: false, error: msg });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  const retry = useCallback(() => {
    run();
  }, [run]);

  return { ...state, retry };
};

export default useFetch;
