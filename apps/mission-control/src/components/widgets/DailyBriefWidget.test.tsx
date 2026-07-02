import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DailyBriefWidget } from "@/components/widgets/DailyBriefWidget";
import type { DailyBriefContract } from "@/lib/contracts";

const EMPTY: DailyBriefContract = {
  status: "empty",
  initialized: true,
  briefId: "abc123",
  generatedAt: "",
  scientificHealth: 1.0,
  sections: [{ title: "Mirror", headline: "No activity observed.", metrics: {}, lines: [] }],
  fetchedAt: "2026-07-02T00:00:00.000Z",
  notes: ["runtime sem event source"],
  error: null,
};

describe("DailyBriefWidget", () => {
  it("renders sections and the empty-state chip when there is no activity", () => {
    render(<DailyBriefWidget data={EMPTY} latencyMs={8} />);
    expect(screen.getByText("Daily Brief")).toBeInTheDocument();
    expect(screen.getByText("Sem atividade")).toBeInTheDocument();
    expect(screen.getByText("Mirror")).toBeInTheDocument();
    expect(screen.getByText("No activity observed.")).toBeInTheDocument();
    expect(screen.getByText(/latência: 8ms/)).toBeInTheDocument();
  });

  it("renders lines when a section has real activity", () => {
    const withActivity: DailyBriefContract = {
      ...EMPTY,
      status: "ok",
      sections: [
        { title: "Infrastructure", headline: "1 observation(s).", metrics: { count: 1 }, lines: ["postgres.down: 1"] },
      ],
    };
    render(<DailyBriefWidget data={withActivity} />);
    expect(screen.getByText("Com atividade")).toBeInTheDocument();
    expect(screen.getByText("postgres.down: 1")).toBeInTheDocument();
  });

  it("renders a friendly message when unavailable", () => {
    render(<DailyBriefWidget data={{ ...EMPTY, status: "unavailable", error: "data-core inacessível" }} />);
    expect(screen.getByText("Indisponível")).toBeInTheDocument();
    expect(screen.getByText(/data-core inacessível/)).toBeInTheDocument();
  });

  it("shows a loading state before the first payload", () => {
    render(<DailyBriefWidget data={null} loading />);
    expect(screen.getByText(/Carregando daily brief/)).toBeInTheDocument();
  });
});
