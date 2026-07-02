import { describe, expect, it } from "vitest";

import {
  deriveDomainHealth,
  deriveExplorerEntries,
  displayValue,
  EXPLORER_DOMAINS,
  NOT_AUDITED,
} from "@/lib/architecture-explorer";
import type { CapabilityEntry } from "@/lib/capability-catalog";

const base: CapabilityEntry = {
  id: "architecture.root",
  name: "Architecture Root",
  domain: "Architecture",
  owner: "capability_orchestrator",
  project: "data-core",
  sourceOfTruth: "CapabilityRegistry",
  endpoint: "GET /capabilities",
  bffRoute: "/api/capabilities",
  contract: "CapabilityRegistryPayload",
  hook: "useCapabilities",
  widget: "CapabilityRegistryWidget",
  screen: "/architecture",
  tests: [],
  category: "A",
  phase: 7,
  status: "live",
  reuse: "full",
  production: "READY",
  dependencies: [],
  certifiedRealData: true,
  notes: "Certified",
};

describe("architecture explorer derivation", () => {
  it("keeps empty fields honest", () => {
    expect(displayValue(null)).toBe("Unknown");
    expect(displayValue("", NOT_AUDITED)).toBe("Not Audited");
  });

  it("derives consumers from catalog dependencies", () => {
    const dependent: CapabilityEntry = {
      ...base,
      id: "overview.consumer",
      name: "Overview Consumer",
      domain: "Overview",
      dependencies: ["architecture.root"],
      certifiedRealData: false,
      phase: 0,
      status: "planned",
      production: "BLOCKED",
    };

    const entries = deriveExplorerEntries([base, dependent]);
    expect(entries.find((entry) => entry.id === "architecture.root")?.consumers).toEqual(["overview.consumer"]);
    expect(entries.find((entry) => entry.id === "overview.consumer")?.blockers).toContain("Not Audited");
  });

  it("always exposes the required operational domains without inventing capabilities", () => {
    const health = deriveDomainHealth([base]);
    for (const domain of EXPLORER_DOMAINS) {
      expect(health.some((entry) => entry.domain === domain)).toBe(true);
    }
    expect(health.find((entry) => entry.domain === "Poupi Baby")?.total).toBe(0);
  });
});
