import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KillSwitchWidget } from "@/components/widgets/KillSwitchWidget";
import type { KillSwitchContract } from "@/lib/contracts";

const OK: KillSwitchContract = {
  status: "ok",
  accountId: "specky",
  generatedAt: "2026-07-02T00:00:00.000Z",
  triggerReason: "manual_query",
  ddDailyPct: 0,
  ddWeeklyPct: 0,
  ddMonthlyPct: 19.68,
  consecutiveLosses: 0,
  ddIsInputEcho: true,
  triggerState: "UNKNOWN",
  worstEdgeStatus: "CRITICAL",
  rootCause: {
    totalPnlUsdt: -120.5,
    contributorsCount: 2,
    topLoser: {
      tradeId: "t1",
      symbol: "BTCUSDT",
      side: "long",
      pnlUsdt: -80,
      contributionPct: 66.4,
      strategy: "mean_reversion",
      regime: "range",
      closedAt: "2026-07-01T20:00:00.000Z",
    },
  },
  edgeDeterioration: [
    {
      strategy: "mean_reversion",
      side: "long",
      status: "CRITICAL",
      deltaWinRate: -14.7,
      deltaProfitFactor: -0.5,
      trades7d: 12,
      winRate7d: 33.3,
      profitFactor7d: 0.6,
    },
  ],
  recovery: {
    similarEventsFound: 5,
    recoveryProbabilityPct: 80,
    classification: "FAVORÁVEL",
    avgRecovery7d: 45.2,
  },
  advisoryNote: "ADVISORY ONLY — Nenhuma ação operacional executada.",
  fetchedAt: "2026-07-02T00:00:05.000Z",
  notes: ["dd_daily_pct/dd_weekly_pct/dd_monthly_pct/consecutive_losses são ecoados do request (default 0), não telemetria ao vivo"],
  error: null,
};

describe("KillSwitchWidget", () => {
  it("renders the ok state with root cause, edge status and recovery", () => {
    render(<KillSwitchWidget data={OK} />);
    expect(screen.getByText("Kill Switch — Observability")).toBeInTheDocument();
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    expect(screen.getAllByText("Crítico").length).toBeGreaterThan(0);
    expect(screen.getByText("Favorável")).toBeInTheDocument();
    expect(screen.getByText(/BTCUSDT long/)).toBeInTheDocument();
    expect(screen.getByText(/5 evento\(s\)/)).toBeInTheDocument();
  });

  it("always shows the trigger-state as Not Audited instead of inventing triggered/not-triggered", () => {
    render(<KillSwitchWidget data={OK} />);
    expect(screen.getByText("Not Audited")).toBeInTheDocument();
  });

  it("renders NORMAL edge status distinctly from CRITICAL", () => {
    render(<KillSwitchWidget data={{ ...OK, worstEdgeStatus: "NORMAL" }} />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("renders a partial payload (no root cause / edge deterioration / recovery events) without breaking", () => {
    const partial: KillSwitchContract = {
      ...OK,
      ddDailyPct: null,
      ddWeeklyPct: null,
      ddMonthlyPct: null,
      consecutiveLosses: null,
      rootCause: { totalPnlUsdt: null, contributorsCount: 0, topLoser: null },
      edgeDeterioration: [],
      recovery: { similarEventsFound: 0, recoveryProbabilityPct: null, classification: "UNKNOWN", avgRecovery7d: null },
      worstEdgeStatus: "UNKNOWN",
    };
    render(<KillSwitchWidget data={partial} />);
    expect(screen.getAllByText("Unknown").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Not Audited").length).toBeGreaterThan(0);
  });

  it("renders a friendly message when unavailable (graceful degradation)", () => {
    render(
      <KillSwitchWidget
        data={{ ...OK, status: "unavailable", error: "poupi-crypto inacessível" }}
      />,
    );
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
    expect(screen.getByText(/poupi-crypto inacessível/)).toBeInTheDocument();
  });

  it("shows a loading state before the first payload", () => {
    render(<KillSwitchWidget data={null} loading />);
    expect(screen.getByText(/Carregando kill switch/)).toBeInTheDocument();
  });

  it("shows an error state before any payload has arrived", () => {
    render(<KillSwitchWidget data={null} error="Falha ao carregar kill switch" />);
    expect(screen.getByText("Falha ao carregar kill switch")).toBeInTheDocument();
  });
});
