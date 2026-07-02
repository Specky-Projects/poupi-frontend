"use client";

import { useCallback, useEffect, useState } from "react";

import type { DailyBriefContract } from "@/lib/contracts";

export type DailyBriefState = {
  data: DailyBriefContract | null;
  loading: boolean;
  error: string | null;
  /** Round-trip latency of the last successful fetch, ms. */
  latencyMs: number | null;
};

/**
 * Observability hook for the universal-platform.daily-brief capability.
 * Fetches the BFF contract, tracks loading/error/latency, and polls every
 * 60s (a fresh brief is only meaningful on a daily-ish cadence). Consumers
 * pass the result to <DailyBriefWidget/>; the hook never touches data-core
 * directly — only the BFF route.
 */
export function useDailyBrief(pollMs = 60_000): DailyBriefState {
  const [state, setState] = useState<DailyBriefState>({
    data: null,
    loading: true,
    error: null,
    latencyMs: null,
  });

  const load = useCallback(async () => {
    const started = Date.now();
    try {
      const res = await fetch("/api/daily-brief", { cache: "no-store" });
      const data = (await res.json()) as DailyBriefContract;
      setState({ data, loading: false, error: null, latencyMs: Date.now() - started });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Falha ao carregar daily brief",
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
