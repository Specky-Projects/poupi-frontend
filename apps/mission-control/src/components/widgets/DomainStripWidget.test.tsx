import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DomainStripWidget } from "@/components/widgets/DomainStripWidget";
import type { OverviewPayload } from "@/lib/contracts";

describe("DomainStripWidget", () => {
  it("renders a tile for every mandatory domain", () => {
    render(<DomainStripWidget overview={null} />);

    for (const label of [
      "Mirror",
      "Research",
      "Business OS",
      "Poupi Baby",
      "Universal Platform",
      "Infrastructure",
      "Architecture",
      "Overview",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("never renders LIVE for a domain with no catalog entry and no overview signal", () => {
    render(<DomainStripWidget overview={null} />);
    // Research has no catalog entry and no overview match — must be NO_DATA.
    expect(screen.getAllByText("NO_DATA").length).toBeGreaterThan(0);
  });

  it("shows a loading state before any overview data has arrived", () => {
    render(<DomainStripWidget overview={null} loading />);
    expect(screen.getByText(/Carregando status por dom/)).toBeInTheDocument();
  });

  it("reflects a real overview signal for Mirror", () => {
    const overview: OverviewPayload = {
      overall: "READY",
      healthScore: 100,
      domains: [{ domain: "Mirror", status: "READY" }],
      generatedAt: "2026-07-02T10:00:00Z",
      notes: [],
    };
    render(<DomainStripWidget overview={overview} />);
    expect(screen.getAllByText("LIVE").length).toBeGreaterThan(0);
  });
});
