import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverviewStatusWidget } from "@/components/widgets/OverviewStatusWidget";
import type { OverviewPayload } from "@/lib/contracts";

const OK: OverviewPayload = {
  overall: "READY",
  healthScore: 100,
  domains: [
    { domain: "Mirror", status: "READY" },
    { domain: "Database", status: "READY" },
  ],
  generatedAt: "2026-07-02T10:00:00Z",
  notes: [],
};

describe("OverviewStatusWidget", () => {
  it("renders an ok overview snapshot", () => {
    render(<OverviewStatusWidget data={OK} />);

    expect(screen.getByText("Health Score global")).toBeInTheDocument();
    expect(screen.getByText("Dominios monitorados")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Mirror")).toBeInTheDocument();
  });

  it("renders an empty/missing snapshot state", () => {
    render(
      <OverviewStatusWidget
        data={{ ...OK, overall: "NO_DATA", healthScore: 0, domains: [], notes: ["NO_DATA"] }}
      />,
    );

    expect(screen.getByText("Sem dados de dominio.")).toBeInTheDocument();
    expect(screen.getByText("NO_DATA")).toBeInTheDocument();
  });

  it("renders loading and error states", () => {
    const { rerender } = render(<OverviewStatusWidget data={null} loading />);
    expect(screen.getByText(/Carregando status executivo/)).toBeInTheDocument();

    rerender(<OverviewStatusWidget data={null} error="Falha ao carregar overview" />);
    expect(screen.getByText("Falha ao carregar overview")).toBeInTheDocument();
  });
});
