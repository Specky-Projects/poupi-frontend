import type { HealthContract, InfrastructureDependency } from "@/lib/contracts";

export type InfrastructureHealthRaw = {
  status?: string;
  app?: string;
  environment?: string;
  dependencies?: Record<string, { status?: string; detail?: string | null } | string>;
};

export type InfrastructureReadyRaw = {
  ready?: boolean;
  checks?: Record<string, string>;
  app?: string;
  operational_status?: string | null;
  decision?: string | null;
  blockers?: string[];
};

function normalizeDependencies(
  raw: Record<string, { status?: string; detail?: string | null } | string> | undefined,
): InfrastructureDependency[] {
  return Object.entries(raw ?? {}).map(([name, value]) => {
    if (typeof value === "string") {
      return { name, status: value, detail: null };
    }
    return {
      name,
      status: value.status ?? "unknown",
      detail: value.detail ?? null,
    };
  });
}

function dependencyHasProblem(item: InfrastructureDependency): boolean {
  const status = item.status.toLowerCase();
  return status !== "ok" && status !== "ready" && status !== "pass";
}

export function normalizeInfrastructureHealth(
  health: InfrastructureHealthRaw,
  ready: InfrastructureReadyRaw | null,
  fetchedAt: string,
): HealthContract {
  const dependencies = normalizeDependencies(health.dependencies);
  const checks = normalizeDependencies(ready?.checks);
  const readyValue = ready?.ready ?? null;
  const healthStatus = health.status ?? null;
  const decision = ready?.decision ?? null;
  const blockers = ready?.blockers ?? [];

  let status: HealthContract["status"] = "ok";
  const notes: string[] = [];

  if (healthStatus !== "ok") {
    status = "degraded";
    notes.push(`health=${healthStatus ?? "unknown"}`);
  }
  if (readyValue !== true || decision === "DEGRADED" || decision === "BLOCKED" || decision === "NO-GO") {
    status = "degraded";
    notes.push(`ready=${String(readyValue)} decision=${decision ?? "unknown"}`);
  }
  if (dependencies.some(dependencyHasProblem) || checks.some(dependencyHasProblem) || blockers.length > 0) {
    status = "degraded";
  }

  return {
    status,
    app: ready?.app ?? health.app ?? null,
    environment: health.environment ?? null,
    healthStatus,
    ready: readyValue,
    decision,
    operationalStatus: ready?.operational_status ?? null,
    dependencies,
    checks,
    blockers,
    fetchedAt,
    notes,
    error: null,
  };
}

export function unavailableInfrastructureHealth(detail: string, fetchedAt: string): HealthContract {
  return {
    status: "unavailable",
    app: null,
    environment: null,
    healthStatus: null,
    ready: null,
    decision: null,
    operationalStatus: null,
    dependencies: [],
    checks: [],
    blockers: [],
    fetchedAt,
    notes: [detail],
    error: detail,
  };
}
