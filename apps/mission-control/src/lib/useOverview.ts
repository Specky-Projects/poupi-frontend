"use client";

import { useCallback, useEffect, useState } from "react";

import type { OverviewPayload } from "@/lib/contracts";

export type OverviewState = {
  data: OverviewPayload | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Reusable data hook for the overview capability. It only fetches the local BFF
 * contract and exposes UI state; domain logic stays in the backend/BFF layers.
 */
export function useOverview(pollMs = 30_000): OverviewState {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/overview", { cache: "no-store" });
      const json = (await res.json()) as OverviewPayload;
      setData(json);
    } catch {
      setError("Falha ao carregar overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) await refresh();
    };

    void load();
    const timer = window.setInterval(load, pollMs);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [pollMs, refresh]);

  return { data, error, loading, refresh };
}
