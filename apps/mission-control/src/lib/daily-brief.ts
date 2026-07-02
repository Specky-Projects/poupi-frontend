import type { DailyBriefContract, DailyBriefSection } from "@/lib/contracts";

/**
 * Pure normalization for the universal-platform.daily-brief capability. Kept
 * separate from the route handler so it can be unit-tested without importing
 * next/server. No business logic — only field renaming; the brief content
 * itself is produced entirely by DailyBriefBuilder.build() on the backend.
 */

/**
 * Raw shape of data-core GET /universal-platform/daily-brief
 * (DailyBriefBuilder.build().as_dict(), wrapped by the router). When the
 * platform failed to boot the payload is
 * `{ initialized: false, advisory_only: true, sections: [], scientific_health: 0.0 }`.
 */
export type DailyBriefRaw = {
  initialized?: boolean;
  advisory_only?: boolean;
  brief_id?: string;
  generated_at?: string;
  scientific_health?: number;
  sections?: DailyBriefSection[];
  error?: string;
};

/**
 * The "Scientific Health" section always carries a real `observations` count
 * (DailyBriefBuilder._scientific_health), unlike other sections which fall
 * back to placeholder lines like "No activity observed." / "None observed."
 * even when empty — those placeholders would otherwise be misread as
 * activity.
 */
function hasActivity(sections: DailyBriefSection[]): boolean {
  const health = sections.find((s) => s.title === "Scientific Health");
  const observations = health?.metrics?.observations;
  return typeof observations === "number" && observations > 0;
}

/** Normalize a reachable payload into the contract. */
export function normalizeDailyBrief(raw: DailyBriefRaw, fetchedAt: string): DailyBriefContract {
  const initialized = Boolean(raw.initialized);
  const sections = raw.sections ?? [];
  const notes: string[] = [];

  if (!initialized) {
    notes.push(raw.error ? `daily brief não inicializou: ${raw.error}` : "daily brief não inicializou");
  } else if (!hasActivity(sections)) {
    notes.push("runtime sem event source — brief bem-formado, sem atividade observada");
  }

  return {
    status: !initialized ? "unavailable" : hasActivity(sections) ? "ok" : "empty",
    initialized,
    briefId: raw.brief_id ?? null,
    generatedAt: raw.generated_at || null,
    scientificHealth: typeof raw.scientific_health === "number" ? raw.scientific_health : null,
    sections,
    fetchedAt,
    notes,
    error: raw.error ?? null,
  };
}

/** Contract for the unreachable/errored case (data-core itself unreachable). */
export function unavailableDailyBrief(detail: string, fetchedAt: string): DailyBriefContract {
  return {
    status: "unavailable",
    initialized: false,
    briefId: null,
    generatedAt: null,
    scientificHealth: null,
    sections: [],
    fetchedAt,
    notes: [detail],
    error: detail,
  };
}
