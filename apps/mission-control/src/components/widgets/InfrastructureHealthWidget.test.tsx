import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InfrastructureHealthWidget } from "@/components/widgets/InfrastructureHealthWidget";
import type { HealthContract } from "@/lib/contracts";

const OK: HealthContract = {
  status: "ok",
  app: "data-core",
  environment: "production",
  healthStatus: "ok",
  ready: true,
  decision: "READY",
  operationalStatus: "GO",
  dependencies: [{ name: "postgres", status: "ok", detail: null }],
  checks: [{ name: "redis", status: "ok", detail: null }],
  blockers: [],
  fetchedAt: "2026-07-02T12:00:00.000Z",
  notes: [],
  error: null,
};

describe("InfrastructureHealthWidget", () => {
  it("renders ok infrastructure health", () => {
    render(<InfrastructureHealthWidget data={OK} />);

    expect(screen.getByText("Infrastructure Health")).toBeInTheDocument();
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    expect(screen.getByText("READY")).toBeInTheDocument();
    expect(screen.getByText("postgres")).toBeInTheDocument();
  });

  it("renders degraded infrastructure health", () => {
    render(
      <InfrastructureHealthWidget
        data={{ ...OK, status: "degraded", ready: false, decision: "BLOCKED", blockers: ["redis"] }}
      />,
    );

    expect(screen.getByText("Degradado")).toBeInTheDocument();
    expect(screen.getAllByText(/redis/).length).toBeGreaterThan(0);
  });

  it("renders unavailable and loading states", () => {
    const { rerender } = render(<InfrastructureHealthWidget data={null} loading />);
    expect(screen.getByText(/Carregando health\/readiness/)).toBeInTheDocument();

    rerender(
      <InfrastructureHealthWidget
        data={{ ...OK, status: "unavailable", error: "data-core inacessivel", dependencies: [], checks: [] }}
      />,
    );
    expect(screen.getByText("Indisponivel")).toBeInTheDocument();
    expect(screen.getByText("data-core inacessivel")).toBeInTheDocument();
  });
});
