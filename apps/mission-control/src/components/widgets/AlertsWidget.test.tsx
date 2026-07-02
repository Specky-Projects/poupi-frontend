import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlertsWidget } from "@/components/widgets/AlertsWidget";
import type { AlertsContract } from "@/lib/contracts";

const EMPTY: AlertsContract = {
  status: "empty",
  initialized: true,
  alerts: [],
  count: 0,
  fetchedAt: "2026-07-02T00:00:00.000Z",
  notes: ["runtime sem event source"],
  error: null,
};

const WITH_ALERT: AlertsContract = {
  ...EMPTY,
  status: "ok",
  count: 1,
  alerts: [
    {
      alertId: "a1",
      title: "Critical Infrastructure Alert",
      severity: "CRITICAL",
      evidence: ["observation:o1"],
      rootCause: "Cache/scheduler instability propagated into Mirror synchronisation loss.",
      confidence: 0.9,
      recommendedAction: "Stabilise Redis + scheduler.",
      replayRef: "pipeline-1",
      correlatedEventIds: ["e1", "e2"],
      createdAt: "2026-06-30T10:00:00Z",
      ruleId: "critical-infrastructure",
    },
  ],
};

describe("AlertsWidget", () => {
  it("renders the empty state as a positive signal", () => {
    render(<AlertsWidget data={EMPTY} latencyMs={5} />);
    expect(screen.getByText("Critical Alerts")).toBeInTheDocument();
    expect(screen.getByText("Sem alertas")).toBeInTheDocument();
    expect(screen.getByText(/Nenhum alerta correlacionado/)).toBeInTheDocument();
    expect(screen.getByText(/latência: 5ms/)).toBeInTheDocument();
  });

  it("renders a correlated alert with severity, root cause and action", () => {
    render(<AlertsWidget data={WITH_ALERT} />);
    expect(screen.getByText("Alertas ativos")).toBeInTheDocument();
    expect(screen.getByText("Critical Infrastructure Alert")).toBeInTheDocument();
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText(/Cache\/scheduler instability/)).toBeInTheDocument();
    expect(screen.getByText(/Stabilise Redis \+ scheduler/)).toBeInTheDocument();
  });

  it("renders a friendly message when unavailable", () => {
    render(<AlertsWidget data={{ ...EMPTY, status: "unavailable", error: "data-core inacessível" }} />);
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
    expect(screen.getByText(/data-core inacessível/)).toBeInTheDocument();
  });

  it("shows a loading state before the first payload", () => {
    render(<AlertsWidget data={null} loading />);
    expect(screen.getByText(/Carregando alerts/)).toBeInTheDocument();
  });
});
