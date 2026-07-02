/**
 * Executive Dashboard Domain Strip — pure derivation, zero new fetches.
 *
 * Combines two data sources that already exist:
 * - `CAPABILITY_CATALOG` (static, local): tells us whether a domain has any
 *   delivery-tracked capability at all, and how far it has progressed.
 * - `OverviewPayload.domains` (from `useOverview()`): poupi-crypto's real
 *   production certification signal, when available, for the domains it
 *   actually reports on (Mirror, Research, Infrastructure — see
 *   `overview-status.ts` DOMAIN_KEYS).
 *
 * A domain is never rendered as healthy unless one of these two sources
 * says so. No mock data, no optimistic defaults.
 */

import { CAPABILITY_CATALOG, type CapabilityEntry } from "@/lib/capability-catalog";
import type { OperationalStatus, OverviewPayload } from "@/lib/contracts";

export type DomainStripStatus = "LIVE" | "BLOCKED" | "PLANNED" | "NO_DATA";

export type DomainStripItem = {
  key: string;
  label: string;
  href: string;
  /** `CapabilityEntry.domain` values that belong to this tile. */
  catalogDomains: string[];
  /** Matching key in `OverviewPayload.domains`, if poupi-crypto reports on it directly. */
  overviewDomain?: string;
};

/** Order matches the Phase 10.1 spec's "Domínios obrigatórios" list. */
export const DOMAIN_STRIP_ITEMS: DomainStripItem[] = [
  { key: "mirror", label: "Mirror", href: "/mirror", catalogDomains: ["Mirror", "Committee", "Kill Switch", "Portfolio"], overviewDomain: "Mirror" },
  { key: "research", label: "Research", href: "/research", catalogDomains: [], overviewDomain: "Research" },
  { key: "business-os", label: "Business OS", href: "/business-os", catalogDomains: ["Business OS"] },
  { key: "poupi-baby", label: "Poupi Baby", href: "/poupi-baby", catalogDomains: [] },
  { key: "universal-platform", label: "Universal Platform", href: "/universal-platform", catalogDomains: ["Universal Platform"] },
  { key: "infrastructure", label: "Infrastructure", href: "/infrastructure", catalogDomains: ["Infrastructure"], overviewDomain: "Infrastructure" },
  { key: "architecture", label: "Architecture", href: "/architecture", catalogDomains: ["Architecture"] },
  { key: "overview", label: "Overview", href: "/", catalogDomains: ["Overview"] },
];

function catalogRollup(domains: string[], catalog: CapabilityEntry[]): DomainStripStatus | "EMPTY" {
  const entries = catalog.filter((c) => domains.includes(c.domain));
  if (entries.length === 0) return "EMPTY";
  if (entries.some((e) => e.status === "live")) return "LIVE";
  if (entries.some((e) => e.status === "blocked")) return "BLOCKED";
  return "PLANNED";
}

function fromOperationalStatus(status: OperationalStatus): DomainStripStatus | null {
  switch (status) {
    case "READY":
    case "READY_WITH_OBSERVATIONS":
      return "LIVE";
    case "NOT_READY":
      return "BLOCKED";
    case "NOT_AVAILABLE":
    case "NO_DATA":
      return null; // no real signal — fall back to the catalog
  }
}

/**
 * Resolves one Domain Strip tile's status. Priority:
 * 1. A real per-domain signal from `useOverview()` (poupi-crypto certification), when present.
 * 2. The "Overview" tile falls back to `overview.overall` (the global rollup) instead of a domain match.
 * 3. Otherwise, the local delivery catalog's rollup for that domain.
 * 4. No catalog entries and no live signal → NO_DATA.
 */
export function computeDomainStripStatus(
  item: DomainStripItem,
  overview: OverviewPayload | null,
  catalog: CapabilityEntry[] = CAPABILITY_CATALOG,
): DomainStripStatus {
  if (item.overviewDomain && overview) {
    const match = overview.domains.find((d) => d.domain === item.overviewDomain);
    if (match) {
      const fromSignal = fromOperationalStatus(match.status);
      if (fromSignal) return fromSignal;
    }
  }

  if (item.key === "overview" && overview) {
    const fromSignal = fromOperationalStatus(overview.overall);
    if (fromSignal) return fromSignal;
  }

  const rollup = catalogRollup(item.catalogDomains, catalog);
  return rollup === "EMPTY" ? "NO_DATA" : rollup;
}

export type DomainStripTile = {
  item: DomainStripItem;
  status: DomainStripStatus;
  capabilityCount: number;
};

export function buildDomainStrip(
  overview: OverviewPayload | null,
  catalog: CapabilityEntry[] = CAPABILITY_CATALOG,
): DomainStripTile[] {
  return DOMAIN_STRIP_ITEMS.map((item) => ({
    item,
    status: computeDomainStripStatus(item, overview, catalog),
    capabilityCount: catalog.filter((c) => item.catalogDomains.includes(c.domain)).length,
  }));
}
