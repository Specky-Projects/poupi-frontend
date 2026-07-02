import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import {
  normalizeExecutiveStatus,
  type ExecutiveStatusRaw,
  unavailableOverview,
} from "@/lib/overview-status";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for overview.executive-status. Thin by design:
 * fetch the official poupi-crypto Source of Truth, normalize to OverviewPayload,
 * and degrade safely when the backend is unavailable.
 */
export async function GET() {
  try {
    const raw = await backendClient("poupi-crypto").get<ExecutiveStatusRaw>(
      "/api/v1/crypto/admin/executive/status",
    );
    return NextResponse.json(normalizeExecutiveStatus(raw));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `poupi-crypto respondeu ${error.status}`
        : "poupi-crypto inacessivel";
    return NextResponse.json(unavailableOverview(detail), { status: 200 });
  }
}
