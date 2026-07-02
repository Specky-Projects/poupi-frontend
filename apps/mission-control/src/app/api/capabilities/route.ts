import { NextResponse } from "next/server";

import { ApiClientError } from "@poupi-frontend/api-client";

import { backendClient } from "@/lib/backends";
import type { Capability, CapabilityRegistryPayload } from "@/lib/contracts";

export const dynamic = "force-dynamic";

/**
 * Raw shape of data-core GET /capabilities — the read-only projection of the
 * existing CapabilityRegistry. Mission Control does NOT maintain a parallel
 * catalog; this BFF route only renames fields to the shared camelCase contract.
 */
type CapabilityRaw = {
  capability_id: string;
  kind: string;
  name: string;
  description: string;
  owner: string;
  advisory_only: boolean;
  dependencies?: string[];
  source_platform: string;
};

type CapabilitiesRaw = {
  total: number;
  kinds: Record<string, number>;
  advisory_only: boolean;
  capabilities: CapabilityRaw[];
};

function normalize(raw: CapabilityRaw): Capability {
  return {
    capabilityId: raw.capability_id,
    kind: raw.kind,
    name: raw.name,
    description: raw.description,
    owner: raw.owner,
    advisoryOnly: raw.advisory_only,
    dependencies: raw.dependencies ?? [],
    sourcePlatform: raw.source_platform,
  };
}

export async function GET() {
  try {
    const raw = await backendClient("data-core").get<CapabilitiesRaw>("/capabilities");
    const payload: CapabilityRegistryPayload = {
      total: raw.total,
      kinds: raw.kinds ?? {},
      advisoryOnly: raw.advisory_only,
      capabilities: (raw.capabilities ?? []).map(normalize),
      notes: [],
    };
    return NextResponse.json(payload);
  } catch (error) {
    const detail =
      error instanceof ApiClientError
        ? `data-core respondeu ${error.status}`
        : "data-core inacessível";
    const payload: CapabilityRegistryPayload = {
      total: 0,
      kinds: {},
      advisoryOnly: true,
      capabilities: [],
      notes: [detail],
    };
    return NextResponse.json(payload, { status: 200 });
  }
}
