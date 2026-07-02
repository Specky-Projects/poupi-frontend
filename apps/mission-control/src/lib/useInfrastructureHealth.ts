"use client";

import { useCallback, useEffect, useState } from "react";

import type { HealthContract } from "@/lib/contracts";

export type InfrastructureHealthState = {
  data: HealthContract | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useInfrastructureHealth(pollMs = 30_000): InfrastructureHealthState {
  const [data, setData] = useState<HealthContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/infrastructure-health", { cache: "no-store" });
      const json = (await res.json()) as HealthContract;
      setData(json);
    } catch {
      setError("Falha ao carregar health/readiness");
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
