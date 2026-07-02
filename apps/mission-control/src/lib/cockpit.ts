/**
 * Operator Cockpit — pure client-side derivations over data already fetched
 * by existing hooks (`useOverview`) or already present as a static module
 * (`CAPABILITY_CATALOG`). No new BFF route, no new backend call, no stored
 * state. See docs/PHASE_10_OPERATOR_EXPERIENCE_ARCHITECTURE.md Etapa 4.
 */

import { CAPABILITY_CATALOG, type CapabilityEntry, type DeliveryStatus } from "@/lib/capability-catalog";
import type { DomainHealth, OperationalStatus, OverviewPayload } from "@/lib/contracts";

/** Capabilities that reached production-certification territory (Fase >= 6). */
export function certifiedCapabilities(catalog: CapabilityEntry[] = CAPABILITY_CATALOG): CapabilityEntry[] {
  return catalog.filter((c) => c.phase >= 6);
}

/** Capabilities that are not yet usable: blocked on infra/event source, or Fase 0 planned. */
export function pendingCapabilities(catalog: CapabilityEntry[] = CAPABILITY_CATALOG): CapabilityEntry[] {
  return catalog.filter((c) => c.status === "blocked" || c.status === "planned");
}

/**
 * Domains with a real NOT_READY signal from the latest overview snapshot.
 * Returns `null` when there is no real snapshot to read (overview missing or
 * no domains reported) — the caller must render that as "unknown", never as
 * "no incidents".
 */
export function incidentDomains(overview: OverviewPayload | null): DomainHealth[] | null {
  if (!overview || overview.domains.length === 0) return null;
  return overview.domains.filter((d) => d.status === "NOT_READY");
}

/** Reuses StatusChip's existing color bands for a DeliveryStatus value. */
export const DELIVERY_STATUS_CHIP: Record<DeliveryStatus, { status: OperationalStatus; label: string }> = {
  live: { status: "READY", label: "LIVE" },
  in_progress: { status: "READY_WITH_OBSERVATIONS", label: "IN PROGRESS" },
  blocked: { status: "READY_WITH_OBSERVATIONS", label: "BLOCKED" },
  audited: { status: "NOT_AVAILABLE", label: "AUDITED" },
  planned: { status: "NOT_AVAILABLE", label: "PLANNED" },
};
