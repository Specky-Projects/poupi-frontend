"use client";

import { useCallback, useEffect, useState } from "react";

import type { KillSwitchContract } from "@/lib/contracts";

export type KillSwitchState = {
  data: KillSwitchContract | null;
  loading: boolean;
  error: string | null;
  /** Round-trip latency of the last successful fetch, ms. */
  latencyMs: number | null;
};

/**
 * Observability hook for the kill-switch.state capability. Fetches the BFF
 * contract, tracks loading/error/latency, and polls every 30s. Consumers
 * pass the result to <KillSwitchWidget/>; the hook never touches poupi-crypto
 * directly — only the BFF route.
 */
export function useKillSwitch(pollMs = 30_000): KillSwitchState {
  const [state, setState] = useState<KillSwitchState>({
    data: null,
    loading: true,
    error: null,
    latencyMs: null,
  });

  const load = useCallback(async () => {
    const started = Date.now();
    try {
      const res = await fetch("/api/kill-switch", { cache: "no-store" });
      const data = (await res.json()) as KillSwitchContract;
      setState({ data, loading: false, error: null, latencyMs: Date.now() - started });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Falha ao carregar kill switch",
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
