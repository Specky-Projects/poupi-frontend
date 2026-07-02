import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import { normalizeKillSwitchReport, type KillSwitchReportRaw, unavailableKillSwitch } from "@/lib/kill-switch";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for the kill-switch.state capability. Thin by design: fetch →
 * normalize → JSON. No business logic, no engine execution, no mutation —
 * proxies poupi-crypto's advisory-only GET /report and degrades safely when
 * the backend is unreachable or the payload is malformed.
 */
export async function GET() {
  const fetchedAt = new Date().toISOString();
  try {
    const raw = await backendClient("poupi-crypto").get<KillSwitchReportRaw>(
      "/api/v1/crypto/analytics/kill-switch/report",
    );
    return NextResponse.json(normalizeKillSwitchReport(raw, fetchedAt));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `poupi-crypto respondeu ${error.status}`
        : "poupi-crypto inacessível";
    return NextResponse.json(unavailableKillSwitch(detail, fetchedAt), { status: 200 });
  }
}
