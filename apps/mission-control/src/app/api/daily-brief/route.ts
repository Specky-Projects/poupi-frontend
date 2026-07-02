import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import { type DailyBriefRaw, normalizeDailyBrief, unavailableDailyBrief } from "@/lib/daily-brief";

export const dynamic = "force-dynamic";

/**
 * BFF adapter for the universal-platform.daily-brief capability. Thin by
 * design: fetch → normalize → JSON. No business logic, no event source of
 * its own — the backend runtime is stateless and returns a well-formed,
 * empty brief until an event source is wired (out of scope here).
 */
export async function GET() {
  const fetchedAt = new Date().toISOString();
  try {
    const raw = await backendClient("data-core").get<DailyBriefRaw>(
      "/universal-platform/daily-brief",
    );
    return NextResponse.json(normalizeDailyBrief(raw, fetchedAt));
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `data-core respondeu ${error.status}`
        : "data-core inacessível";
    return NextResponse.json(unavailableDailyBrief(detail, fetchedAt), { status: 200 });
  }
}
