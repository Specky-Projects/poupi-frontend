"use client";

import { useCallback, useEffect, useState } from "react";

import type { CapabilityRegistryPayload } from "@/lib/contracts";

export type CapabilitiesState = {
  data: CapabilityRegistryPayload | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

/**
 * Reusable hook for the capability registry. Screens receive a typed BFF
 * contract and never call data-core or duplicate registry rules.
 */
export function useCapabilities(): CapabilitiesState {
  const [data, setData] = useState<CapabilityRegistryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/capabilities", { cache: "no-store" });
      const json = (await res.json()) as CapabilityRegistryPayload;
      setData(json);
    } catch {
      setError("Falha ao carregar capabilities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, error, loading, refresh };
}
