/**
 * useFetch.js
 *
 * Generic data-fetching hook used throughout the app.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useFetch(
 *     () => getProjectById(id),
 *     [id]               // re-run when id changes
 *   );
 *
 * Returns:
 *   data        any       – the response payload (res.data.data)
 *   isLoading   boolean
 *   error       string | null
 *   refetch     fn        – manually re-trigger the fetch
 */

import { useState, useEffect, useCallback, useRef } from "react";

export function useFetch(fetcher, deps = []) {
  const [data, setData]         = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState(null);

  // Keep a stable ref to the fetcher so the effect doesn't re-run when the
  // inline arrow function reference changes each render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Abort controller ref so we can cancel in-flight requests on unmount
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    // Cancel any previous in-flight fetch
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetcherRef.current();
      // All our API responses nest data under res.data.data
      setData(res?.data?.data ?? res?.data ?? res);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [run]);

  return { data, isLoading, error, refetch: run };
}
