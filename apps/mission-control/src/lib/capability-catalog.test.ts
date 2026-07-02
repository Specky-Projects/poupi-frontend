import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CAPABILITY_CATALOG, catalogSummary } from "@/lib/capability-catalog";

describe("capability catalog (no regression)", () => {
  it("keeps the certified Architecture capability live with real-data cert", () => {
    const arch = CAPABILITY_CATALOG.find((c) => c.id === "architecture.capability-registry");
    expect(arch).toBeDefined();
    expect(arch?.status).toBe("live");
    expect(arch?.certifiedRealData).toBe(true);
  });

  it("tracks the universal-platform.status capability being delivered", () => {
    const entry = CAPABILITY_CATALOG.find((c) => c.id === "universal-platform.status");
    expect(entry).toBeDefined();
    expect(entry?.category).toBe("A");
    expect(entry?.phase).toBe(7);
    expect(entry?.contract).toBe("PlatformStatusContract");
    expect(entry?.bffRoute).toBe("/api/platform-status");
    expect(entry?.hook).toBe("usePlatformStatus");
    expect(entry?.widget).toBe("PlatformStatusWidget");
  });

  it("tracks the kill-switch.state capability being delivered", () => {
    const entry = CAPABILITY_CATALOG.find((c) => c.id === "kill-switch.state");
    expect(entry).toBeDefined();
    expect(entry?.category).toBe("B");
    expect(entry?.contract).toBe("KillSwitchContract");
    expect(entry?.bffRoute).toBe("/api/kill-switch");
    expect(entry?.hook).toBe("useKillSwitch");
    expect(entry?.widget).toBe("KillSwitchWidget");
    expect(entry?.screen).toBe("/mirror");
    expect(entry?.certifiedRealData).toBe(false);
  });

  it("has unique capability ids", () => {
    const ids = CAPABILITY_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("summary status counts sum to the total", () => {
    const s = catalogSummary();
    expect(s.total).toBe(CAPABILITY_CATALOG.length);
    const sum = Object.values(s.byStatus).reduce((a, b) => a + b, 0);
    expect(sum).toBe(s.total);
  });

  it("requires the complete delivery stack for every certified capability", () => {
    const certified = CAPABILITY_CATALOG.filter((c) => c.phase === 7);
    expect(certified.length).toBeGreaterThan(0);
    for (const entry of certified) {
      expect(entry.sourceOfTruth).toBeTruthy();
      expect(entry.category).toBeTruthy();
      expect(entry.project).toBeTruthy();
      expect(entry.endpoint).toBeTruthy();
      expect(entry.contract).toBeTruthy();
      expect(entry.bffRoute).toBeTruthy();
      expect(entry.hook).toBeTruthy();
      expect(entry.widget).toBeTruthy();
      expect(entry.screen).toBeTruthy();
      expect(entry.tests.length).toBeGreaterThan(0);
      expect(entry.certifiedRealData).toBe(true);
    }
  });

  it("keeps catalog implementation references resolvable for built capabilities", () => {
    const built = CAPABILITY_CATALOG.filter((c) => c.contract || c.bffRoute || c.hook || c.widget || c.screen);
    for (const entry of built) {
      if (entry.bffRoute) {
        const routePath = entry.bffRoute.replace(/^\/api\//, "").replaceAll("/", "\\");
        expect(existsSync(join(process.cwd(), "src", "app", "api", routePath, "route.ts"))).toBe(true);
      }
      if (entry.hook) {
        expect(existsSync(join(process.cwd(), "src", "lib", `${entry.hook}.ts`))).toBe(true);
      }
      if (entry.widget) {
        expect(existsSync(join(process.cwd(), "src", "components", "widgets", `${entry.widget}.tsx`))).toBe(true);
      }
      for (const testFile of entry.tests) {
        expect(existsSync(join(process.cwd(), testFile))).toBe(true);
      }
    }
  });

  it("does not allow a live/certified status outside the official stack", () => {
    const invalid = CAPABILITY_CATALOG.filter((entry) => {
      const claimsDelivered = entry.status === "live" || entry.certifiedRealData || entry.phase === 7;
      const hasStack = Boolean(
        entry.sourceOfTruth &&
          entry.category &&
          entry.project &&
          entry.endpoint &&
          entry.contract &&
          entry.bffRoute &&
          entry.hook &&
          entry.widget &&
          entry.screen &&
          entry.tests.length > 0,
      );
      return claimsDelivered && !hasStack;
    });

    expect(invalid).toEqual([]);
  });
});
