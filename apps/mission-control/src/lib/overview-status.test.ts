import { describe, expect, it } from "vitest";

import { normalizeExecutiveStatus, unavailableOverview } from "@/lib/overview-status";

describe("normalizeExecutiveStatus", () => {
  it("normalizes an ok production snapshot", () => {
    const payload = normalizeExecutiveStatus({
      Mirror: "READY",
      Research: "READY",
      Observer: "READY",
      Infrastructure: "READY",
      Executor: "READY",
      CapitalPool: "READY",
      Telegram: "READY",
      Scheduler: "READY",
      Database: "READY",
      Overall: "PASS",
      generated_at: "2026-07-02T10:00:00Z",
    });

    expect(payload.overall).toBe("READY");
    expect(payload.healthScore).toBe(100);
    expect(payload.domains).toHaveLength(9);
    expect(payload.generatedAt).toBe("2026-07-02T10:00:00Z");
    expect(payload.notes).toEqual([]);
  });

  it("normalizes a degraded snapshot", () => {
    const payload = normalizeExecutiveStatus({
      Mirror: "READY_WITH_OBSERVATIONS",
      Research: "READY",
      Observer: "WARNING",
      Infrastructure: "READY",
      Executor: "NOT_AVAILABLE",
      CapitalPool: "READY",
      Telegram: "READY",
      Scheduler: "READY",
      Database: "READY",
      Overall: "WARNING",
    });

    expect(payload.overall).toBe("READY_WITH_OBSERVATIONS");
    expect(payload.domains.find((d) => d.domain === "Mirror")?.status).toBe("READY_WITH_OBSERVATIONS");
    expect(payload.healthScore).toBeGreaterThan(0);
    expect(payload.healthScore).toBeLessThan(100);
  });

  it("normalizes an empty/missing snapshot", () => {
    const payload = normalizeExecutiveStatus({
      status: "NO_DATA",
      message: "Nenhum snapshot disponivel.",
    });

    expect(payload.overall).toBe("NO_DATA");
    expect(payload.healthScore).toBe(0);
    expect(payload.domains).toEqual([]);
    expect(payload.notes).toContain("Nenhum snapshot disponivel.");
  });
});

describe("unavailableOverview", () => {
  it("returns a safe unavailable contract", () => {
    const payload = unavailableOverview("poupi-crypto inacessivel");

    expect(payload.overall).toBe("NOT_AVAILABLE");
    expect(payload.healthScore).toBe(0);
    expect(payload.domains).toEqual([]);
    expect(payload.notes).toEqual(["poupi-crypto inacessivel"]);
  });
});
