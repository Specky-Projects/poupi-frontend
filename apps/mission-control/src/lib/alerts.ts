import type { AlertItem, AlertsContract } from "@/lib/contracts";

/**
 * Pure normalization for the universal-platform.alerts capability. Kept
 * separate from the route handler so it can be unit-tested without importing
 * next/server. No business logic — only field renaming; correlation and
 * severity are produced entirely by UnifiedAlertEngine.evaluate() on the
 * backend.
 */

/** Raw shape of one alert, verbatim from UnifiedAlert.as_dict(). */
export type AlertItemRaw = {
  alert_id?: string;
  title?: string;
  severity?: string;
  evidence?: string[];
  root_cause?: string;
  confidence?: number;
  recommended_action?: string;
  replay_ref?: string;
  correlated_event_ids?: string[];
  created_at?: string;
  rule_id?: string | null;
};

/**
 * Raw shape of data-core GET /universal-platform/alerts (router-wrapped
 * UnifiedAlertEngine.evaluate() output). When the platform failed to boot the
 * payload is `{ initialized: false, advisory_only: true, alerts: [], count: 0 }`.
 */
export type AlertsRaw = {
  initialized?: boolean;
  advisory_only?: boolean;
  alerts?: AlertItemRaw[];
  count?: number;
  error?: string;
};

function normalizeAlert(raw: AlertItemRaw): AlertItem {
  return {
    alertId: raw.alert_id ?? "",
    title: raw.title ?? "",
    severity: (raw.severity ?? "INFO") as AlertItem["severity"],
    evidence: raw.evidence ?? [],
    rootCause: raw.root_cause ?? "",
    confidence: typeof raw.confidence === "number" ? raw.confidence : 0,
    recommendedAction: raw.recommended_action ?? "",
    replayRef: raw.replay_ref ?? "",
    correlatedEventIds: raw.correlated_event_ids ?? [],
    createdAt: raw.created_at ?? null,
    ruleId: raw.rule_id ?? null,
  };
}

/** Normalize a reachable payload into the contract. */
export function normalizeAlerts(raw: AlertsRaw, fetchedAt: string): AlertsContract {
  const initialized = Boolean(raw.initialized);
  const alerts = (raw.alerts ?? []).map(normalizeAlert);
  const count = typeof raw.count === "number" ? raw.count : alerts.length;
  const notes: string[] = [];

  if (!initialized) {
    notes.push(raw.error ? `alerts não inicializou: ${raw.error}` : "alerts não inicializou");
  } else if (count === 0) {
    notes.push("runtime sem event source — avaliação bem-formada, nenhum alerta correlacionado");
  }

  return {
    status: !initialized ? "unavailable" : count > 0 ? "ok" : "empty",
    initialized,
    alerts,
    count,
    fetchedAt,
    notes,
    error: raw.error ?? null,
  };
}

/** Contract for the unreachable/errored case (data-core itself unreachable). */
export function unavailableAlerts(detail: string, fetchedAt: string): AlertsContract {
  return {
    status: "unavailable",
    initialized: false,
    alerts: [],
    count: 0,
    fetchedAt,
    notes: [detail],
    error: detail,
  };
}
