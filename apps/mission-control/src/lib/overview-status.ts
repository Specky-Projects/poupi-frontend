import type { DomainHealth, OperationalStatus, OverviewPayload } from "@/lib/contracts";

export type ExecutiveStatusRaw = Record<string, string | undefined>;

const DOMAIN_KEYS = [
  "Mirror",
  "Research",
  "Observer",
  "Infrastructure",
  "Executor",
  "CapitalPool",
  "Telegram",
  "Scheduler",
  "Database",
] as const;

const STATUS_WEIGHT: Record<OperationalStatus, number | null> = {
  READY: 100,
  READY_WITH_OBSERVATIONS: 70,
  NOT_READY: 0,
  NOT_AVAILABLE: null,
  NO_DATA: null,
};

export function normalizeOperationalStatus(value: string | undefined): OperationalStatus {
  switch (value) {
    case "READY":
    case "READY_WITH_OBSERVATIONS":
    case "NOT_READY":
    case "NOT_AVAILABLE":
      return value;
    case "PASS":
      return "READY";
    case "WARNING":
      return "READY_WITH_OBSERVATIONS";
    case "FAIL":
      return "NOT_READY";
    default:
      return "NOT_AVAILABLE";
  }
}

export function computeHealthScore(domains: DomainHealth[]): number {
  const scored = domains
    .map((d) => STATUS_WEIGHT[d.status])
    .filter((w): w is number => w !== null);
  if (scored.length === 0) return 0;
  const avg = scored.reduce((a, b) => a + b, 0) / scored.length;
  return Math.round(avg);
}

export function normalizeExecutiveStatus(raw: ExecutiveStatusRaw): OverviewPayload {
  if (raw.status === "NO_DATA") {
    return {
      overall: "NO_DATA",
      healthScore: 0,
      domains: [],
      generatedAt: null,
      notes: [raw.message ?? "Nenhuma certificacao de producao executada ainda."],
    };
  }

  const domains: DomainHealth[] = DOMAIN_KEYS.map((domain) => ({
    domain,
    status: normalizeOperationalStatus(raw[domain]),
  }));

  return {
    overall: normalizeOperationalStatus(raw.Overall),
    healthScore: computeHealthScore(domains),
    domains,
    generatedAt: raw.generated_at ?? null,
    notes: [],
  };
}

export function unavailableOverview(detail: string): OverviewPayload {
  return {
    overall: "NOT_AVAILABLE",
    healthScore: 0,
    domains: [],
    generatedAt: null,
    notes: [detail],
  };
}
