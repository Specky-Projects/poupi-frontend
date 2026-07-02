import { describe, expect, it } from "vitest";

import { normalizeKillSwitchReport, type KillSwitchReportRaw, unavailableKillSwitch } from "@/lib/kill-switch";

const AT = "2026-07-02T00:00:00.000Z";

const FULL_RAW: KillSwitchReportRaw = {
  advisory_only: true,
  report: {
    account_id: "specky",
    generated_at: "2026-07-01T23:00:00.000Z",
    trigger_reason: "manual_query",
    dd_daily_pct: 0,
    dd_weekly_pct: 0,
    dd_monthly_pct: 19.68,
    consecutive_losses: 0,
    root_cause: {
      total_pnl_usdt: -120.5,
      contributors: [
        { trade_id: "t1", symbol: "BTCUSDT", side: "long", pnl_usdt: -80, contribution_pct: 66.4, strategy: "mean_reversion", regime: "range", closed_at: "2026-07-01T20:00:00.000Z" },
        { trade_id: "t2", symbol: "ETHUSDT", side: "short", pnl_usdt: -40.5, contribution_pct: 33.6, strategy: "breakout", regime: "trend", closed_at: "2026-07-01T21:00:00.000Z" },
      ],
      top_loser: { trade_id: "t1", symbol: "BTCUSDT", side: "long", pnl_usdt: -80, contribution_pct: 66.4, strategy: "mean_reversion", regime: "range", closed_at: "2026-07-01T20:00:00.000Z" },
    },
    edge_deterioration: [
      {
        strategy: "mean_reversion",
        side: "long",
        period_7d: { n: 12, win_rate: 33.3, profit_factor: 0.6, expectancy: -2.1 },
        period_30d: { n: 40, win_rate: 48.0, profit_factor: 1.1, expectancy: 0.4 },
        delta_wr: -14.7,
        delta_pf: -0.5,
        delta_exp: -2.5,
        status: "CRITICAL",
        edge_score_delta: -18.2,
      },
    ],
    recovery: {
      similar_events_found: 5,
      avg_recovery_7d: 45.2,
      recovery_probability_pct: 80,
      classification: "FAVORÁVEL",
    },
    worst_edge_status: "CRITICAL",
    advisory_note: "ADVISORY ONLY — Nenhuma ação operacional executada.",
  },
};

describe("normalizeKillSwitchReport", () => {
  it("maps a complete payload to ok with all sections populated", () => {
    const c = normalizeKillSwitchReport(FULL_RAW, AT);
    expect(c.status).toBe("ok");
    expect(c.accountId).toBe("specky");
    expect(c.generatedAt).toBe("2026-07-01T23:00:00.000Z");
    expect(c.ddMonthlyPct).toBe(19.68);
    expect(c.ddIsInputEcho).toBe(true);
    expect(c.triggerState).toBe("UNKNOWN");
    expect(c.worstEdgeStatus).toBe("CRITICAL");
    expect(c.rootCause.totalPnlUsdt).toBe(-120.5);
    expect(c.rootCause.contributorsCount).toBe(2);
    expect(c.rootCause.topLoser).toMatchObject({ tradeId: "t1", symbol: "BTCUSDT", pnlUsdt: -80 });
    expect(c.edgeDeterioration).toHaveLength(1);
    expect(c.edgeDeterioration[0]).toMatchObject({ status: "CRITICAL", deltaWinRate: -14.7, trades7d: 12 });
    expect(c.recovery).toMatchObject({ similarEventsFound: 5, recoveryProbabilityPct: 80, classification: "FAVORÁVEL" });
    expect(c.advisoryNote).toContain("ADVISORY ONLY");
    expect(c.fetchedAt).toBe(AT);
    expect(c.error).toBeNull();
  });

  it("treats status not-triggered-looking payload (worst_edge_status NORMAL) honestly, without inventing a triggered/not-triggered flag", () => {
    const raw: KillSwitchReportRaw = {
      advisory_only: true,
      report: {
        account_id: "specky",
        generated_at: AT,
        trigger_reason: "manual_query",
        dd_daily_pct: 0,
        dd_weekly_pct: 0,
        dd_monthly_pct: 0,
        consecutive_losses: 0,
        root_cause: { total_pnl_usdt: 0, contributors: [], top_loser: null },
        edge_deterioration: [],
        recovery: { similar_events_found: 0, avg_recovery_7d: null, recovery_probability_pct: null, classification: "NEUTRA" },
        worst_edge_status: "NORMAL",
      },
    };
    const c = normalizeKillSwitchReport(raw, AT);
    expect(c.worstEdgeStatus).toBe("NORMAL");
    expect(c.triggerState).toBe("UNKNOWN");
    expect(c.status).toBe("ok");
  });

  it("handles a partial payload (missing recovery/edge_deterioration/root_cause) without throwing", () => {
    const raw: KillSwitchReportRaw = {
      advisory_only: true,
      report: {
        account_id: "specky",
        generated_at: AT,
        trigger_reason: "manual_query",
      },
    };
    const c = normalizeKillSwitchReport(raw, AT);
    expect(c.status).toBe("ok");
    expect(c.rootCause).toEqual({ totalPnlUsdt: null, contributorsCount: 0, topLoser: null });
    expect(c.edgeDeterioration).toEqual([]);
    expect(c.recovery).toMatchObject({ similarEventsFound: 0, classification: "UNKNOWN" });
    expect(c.worstEdgeStatus).toBe("UNKNOWN");
  });

  it("handles null numeric/enum fields without throwing", () => {
    const raw: KillSwitchReportRaw = {
      advisory_only: true,
      report: {
        account_id: "specky",
        dd_daily_pct: null,
        dd_weekly_pct: null,
        dd_monthly_pct: null,
        consecutive_losses: null,
        root_cause: { total_pnl_usdt: null, contributors: [], top_loser: null },
        recovery: { similar_events_found: 0, avg_recovery_7d: null, recovery_probability_pct: null, classification: undefined },
        worst_edge_status: undefined,
      },
    };
    const c = normalizeKillSwitchReport(raw, AT);
    expect(c.ddDailyPct).toBeNull();
    expect(c.consecutiveLosses).toBeNull();
    expect(c.worstEdgeStatus).toBe("UNKNOWN");
    expect(c.recovery.classification).toBe("UNKNOWN");
  });

  it("degrades when advisory_only is not reported true", () => {
    const c = normalizeKillSwitchReport({ advisory_only: false, report: FULL_RAW.report }, AT);
    expect(c.status).toBe("degraded");
    expect(c.notes.join(" ")).toContain("advisory-only");
  });

  it("degrades when the report field itself is missing (malformed shape)", () => {
    const c = normalizeKillSwitchReport({ advisory_only: true }, AT);
    expect(c.status).toBe("degraded");
    expect(c.notes.join(" ")).toContain("report");
    expect(c.rootCause.topLoser).toBeNull();
  });

  it("always flags dd_*/consecutive_losses as input echoes, never live telemetry", () => {
    const c = normalizeKillSwitchReport(FULL_RAW, AT);
    expect(c.ddIsInputEcho).toBe(true);
    expect(c.notes.some((n) => n.includes("ecoados"))).toBe(true);
  });
});

describe("unavailableKillSwitch", () => {
  it("builds a graceful-degradation contract with the detail as error and note", () => {
    const c = unavailableKillSwitch("poupi-crypto inacessível", AT);
    expect(c.status).toBe("unavailable");
    expect(c.error).toBe("poupi-crypto inacessível");
    expect(c.notes).toContain("poupi-crypto inacessível");
    expect(c.triggerState).toBe("UNKNOWN");
    expect(c.worstEdgeStatus).toBe("UNKNOWN");
    expect(c.rootCause).toEqual({ totalPnlUsdt: null, contributorsCount: 0, topLoser: null });
    expect(c.edgeDeterioration).toEqual([]);
    expect(c.fetchedAt).toBe(AT);
  });
});
