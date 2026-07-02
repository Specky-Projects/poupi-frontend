import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PlatformStatusWidget } from "@/components/widgets/PlatformStatusWidget";
import type { PlatformStatusContract } from "@/lib/contracts";

const OK: PlatformStatusContract = {
  status: "ok",
  initialized: true,
  version: "universal-platform-phase2-v1",
  capabilities: ["poupi.observe", "infra.observe"],
  capabilityCount: 2,
  adapters: [
    { project: "poupi-baby", domain: "POUPI_BABY", advisoryOnly: true, shadowMode: true, readOnly: true },
  ],
  advisoryOnly: true,
  shadowMode: true,
  readOnly: true,
  fetchedAt: "2026-07-02T00:00:00.000Z",
  notes: [],
  error: null,
};

describe("PlatformStatusWidget", () => {
  it("renders the healthy state with version, capability count and latency", () => {
    render(<PlatformStatusWidget data={OK} latencyMs={12} />);
    expect(screen.getByText("Universal Platform")).toBeInTheDocument();
    expect(screen.getByText("universal-platform-phase2-v1")).toBeInTheDocument();
    expect(screen.getByText("Operacional")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/latência: 12ms/)).toBeInTheDocument();
    expect(screen.getByText("poupi-baby")).toBeInTheDocument();
  });

  it("renders a friendly message when unavailable", () => {
    render(<PlatformStatusWidget data={{ ...OK, status: "unavailable", error: "data-core inacessível" }} />);
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
    expect(screen.getByText(/data-core inacessível/)).toBeInTheDocument();
  });

  it("shows a loading state before the first payload", () => {
    render(<PlatformStatusWidget data={null} loading />);
    expect(screen.getByText(/Carregando universal platform/)).toBeInTheDocument();
  });
});
