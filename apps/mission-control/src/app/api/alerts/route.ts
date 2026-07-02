import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { type AlertsRaw, normalizeAlerts, unavailableAlerts } from "@/lib/alerts";
import { backendClient } from "@/lib/backends";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for the universal-platform.alerts capability. Thin by design:
 * fetch → normalize → JSON. No business logic, no event source of its own —
 * the backend runtime is stateless and returns a well-formed, empty
 * evaluation until an event source is wired (out of scope here).
 */
export async function GET() {
  const fetchedAt = new Date().toISOString();
  try {
    const raw = await backendClient("data-core").get<AlertsRaw>("/universal-platform/alerts");
    return NextResponse.json(normalizeAlerts(raw, fetchedAt));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `data-core respondeu ${error.status}`
        : "data-core inacessível";
    return NextResponse.json(unavailableAlerts(detail, fetchedAt), { status: 200 });
  }
}
