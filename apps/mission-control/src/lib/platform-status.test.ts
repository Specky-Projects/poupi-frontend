import { describe, expect, it } from "vitest";

import {
  normalizePlatformStatus,
  type PlatformStatusRaw,
  unavailablePlatformStatus,
} from "@/lib/platform-status";

const AT = "2026-07-02T00:00:00.000Z";

describe("normalizePlatformStatus", () => {
  it("maps a healthy payload to ok", () => {
    const raw: PlatformStatusRaw = {
      initialized: true,
      version: "universal-platform-phase2-v1",
      capabilities: ["poupi.observe", "infra.observe"],
      adapters: {
        "poupi-baby": {
          project: "poupi-baby",
          domain: "POUPI_BABY",
          advisory_only: true,
          shadow_mode: true,
          read_only: true,
        },
      },
      advisory_only: true,
      shadow_mode: true,
      read_only: true,
    };
    const c = normalizePlatformStatus(raw, AT);
    expect(c.status).toBe("ok");
    expect(c.initialized).toBe(true);
    expect(c.capabilityCount).toBe(2);
    expect(c.adapters).toHaveLength(1);
    expect(c.adapters[0]).toMatchObject({ project: "poupi-baby", domain: "POUPI_BABY", readOnly: true });
    expect(c.version).toBe("universal-platform-phase2-v1");
    expect(c.fetchedAt).toBe(AT);
    expect(c.notes).toEqual([]);
    expect(c.error).toBeNull();
  });

  it("degrades when the platform did not initialize", () => {
    const c = normalizePlatformStatus({ initialized: false, error: "boom", advisory_only: true }, AT);
    expect(c.status).toBe("degraded");
    expect(c.error).toBe("boom");
    expect(c.capabilityCount).toBe(0);
    expect(c.notes.join(" ")).toContain("boom");
  });

  it("degrades when advisory-only/read-only invariant is not reported", () => {
    const c = normalizePlatformStatus(
      { initialized: true, advisory_only: false, read_only: false, capabilities: [] },
      AT,
    );
    expect(c.status).toBe("degraded");
  });
});

describe("unavailablePlatformStatus", () => {
  it("builds an unavailable contract with the detail as error and note", () => {
    const c = unavailablePlatformStatus("data-core inacessível", AT);
    expect(c.status).toBe("unavailable");
    expect(c.initialized).toBe(false);
    expect(c.error).toBe("data-core inacessível");
    expect(c.adapters).toEqual([]);
    expect(c.capabilities).toEqual([]);
    expect(c.notes).toContain("data-core inacessível");
    expect(c.fetchedAt).toBe(AT);
  });
});
