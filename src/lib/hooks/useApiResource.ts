"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, apiGet } from "@/lib/api/http";
import type { Dispatch, SetStateAction } from "react";

interface UseApiResourceOptions<T> {
  initialData: T;
  refreshMs?: number;
  enabled?: boolean;
}

interface UseApiResourceResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: Dispatch<SetStateAction<T>>;
}

export function useApiResource<T>(
  path: string | null,
  options: UseApiResourceOptions<T>,
): UseApiResourceResult<T> {
  const { initialData, refreshMs = 0, enabled = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(Boolean(path && enabled));
  const [error, setError] = useState<string | null>(null);
  const initialDataRef = useRef<T>(initialData);

  const refresh = useCallback(async () => {
    if (!path || !enabled) {
      return;
    }

    try {
      const payload = await apiGet<T>(path);
      setData(payload);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`API error (${err.status})`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown API error");
      }
    } finally {
      setLoading(false);
    }
  }, [enabled, path]);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    // Reset local data when the resource path changes, using latest fallback snapshot.
    setData(initialDataRef.current);
    setError(null);
  }, [path]);

  useEffect(() => {
    setLoading(Boolean(path && enabled));
    void refresh();
  }, [refresh, path, enabled]);

  useEffect(() => {
    if (!refreshMs || !path || !enabled) {
      return;
    }

    const interval = window.setInterval(() => {
      void refresh();
    }, refreshMs);

    return () => window.clearInterval(interval);
  }, [enabled, path, refresh, refreshMs]);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}
