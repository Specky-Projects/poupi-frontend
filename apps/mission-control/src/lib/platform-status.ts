import type { PlatformAdapter, PlatformStatusContract } from "@/lib/contracts";

/**
 * Pure normalization for the universal-platform.status capability. Kept separate
 * from the route handler so it can be unit-tested without importing next/server.
 * No business logic — only field renaming and the health rollup defined by the
 * contract.
 */

/**
 * Raw shape of data-core GET /universal-platform/status (Phase2Platform.status()
 * wrapped by bootstrap.platform_status). When the platform failed to boot the
 * payload is `{ initialized: false, error, advisory_only: true }`.
 */
export type PlatformStatusRaw = {
  initialized?: boolean;
  version?: string;
  capabilities?: string[];
  adapters?: Record<
    string,
    {
      project?: string;
      domain?: string;
      advisory_only?: boolean;
      shadow_mode?: boolean;
      read_only?: boolean;
    }
  >;
  advisory_only?: boolean;
  shadow_mode?: boolean;
  read_only?: boolean;
  error?: string;
};

function normalizeAdapters(raw: PlatformStatusRaw["adapters"]): PlatformAdapter[] {
  return Object.entries(raw ?? {}).map(([key, a]) => ({
    project: a.project ?? key,
    domain: a.domain ?? "",
    advisoryOnly: Boolean(a.advisory_only),
    shadowMode: Boolean(a.shadow_mode),
    readOnly: Boolean(a.read_only),
  }));
}

/** Normalize a reachable payload into the contract. */
export function normalizePlatformStatus(
  raw: PlatformStatusRaw,
  fetchedAt: string,
): PlatformStatusContract {
  const initialized = Boolean(raw.initialized);
  const advisoryOnly = Boolean(raw.advisory_only);
  const readOnly = Boolean(raw.read_only);
  const capabilities = raw.capabilities ?? [];
  const notes: string[] = [];

  let status: PlatformStatusContract["status"] = "ok";
  if (!initialized) {
    status = "degraded";
    notes.push(raw.error ? `platform não inicializou: ${raw.error}` : "platform não inicializou");
  } else if (!advisoryOnly || !readOnly) {
    status = "degraded";
    notes.push("invariante advisory-only/read-only não reportada");
  }

  return {
    status,
    initialized,
    version: raw.version ?? null,
    capabilities,
    capabilityCount: capabilities.length,
    adapters: normalizeAdapters(raw.adapters),
    advisoryOnly,
    shadowMode: Boolean(raw.shadow_mode),
    readOnly,
    fetchedAt,
    notes,
    error: raw.error ?? null,
  };
}

/** Contract for the unreachable/errored case. */
export function unavailablePlatformStatus(
  detail: string,
  fetchedAt: string,
): PlatformStatusContract {
  return {
    status: "unavailable",
    initialized: false,
    version: null,
    capabilities: [],
    capabilityCount: 0,
    adapters: [],
    advisoryOnly: false,
    shadowMode: false,
    readOnly: false,
    fetchedAt,
    notes: [detail],
    error: detail,
  };
}
