/**
 * Shared contract types for Mission Control.
 *
 * These describe the *normalized* shapes the BFF returns to the UI — decoupled
 * from any single backend's raw payload so screens depend on one stable
 * contract regardless of which service (or external system) sourced the data.
 */

/** Canonical operational status used across every domain and the global view. */
export type OperationalStatus =
  | "READY"
  | "READY_WITH_OBSERVATIONS"
  | "NOT_READY"
  | "NOT_AVAILABLE"
  | "NO_DATA";

/** One domain's health as shown on the Overview grid. */
export type DomainHealth = {
  /** Domain key, e.g. "Mirror", "Research", "Infrastructure". */
  domain: string;
  status: OperationalStatus;
};

/** The Overview payload returned by GET /api/overview. */
export type OverviewPayload = {
  /** Global roll-up status. */
  overall: OperationalStatus;
  /** 0..100 health score derived from domain statuses. */
  healthScore: number;
  /** Per-domain statuses. */
  domains: DomainHealth[];
  /** ISO timestamp of the source certification snapshot, if any. */
  generatedAt: string | null;
  /** Non-fatal notes (e.g. "no certification run yet", backend unreachable). */
  notes: string[];
};

/**
 * One capability as projected by data-core GET /capabilities. Mirrors the
 * backend's read-only projection of the existing CapabilityRegistry — Mission
 * Control never re-derives this catalog, it only displays it.
 */
export type Capability = {
  capabilityId: string;
  kind: string;
  name: string;
  description: string;
  owner: string;
  advisoryOnly: boolean;
  dependencies: string[];
  /** Bootstrap that registered it (SoT): "business-os" | "universal-platform". */
  sourcePlatform: string;
};

/** The Capability Registry payload returned by GET /api/capabilities. */
export type CapabilityRegistryPayload = {
  total: number;
  /** Count per CapabilityKind, straight from the registry. */
  kinds: Record<string, number>;
  /** True when every capability is advisory-only (enforced by the contract). */
  advisoryOnly: boolean;
  capabilities: Capability[];
  notes: string[];
};

/**
 * Health rollup the BFF derives for the universal-platform status capability.
 * - `ok`         — data-core reachable and the platform is initialized + advisory-only.
 * - `degraded`   — reachable but not initialized (bootstrap failed) or an
 *                  advisory/read-only invariant is not reported true.
 * - `unavailable`— data-core unreachable or the endpoint errored.
 */
export type PlatformHealth = "ok" | "degraded" | "unavailable";

/** One adapter as reported by Phase2Platform.status().adapters (normalized). */
export type PlatformAdapter = {
  project: string;
  domain: string;
  advisoryOnly: boolean;
  shadowMode: boolean;
  readOnly: boolean;
};

/**
 * Normalized contract for GET /api/platform-status. Mirrors data-core
 * Phase2Platform.status() (via GET /universal-platform/status) — read-only,
 * advisory-only. `fetchedAt` is added by the BFF (the backend carries no
 * timestamp); it is the BFF fetch time, not a domain field.
 */
export type PlatformStatusContract = {
  status: PlatformHealth;
  initialized: boolean;
  version: string | null;
  /** Capability ids reported by the platform (not the full registry catalog). */
  capabilities: string[];
  capabilityCount: number;
  adapters: PlatformAdapter[];
  advisoryOnly: boolean;
  shadowMode: boolean;
  readOnly: boolean;
  /** ISO timestamp of the BFF fetch. */
  fetchedAt: string;
  notes: string[];
  error: string | null;
};

/**
 * Kill Switch edge-deterioration severity, verbatim from poupi-crypto
 * `EDGE_STATUS_*` constants (app/analytics/kill_switch_intelligence.py).
 * "UNKNOWN" is added by the BFF when the field is absent — never invented by
 * the backend.
 */
export type KillSwitchEdgeStatus = "NORMAL" | "ATTENTION" | "WARNING" | "CRITICAL" | "UNKNOWN";

/**
 * Kill Switch recovery classification, verbatim (Portuguese, with accents)
 * from poupi-crypto `RECOVERY_*` constants. "UNKNOWN" is a BFF addition for
 * the absent/unreachable case.
 */
export type KillSwitchRecoveryClassification = "FAVORÁVEL" | "NEUTRA" | "DESFAVORÁVEL" | "UNKNOWN";

export type KillSwitchBffStatus = "ok" | "degraded" | "unavailable";

export type KillSwitchTopLoser = {
  tradeId: string;
  symbol: string;
  side: string;
  pnlUsdt: number | null;
  contributionPct: number | null;
  strategy: string;
  regime: string | null;
  closedAt: string | null;
};

export type KillSwitchEdgeDeterioration = {
  strategy: string;
  side: string;
  status: KillSwitchEdgeStatus;
  deltaWinRate: number | null;
  deltaProfitFactor: number | null;
  trades7d: number | null;
  winRate7d: number | null;
  profitFactor7d: number | null;
};

/**
 * Normalized contract for GET /api/kill-switch. Mirrors poupi-crypto
 * GET /api/v1/crypto/analytics/kill-switch/report (advisory-only,
 * read-only — see kill_switch_routes.py). The backend does not expose a
 * live triggered/not-triggered boolean on this endpoint: `ddDailyPct`,
 * `ddWeeklyPct`, `ddMonthlyPct` and `consecutiveLosses` are query-parameter
 * echoes (defaulted to 0 server-side when the caller supplies none), not
 * telemetry — `ddIsInputEcho` flags this so the UI never presents them as
 * live state. `triggerState` is therefore always "UNKNOWN" in this
 * capability; `worstEdgeStatus` is the closest real, DB-derived risk signal
 * available from this endpoint.
 */
export type KillSwitchContract = {
  status: KillSwitchBffStatus;
  accountId: string | null;
  generatedAt: string | null;
  triggerReason: string | null;
  ddDailyPct: number | null;
  ddWeeklyPct: number | null;
  ddMonthlyPct: number | null;
  consecutiveLosses: number | null;
  ddIsInputEcho: boolean;
  triggerState: "UNKNOWN";
  worstEdgeStatus: KillSwitchEdgeStatus;
  rootCause: {
    totalPnlUsdt: number | null;
    contributorsCount: number;
    topLoser: KillSwitchTopLoser | null;
  };
  edgeDeterioration: KillSwitchEdgeDeterioration[];
  recovery: {
    similarEventsFound: number;
    recoveryProbabilityPct: number | null;
    classification: KillSwitchRecoveryClassification;
    avgRecovery7d: number | null;
  };
  advisoryNote: string | null;
  /** ISO timestamp of the BFF fetch. */
  fetchedAt: string;
  notes: string[];
  error: string | null;
};

export type InfrastructureHealthStatus = "ok" | "degraded" | "unavailable";

export type InfrastructureDependency = {
  name: string;
  status: string;
  detail: string | null;
};

/** Normalized contract for GET /api/infrastructure-health. */
export type HealthContract = {
  status: InfrastructureHealthStatus;
  app: string | null;
  environment: string | null;
  healthStatus: string | null;
  ready: boolean | null;
  decision: string | null;
  operationalStatus: string | null;
  dependencies: InfrastructureDependency[];
  checks: InfrastructureDependency[];
  blockers: string[];
  fetchedAt: string;
  notes: string[];
  error: string | null;
};

export type DailyBriefStatus = "ok" | "empty" | "unavailable";

/** One section of the unified brief, verbatim from DailyBriefSection.as_dict(). */
export type DailyBriefSection = {
  title: string;
  headline: string;
  metrics: Record<string, unknown>;
  lines: string[];
};

/**
 * Normalized contract for GET /api/daily-brief. Mirrors data-core
 * GET /universal-platform/daily-brief (DailyBriefBuilder.build(), reused
 * verbatim). The runtime is stateless: with no event source wired yet, every
 * section reports "No activity observed." — `status` is "empty" (not an
 * error) in that case, distinct from "unavailable" (data-core unreachable).
 */
export type DailyBriefContract = {
  status: DailyBriefStatus;
  initialized: boolean;
  briefId: string | null;
  generatedAt: string | null;
  scientificHealth: number | null;
  sections: DailyBriefSection[];
  fetchedAt: string;
  notes: string[];
  error: string | null;
};

export type AlertsStatus = "ok" | "empty" | "unavailable";

/** One correlated alert, verbatim from UnifiedAlert.as_dict(). */
export type AlertItem = {
  alertId: string;
  title: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "WARNING" | "CRITICAL" | string;
  evidence: string[];
  rootCause: string;
  confidence: number;
  recommendedAction: string;
  replayRef: string;
  correlatedEventIds: string[];
  createdAt: string | null;
  ruleId: string | null;
};

/**
 * Normalized contract for GET /api/alerts. Mirrors data-core
 * GET /universal-platform/alerts (UnifiedAlertEngine.evaluate(), reused
 * verbatim). Same stateless caveat as the daily brief: "empty" means
 * zero correlated alerts for the (currently empty) event window, not an error.
 */
export type AlertsContract = {
  status: AlertsStatus;
  initialized: boolean;
  alerts: AlertItem[];
  count: number;
  fetchedAt: string;
  notes: string[];
  error: string | null;
};
