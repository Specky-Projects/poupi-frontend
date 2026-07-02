import { describe, expect, it } from "vitest";

import type { CapabilityEntry } from "@/lib/capability-catalog";
import { DOMAIN_STRIP_ITEMS, buildDomainStrip, computeDomainStripStatus } from "@/lib/domain-strip";
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

describe("computeDomainStripStatus", () => {
  const mirrorItem = DOMAIN_STRIP_ITEMS.find((i) => i.key === "mirror")!;

  it("is NO_DATA when there is no catalog entry and no overview signal", () => {
    const researchItem = DOMAIN_STRIP_ITEMS.find((i) => i.key === "research")!;
    expect(computeDomainStripStatus(researchItem, null, [])).toBe("NO_DATA");
  });

  it("is PLANNED when a catalog entry exists but nothing is live or blocked", () => {
    expect(computeDomainStripStatus(mirrorItem, null, [entry({ domain: "Mirror", status: "planned" })])).toBe(
      "PLANNED",
    );
  });

  it("is BLOCKED when the domain has a blocked catalog entry", () => {
    expect(computeDomainStripStatus(mirrorItem, null, [entry({ domain: "Mirror", status: "blocked" })])).toBe(
      "BLOCKED",
    );
  });

  it("is LIVE when the domain has a live catalog entry", () => {
    expect(computeDomainStripStatus(mirrorItem, null, [entry({ domain: "Mirror", status: "live" })])).toBe("LIVE");
  });

  it("prefers a real overview domain signal over the catalog rollup", () => {
    const overview: OverviewPayload = {
      overall: "READY",
      healthScore: 100,
      domains: [{ domain: "Mirror", status: "NOT_READY" }],
      generatedAt: null,
      notes: [],
    };
    expect(computeDomainStripStatus(mirrorItem, overview, [entry({ domain: "Mirror", status: "live" })])).toBe(
      "BLOCKED",
    );
  });

  it("falls back to the catalog when the overview reports NO_DATA/NOT_AVAILABLE for that domain", () => {
    const overview: OverviewPayload = {
      overall: "NOT_AVAILABLE",
      healthScore: 0,
      domains: [{ domain: "Mirror", status: "NOT_AVAILABLE" }],
      generatedAt: null,
      notes: [],
    };
    expect(computeDomainStripStatus(mirrorItem, overview, [entry({ domain: "Mirror", status: "planned" })])).toBe(
      "PLANNED",
    );
  });

  it("resolves the Overview tile from overview.overall when present", () => {
    const overviewItem = DOMAIN_STRIP_ITEMS.find((i) => i.key === "overview")!;
    const overview: OverviewPayload = {
      overall: "READY",
      healthScore: 100,
      domains: [],
      generatedAt: null,
      notes: [],
    };
    expect(computeDomainStripStatus(overviewItem, overview, [])).toBe("LIVE");
  });

  it("covers all 8 mandatory domains exactly once", () => {
    const keys = DOMAIN_STRIP_ITEMS.map((i) => i.key);
    expect(keys).toEqual([
      "mirror",
      "research",
      "business-os",
      "poupi-baby",
      "universal-platform",
      "infrastructure",
      "architecture",
      "overview",
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("buildDomainStrip", () => {
  it("builds a tile for every mandatory domain with a capability count", () => {
    const tiles = buildDomainStrip(null, [entry({ domain: "Mirror", status: "planned" })]);
    expect(tiles).toHaveLength(8);
    const mirror = tiles.find((t) => t.item.key === "mirror")!;
    expect(mirror.status).toBe("PLANNED");
    expect(mirror.capabilityCount).toBe(1);
  });
});
