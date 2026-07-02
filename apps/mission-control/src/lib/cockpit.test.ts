import { describe, expect, it } from "vitest";

import type { CapabilityEntry } from "@/lib/capability-catalog";
import { certifiedCapabilities, incidentDomains, pendingCapabilities } from "@/lib/cockpit";
import type { OverviewPayload } from "@/lib/contracts";

function entry(overrides: Partial<CapabilityEntry>): CapabilityEntry {
  return {
    id: "test.entry",
    name: "Test",
    domain: "Mirror",
    owner: "owner",
    project: "data-core",
    sourceOfTruth: "sot",
    endpoint: null,
    bffRoute: null,
    contract: null,
    hook: null,
    widget: null,
    screen: null,
    tests: [],
    category: "A",
    phase: 0,
    status: "planned",
    reuse: "adapter",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false,
    notes: "",
    ...overrides,
  };
}

describe("certifiedCapabilities", () => {
  it("keeps only phase >= 6 entries", () => {
    const catalog = [entry({ id: "a", phase: 7 }), entry({ id: "b", phase: 6 }), entry({ id: "c", phase: 2 })];
    expect(certifiedCapabilities(catalog).map((c) => c.id)).toEqual(["a", "b"]);
  });
});

describe("pendingCapabilities", () => {
  it("keeps only blocked or planned entries", () => {
    const catalog = [
      entry({ id: "a", status: "blocked" }),
      entry({ id: "b", status: "planned" }),
      entry({ id: "c", status: "live" }),
      entry({ id: "d", status: "audited" }),
    ];
    expect(pendingCapabilities(catalog).map((c) => c.id)).toEqual(["a", "b"]);
  });
});

describe("incidentDomains", () => {
  it("returns null when there is no real snapshot", () => {
    expect(incidentDomains(null)).toBeNull();
    const empty: OverviewPayload = { overall: "NO_DATA", healthScore: 0, domains: [], generatedAt: null, notes: [] };
    expect(incidentDomains(empty)).toBeNull();
  });

  it("returns only NOT_READY domains when a real snapshot exists", () => {
    const overview: OverviewPayload = {
      overall: "READY_WITH_OBSERVATIONS",
      healthScore: 80,
      domains: [
        { domain: "Mirror", status: "READY" },
        { domain: "Database", status: "NOT_READY" },
      ],
      generatedAt: "2026-07-02T10:00:00Z",
      notes: [],
    };
    expect(incidentDomains(overview)).toEqual([{ domain: "Database", status: "NOT_READY" }]);
  });
});
