import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import {
  normalizePlatformStatus,
  type PlatformStatusRaw,
  unavailablePlatformStatus,
} from "@/lib/platform-status";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for the universal-platform.status capability. Thin by design:
 * fetch → normalize → JSON. No business logic, no parallel cache, no fake
 * fallback — degrades to a clear `unavailable` contract when data-core is down.
 */
export async function GET() {
  const fetchedAt = new Date().toISOString();
  try {
    const raw = await backendClient("data-core").get<PlatformStatusRaw>(
      "/universal-platform/status",
    );
    return NextResponse.json(normalizePlatformStatus(raw, fetchedAt));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `data-core respondeu ${error.status}`
        : "data-core inacessível";
    return NextResponse.json(unavailablePlatformStatus(detail, fetchedAt), { status: 200 });
  }
}
