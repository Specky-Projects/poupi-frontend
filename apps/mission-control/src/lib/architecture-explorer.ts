import type { OperationalStatus } from "@/lib/contracts";
import type { CapabilityEntry, DeliveryPhase, DeliveryStatus } from "@/lib/capability-catalog";

export const EMPTY_FIELD = "Unknown";
export const NOT_AUDITED = "Not Audited";

export const EXPLORER_DOMAINS = [
  "Architecture",
  "Mirror",
  "Research",
  "Business OS",
  "Poupi Baby",
  "Universal Platform",
  "Infrastructure",
  "Overview",
] as const;

export type CapabilityExplorerEntry = CapabilityEntry & {
  backend: string;
  certification: "Certified" | "Not Audited";
  consumers: string[];
  blockers: string[];
};

export type DomainHealthSummary = {
  domain: string;
  total: number;
  live: number;
  blocked: number;
  planned: number;
  certified: number;
  notAudited: number;
  phaseCounts: Record<DeliveryPhase, number>;
};

const PHASES: DeliveryPhase[] = [0, 1, 2, 3, 4, 5, 6, 7];

export function displayValue(value: string | null | undefined, fallback = EMPTY_FIELD) {
  return value && value.trim().length > 0 ? value : fallback;
}

export function statusToOperationalStatus(status: DeliveryStatus): OperationalStatus {
  if (status === "live") return "READY";
  if (status === "blocked") return "NOT_READY";
  if (status === "planned" || status === "audited") return "NO_DATA";
  return "READY_WITH_OBSERVATIONS";
}

export function deriveExplorerEntries(entries: CapabilityEntry[]): CapabilityExplorerEntry[] {
  return entries.map((entry) => {
    const consumers = entries
      .filter((candidate) => candidate.dependencies.some((dependency) => dependency === entry.id))
      .map((candidate) => candidate.id)
      .sort((a, b) => a.localeCompare(b));

    const blockers = [
      entry.production === "BLOCKED" ? "Production blocked" : null,
      entry.status === "blocked" ? "Delivery blocked" : null,
      entry.certifiedRealData ? null : "Real-data certification pending",
      entry.phase === 0 ? NOT_AUDITED : null,
    ].filter((blocker): blocker is string => Boolean(blocker));

    return {
      ...entry,
      backend: entry.project,
      certification: entry.certifiedRealData ? "Certified" : NOT_AUDITED,
      consumers,
      blockers,
    };
  });
}

export function deriveDomainHealth(entries: CapabilityEntry[]): DomainHealthSummary[] {
  const domains = Array.from(new Set([...EXPLORER_DOMAINS, ...entries.map((entry) => entry.domain)])).sort((a, b) =>
    a.localeCompare(b),
  );

  return domains.map((domain) => {
    const domainEntries = entries.filter((entry) => entry.domain === domain);
    const phaseCounts = Object.fromEntries(PHASES.map((phase) => [phase, 0])) as Record<DeliveryPhase, number>;
    for (const entry of domainEntries) phaseCounts[entry.phase] += 1;

    return {
      domain,
      total: domainEntries.length,
      live: domainEntries.filter((entry) => entry.status === "live").length,
      blocked: domainEntries.filter((entry) => entry.status === "blocked").length,
      planned: domainEntries.filter((entry) => entry.status === "planned").length,
      certified: domainEntries.filter((entry) => entry.certifiedRealData).length,
      notAudited: domainEntries.filter((entry) => entry.phase === 0 || !entry.certifiedRealData).length,
      phaseCounts,
    };
  });
}

export function phases() {
  return PHASES;
}
