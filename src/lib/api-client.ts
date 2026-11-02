"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiError } from "./types";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** fetch wrapper: JSON in/out, throws ApiRequestError on non-2xx */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let code = "UNKNOWN";
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as ApiError;
      code = body.error.code;
      message = body.error.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiRequestError(res.status, code, message);
  }
  return (await res.json()) as T;
}

/**
 * Load data from our API with loading / error states.
 *   const { data, loading, error, reload } = useApi<DashboardData>("/api/dashboard");
 * Pass `null` to skip loading (data stays null).
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (path === null) return;
    setLoading(true);
    setError(null);
    try {
      setData(await apiFetch<T>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}
