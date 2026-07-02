import { describe, expect, it } from "vitest";

import { type DailyBriefRaw, normalizeDailyBrief, unavailableDailyBrief } from "@/lib/daily-brief";

const AT = "2026-07-02T00:00:00.000Z";

describe("normalizeDailyBrief", () => {
  it("maps a well-formed empty brief (no event source) to empty, even though placeholder sections carry non-empty lines", () => {
    // Regression fixture: Top Opportunities / open-alerts sections always
    // render a "None observed." / "No open alerts." placeholder line even
    // when truly empty — status must not be derived from lines.length.
    const raw: DailyBriefRaw = {
      initialized: true,
      advisory_only: true,
      brief_id: "abc123",
      generated_at: "",
      scientific_health: 1.0,
      sections: [
        { title: "Mirror", headline: "No activity observed.", metrics: {}, lines: [] },
        { title: "Open Alerts", headline: "No open alerts.", metrics: {}, lines: [] },
        {
          title: "Top Opportunities",
          headline: "0 highest-confidence opportunit(ies).",
          metrics: {},
          lines: ["None observed."],
        },
        {
          title: "Scientific Health",
          headline: "100.00% of observations fully covered.",
          metrics: { health: 1.0, observations: 0 },
          lines: [],
        },
      ],
    };
    const c = normalizeDailyBrief(raw, AT);
    expect(c.status).toBe("empty");
    expect(c.initialized).toBe(true);
    expect(c.briefId).toBe("abc123");
    expect(c.scientificHealth).toBe(1.0);
    expect(c.sections).toHaveLength(4);
    expect(c.notes.join(" ")).toContain("sem event source");
    expect(c.fetchedAt).toBe(AT);
    expect(c.error).toBeNull();
  });

  it("maps a brief with real activity to ok", () => {
    const raw: DailyBriefRaw = {
      initialized: true,
      brief_id: "def456",
      generated_at: "2026-06-30",
      scientific_health: 0.8,
      sections: [
        { title: "Infrastructure", headline: "1 observation(s), worst severity CRITICAL.", metrics: { count: 1 }, lines: ["postgres.down: 1"] },
        {
          title: "Scientific Health",
          headline: "80.00% of observations fully covered.",
          metrics: { health: 0.8, observations: 1 },
          lines: [],
        },
      ],
    };
    const c = normalizeDailyBrief(raw, AT);
    expect(c.status).toBe("ok");
    expect(c.notes).toEqual([]);
    expect(c.generatedAt).toBe("2026-06-30");
  });

  it("degrades to unavailable when the platform did not initialize", () => {
    const c = normalizeDailyBrief({ initialized: false, error: "boom", sections: [] }, AT);
    expect(c.status).toBe("unavailable");
    expect(c.error).toBe("boom");
    expect(c.notes.join(" ")).toContain("boom");
  });
});

describe("unavailableDailyBrief", () => {
  it("builds an unavailable contract with the detail as error and note", () => {
    const c = unavailableDailyBrief("data-core inacessível", AT);
    expect(c.status).toBe("unavailable");
    expect(c.initialized).toBe(false);
    expect(c.sections).toEqual([]);
    expect(c.error).toBe("data-core inacessível");
    expect(c.notes).toContain("data-core inacessível");
    expect(c.fetchedAt).toBe(AT);
  });
});
