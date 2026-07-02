import { describe, expect, it } from "vitest";

import {
  normalizeInfrastructureHealth,
  unavailableInfrastructureHealth,
} from "@/lib/infrastructure-health";

const AT = "2026-07-02T12:00:00.000Z";

describe("normalizeInfrastructureHealth", () => {
  it("normalizes ok health/readiness", () => {
    const payload = normalizeInfrastructureHealth(
      {
        status: "ok",
        app: "data-core",
        environment: "production",
        dependencies: {
          postgres: { status: "ok" },
          redis: { status: "ok" },
        },
      },
      {
        ready: true,
        app: "data-core",
        decision: "READY",
        operational_status: "GO",
        checks: { postgres: "ok", redis: "ok" },
        blockers: [],
      },
      AT,
    );

    expect(payload.status).toBe("ok");
    expect(payload.ready).toBe(true);
    expect(payload.decision).toBe("READY");
    expect(payload.dependencies).toHaveLength(2);
    expect(payload.error).toBeNull();
  });

  it("normalizes degraded health/readiness", () => {
    const payload = normalizeInfrastructureHealth(
      {
        status: "degraded",
        app: "data-core",
        dependencies: {
          postgres: { status: "ok" },
          redis: { status: "error", detail: "timeout" },
        },
      },
      {
        ready: false,
        decision: "BLOCKED",
        checks: { postgres: "ok", redis: "error: timeout" },
        blockers: ["redis"],
      },
      AT,
    );

    expect(payload.status).toBe("degraded");
    expect(payload.ready).toBe(false);
    expect(payload.blockers).toContain("redis");
    expect(payload.notes.length).toBeGreaterThan(0);
  });
});

describe("unavailableInfrastructureHealth", () => {
  it("returns a safe unavailable contract", () => {
    const payload = unavailableInfrastructureHealth("data-core inacessivel", AT);

    expect(payload.status).toBe("unavailable");
    expect(payload.ready).toBeNull();
    expect(payload.dependencies).toEqual([]);
    expect(payload.error).toBe("data-core inacessivel");
  });
});
