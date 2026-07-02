import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import {
  normalizeInfrastructureHealth,
  type InfrastructureHealthRaw,
  type InfrastructureReadyRaw,
  unavailableInfrastructureHealth,
} from "@/lib/infrastructure-health";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for infrastructure.health. It only proxies data-core /health and
 * /ready, normalizes the read-only observability contract, and degrades safely.
 */
export async function GET() {
  const fetchedAt = new Date().toISOString();
  try {
    const client = backendClient("data-core");
    const health = await client.get<InfrastructureHealthRaw>("/health");
    let ready: InfrastructureReadyRaw | null = null;

    try {
      ready = await client.get<InfrastructureReadyRaw>("/ready");
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 503) {
        ready = {
          ready: false,
          decision: "BLOCKED",
          blockers: ["data-core /ready respondeu 503"],
        };
      } else {
        throw error;
      }
    }

    return NextResponse.json(normalizeInfrastructureHealth(health, ready, fetchedAt));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `data-core respondeu ${error.status}`
        : "data-core inacessivel";
    return NextResponse.json(unavailableInfrastructureHealth(detail, fetchedAt), { status: 200 });
  }
}
