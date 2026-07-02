import { describe, expect, it } from "vitest";

import { type AlertsRaw, normalizeAlerts, unavailableAlerts } from "@/lib/alerts";

const AT = "2026-07-02T00:00:00.000Z";

describe("normalizeAlerts", () => {
  it("maps a well-formed empty evaluation (no event source) to empty", () => {
    const raw: AlertsRaw = { initialized: true, advisory_only: true, alerts: [], count: 0 };
    const c = normalizeAlerts(raw, AT);
    expect(c.status).toBe("empty");
    expect(c.initialized).toBe(true);
    expect(c.alerts).toEqual([]);
    expect(c.count).toBe(0);
    expect(c.notes.join(" ")).toContain("sem event source");
    expect(c.fetchedAt).toBe(AT);
    expect(c.error).toBeNull();
  });

  it("maps correlated alerts to ok, field-renaming verbatim", () => {
    const raw: AlertsRaw = {
      initialized: true,
      count: 1,
      alerts: [
        {
          alert_id: "a1",
          title: "Critical Infrastructure Alert",
          severity: "CRITICAL",
          evidence: ["observation:o1"],
          root_cause: "Cache/scheduler instability propagated into Mirror synchronisation loss.",
          confidence: 0.9,
          recommended_action: "Stabilise Redis + scheduler.",
          replay_ref: "pipeline-1",
          correlated_event_ids: ["e1", "e2"],
          created_at: "2026-06-30T10:00:00Z",
          rule_id: "critical-infrastructure",
        },
      ],
    };
    const c = normalizeAlerts(raw, AT);
    expect(c.status).toBe("ok");
    expect(c.count).toBe(1);
    expect(c.notes).toEqual([]);
    expect(c.alerts[0]).toMatchObject({
      alertId: "a1",
      severity: "CRITICAL",
      rootCause: "Cache/scheduler instability propagated into Mirror synchronisation loss.",
      recommendedAction: "Stabilise Redis + scheduler.",
      replayRef: "pipeline-1",
      ruleId: "critical-infrastructure",
    });
  });

  it("degrades to unavailable when the platform did not initialize", () => {
    const c = normalizeAlerts({ initialized: false, error: "boom", alerts: [], count: 0 }, AT);
    expect(c.status).toBe("unavailable");
    expect(c.error).toBe("boom");
    expect(c.notes.join(" ")).toContain("boom");
  });
});

describe("unavailableAlerts", () => {
  it("builds an unavailable contract with the detail as error and note", () => {
    const c = unavailableAlerts("data-core inacessível", AT);
    expect(c.status).toBe("unavailable");
    expect(c.initialized).toBe(false);
    expect(c.alerts).toEqual([]);
    expect(c.count).toBe(0);
    expect(c.error).toBe("data-core inacessível");
    expect(c.notes).toContain("data-core inacessível");
    expect(c.fetchedAt).toBe(AT);
  });
});
