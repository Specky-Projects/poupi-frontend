"use client";

import { useCallback, useEffect, useState } from "react";

import type { AlertsContract } from "@/lib/contracts";

export type AlertsState = {
  data: AlertsContract | null;
  loading: boolean;
  error: string | null;
  /** Round-trip latency of the last successful fetch, ms. */
  latencyMs: number | null;
};

/**
 * Observability hook for the universal-platform.alerts capability. Fetches
 * the BFF contract, tracks loading/error/latency, and polls every 30s — the
 * same cadence as other operational widgets. Consumers pass the result to
 * <AlertsWidget/>; the hook never touches data-core directly — only the BFF
 * route.
 */
export function useAlerts(pollMs = 30_000): AlertsState {
  const [state, setState] = useState<AlertsState>({
    data: null,
    loading: true,
    error: null,
    latencyMs: null,
  });

  const load = useCallback(async () => {
    const started = Date.now();
    try {
      const res = await fetch("/api/alerts", { cache: "no-store" });
      const data = (await res.json()) as AlertsContract;
      setState({ data, loading: false, error: null, latencyMs: Date.now() - started });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Falha ao carregar alerts",
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
