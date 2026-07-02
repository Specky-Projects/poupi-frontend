import type {
  KillSwitchContract,
  KillSwitchEdgeDeterioration,
  KillSwitchEdgeStatus,
  KillSwitchRecoveryClassification,
  KillSwitchTopLoser,
} from "@/lib/contracts";

/**
 * Pure normalization for the kill-switch.state capability. Kept separate from
 * the route handler so it can be unit-tested without importing next/server.
 * No business logic — only field renaming, the "UNKNOWN" fallback for
 * missing enums, and the BFF-reachability rollup. Mirrors poupi-crypto
 * GET /api/v1/crypto/analytics/kill-switch/report (report_to_dict output of
 * app/analytics/kill_switch_intelligence.py::build_kill_switch_intelligence_report).
 */

export type KillSwitchTradeContributorRaw = {
  trade_id?: string;
  symbol?: string;
  side?: string;
  pnl_usdt?: number | null;
  contribution_pct?: number | null;
  strategy?: string;
  regime?: string | null;
  closed_at?: string | null;
};

export type KillSwitchEdgePeriodStatsRaw = {
  n?: number;
  win_rate?: number | null;
  profit_factor?: number | null;
  expectancy?: number | null;
};

export type KillSwitchEdgeDeteriorationRaw = {
  strategy?: string;
  side?: string;
  period_7d?: KillSwitchEdgePeriodStatsRaw;
  period_30d?: KillSwitchEdgePeriodStatsRaw;
  delta_wr?: number | null;
  delta_pf?: number | null;
  delta_exp?: number | null;
  status?: string;
  edge_score_delta?: number | null;
};

export type KillSwitchReportRaw = {
  advisory_only?: boolean;
  report?: {
    account_id?: string;
    generated_at?: string;
    trigger_reason?: string;
    dd_daily_pct?: number | null;
    dd_weekly_pct?: number | null;
    dd_monthly_pct?: number | null;
    consecutive_losses?: number | null;
    root_cause?: {
      total_pnl_usdt?: number | null;
      contributors?: KillSwitchTradeContributorRaw[];
      top_loser?: KillSwitchTradeContributorRaw | null;
    };
    edge_deterioration?: KillSwitchEdgeDeteriorationRaw[];
    recovery?: {
      similar_events_found?: number;
      avg_recovery_7d?: number | null;
      recovery_probability_pct?: number | null;
      classification?: string;
    };
    worst_edge_status?: string;
    advisory_note?: string;
  };
};

const EDGE_STATUSES: readonly string[] = ["NORMAL", "ATTENTION", "WARNING", "CRITICAL"];
const RECOVERY_CLASSIFICATIONS: readonly string[] = ["FAVORÁVEL", "NEUTRA", "DESFAVORÁVEL"];

function normalizeEdgeStatus(value: string | undefined): KillSwitchEdgeStatus {
  return value && EDGE_STATUSES.includes(value) ? (value as KillSwitchEdgeStatus) : "UNKNOWN";
}

function normalizeRecoveryClassification(value: string | undefined): KillSwitchRecoveryClassification {
  return value && RECOVERY_CLASSIFICATIONS.includes(value)
    ? (value as KillSwitchRecoveryClassification)
    : "UNKNOWN";
}

function normalizeTopLoser(raw: KillSwitchTradeContributorRaw | null | undefined): KillSwitchTopLoser | null {
  if (!raw) return null;
  return {
    tradeId: raw.trade_id ?? "",
    symbol: raw.symbol ?? "",
    side: raw.side ?? "",
    pnlUsdt: raw.pnl_usdt ?? null,
    contributionPct: raw.contribution_pct ?? null,
    strategy: raw.strategy ?? "",
    regime: raw.regime ?? null,
    closedAt: raw.closed_at ?? null,
  };
}

function normalizeEdgeDeterioration(raw: KillSwitchEdgeDeteriorationRaw[] | undefined): KillSwitchEdgeDeterioration[] {
  return (raw ?? []).map((entry) => ({
    strategy: entry.strategy ?? "",
    side: entry.side ?? "",
    status: normalizeEdgeStatus(entry.status),
    deltaWinRate: entry.delta_wr ?? null,
    deltaProfitFactor: entry.delta_pf ?? null,
    trades7d: entry.period_7d?.n ?? null,
    winRate7d: entry.period_7d?.win_rate ?? null,
    profitFactor7d: entry.period_7d?.profit_factor ?? null,
  }));
}

/** Normalize a reachable payload into the contract. */
export function normalizeKillSwitchReport(raw: KillSwitchReportRaw, fetchedAt: string): KillSwitchContract {
  const report = raw.report;
  const advisoryOnly = Boolean(raw.advisory_only);
  const notes: string[] = [];

  let status: KillSwitchContract["status"] = "ok";
  if (!report) {
    status = "degraded";
    notes.push("payload sem campo 'report'");
  } else if (!advisoryOnly) {
    status = "degraded";
    notes.push("invariante advisory-only não reportada");
  }

  notes.push(
    "dd_daily_pct/dd_weekly_pct/dd_monthly_pct/consecutive_losses são ecoados do request (default 0), não telemetria ao vivo",
  );

  return {
    status,
    accountId: report?.account_id ?? null,
    generatedAt: report?.generated_at ?? null,
    triggerReason: report?.trigger_reason ?? null,
    ddDailyPct: report?.dd_daily_pct ?? null,
    ddWeeklyPct: report?.dd_weekly_pct ?? null,
    ddMonthlyPct: report?.dd_monthly_pct ?? null,
    consecutiveLosses: report?.consecutive_losses ?? null,
    ddIsInputEcho: true,
    triggerState: "UNKNOWN",
    worstEdgeStatus: normalizeEdgeStatus(report?.worst_edge_status),
    rootCause: {
      totalPnlUsdt: report?.root_cause?.total_pnl_usdt ?? null,
      contributorsCount: report?.root_cause?.contributors?.length ?? 0,
      topLoser: normalizeTopLoser(report?.root_cause?.top_loser),
    },
    edgeDeterioration: normalizeEdgeDeterioration(report?.edge_deterioration),
    recovery: {
      similarEventsFound: report?.recovery?.similar_events_found ?? 0,
      recoveryProbabilityPct: report?.recovery?.recovery_probability_pct ?? null,
      classification: normalizeRecoveryClassification(report?.recovery?.classification),
      avgRecovery7d: report?.recovery?.avg_recovery_7d ?? null,
    },
    advisoryNote: report?.advisory_note ?? null,
    fetchedAt,
    notes,
    error: null,
  };
}

/** Contract for the unreachable/errored case. */
export function unavailableKillSwitch(detail: string, fetchedAt: string): KillSwitchContract {
  return {
    status: "unavailable",
    accountId: null,
    generatedAt: null,
    triggerReason: null,
    ddDailyPct: null,
    ddWeeklyPct: null,
    ddMonthlyPct: null,
    consecutiveLosses: null,
    ddIsInputEcho: true,
    triggerState: "UNKNOWN",
    worstEdgeStatus: "UNKNOWN",
    rootCause: { totalPnlUsdt: null, contributorsCount: 0, topLoser: null },
    edgeDeterioration: [],
    recovery: {
      similarEventsFound: 0,
      recoveryProbabilityPct: null,
      classification: "UNKNOWN",
      avgRecovery7d: null,
    },
    advisoryNote: null,
    fetchedAt,
    notes: [detail],
    error: detail,
  };
}
