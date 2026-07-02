"use client";

import { useCallback, useEffect, useState } from "react";

import type { PlatformStatusContract } from "@/lib/contracts";

export type PlatformStatusState = {
  data: PlatformStatusContract | null;
  loading: boolean;
  error: string | null;
  /** Round-trip latency of the last successful fetch, ms. */
  latencyMs: number | null;
};

/**
 * Observability hook for the universal-platform.status capability. Fetches the
 * BFF contract, tracks loading/error/latency, and polls every 30s. Consumers
 * pass the result to <PlatformStatusWidget/>; the hook never touches data-core
 * directly — only the BFF route.
 */
export function usePlatformStatus(pollMs = 30_000): PlatformStatusState {
  const [state, setState] = useState<PlatformStatusState>({
    data: null,
    loading: true,
    error: null,
    latencyMs: null,
  });

  const load = useCallback(async () => {
    const started = Date.now();
    try {
      const res = await fetch("/api/platform-status", { cache: "no-store" });
      const data = (await res.json()) as PlatformStatusContract;
      setState({ data, loading: false, error: null, latencyMs: Date.now() - started });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Falha ao carregar platform status",
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) void load();
    };
    run();
    const timer = setInterval(run, pollMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [load, pollMs]);

  return state;
}
