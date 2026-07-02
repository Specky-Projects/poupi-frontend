/**
 * Mission Control navigation model — the single source of truth for the
 * permanent sidebar. Each section maps to a route; Overview is the root.
 *
 * `live: true` means the screen is implemented and wired to real data.
 * Everything else renders the Phase-2 placeholder via `src/app/[section]`.
 * This keeps navigation honest: the sidebar never links to a screen that
 * silently shows nothing.
 */

export type NavItem = {
  slug: string;
  label: string;
  href: string;
  live: boolean;
  /** Primary backend/data source, for the placeholder and future wiring. */
  source?: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

const item = (
  slug: string,
  label: string,
  opts: { live?: boolean; source?: string } = {},
): NavItem => ({
  slug,
  label,
  href: slug === "overview" ? "/" : `/${slug}`,
  live: opts.live ?? false,
  source: opts.source,
});

/**
 * Phase 10.1 restructure: 23 flat items -> 11 domain-owned screens. Every
 * absorbed item below keeps working via a redirect in `next.config.ts`
 * (old slug -> new owning screen), so no bookmark breaks. See
 * `docs/PHASE_10_OPERATOR_EXPERIENCE_ARCHITECTURE.md` Etapa 2/9 for the
 * duplication findings this resolves. Where ownership was ambiguous
 * (Learning/Knowledge), the item is redirected but the underlying
 * source-of-truth question is explicitly left "Fase 0 audit pending" —
 * this sprint does not resolve it.
 */
export const NAV: NavGroup[] = [
  {
    title: "Command",
    items: [
      item("overview", "Executive Dashboard", { live: true, source: "poupi-crypto /admin/executive/status + capability-catalog" }),
      item("cockpit", "Operator Cockpit", {
        live: true,
        source: "compose: overview + infrastructure-health + capability-catalog (local); daily_brief/alerts pending event source",
      }),
    ],
  },
  {
    title: "Domains",
    items: [
      item("mirror", "Mirror", {
        live: true,
        source:
          "poupi-crypto kill_switch_routes /report (live, Fase 1) — Mirror core/Committee/Portfolio absorvidos aqui seguem Fase 0 (audit pending)",
      }),
      item("research", "Research", {
        source: "poupi-crypto research/omega (não catalogado, Fase 0 audit pending) — absorbe Scientific Pipeline",
      }),
      item("business-os", "Business OS", {
        source: "data-core business_os (Opportunities: Fase 1 audited) — absorbe Opportunity Discovery, Learning, Knowledge [Fase 0 audit pending: ownership de Learning/Knowledge]",
      }),
      item("poupi-baby", "Poupi Baby", {
        source: "poupi-baby (Fase 0 audit pending, runtime em standby) — absorbe SEO",
      }),
      item("universal-platform", "Universal Platform", {
        live: false,
        source: "data-core universal_platform /status (live) + daily-brief/alerts (blocked) — absorbe Affiliate",
      }),
      item("infrastructure", "Infrastructure", {
        source: "data-core /health, /ready (blocked em prod) — absorbe Deployments",
      }),
    ],
  },
  {
    title: "Platform",
    items: [
      item("timeline", "Timeline", {
        source: "data-core timeline/replay/explainability (Fase 0 audit pending) — absorbe Replay, Explainability",
      }),
      item("architecture", "Capabilities", { live: true, source: "data-core /capabilities" }),
      item("settings", "Settings"),
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV.flatMap((group) => group.items);

export function findNavItem(slug: string): NavItem | undefined {
  return NAV_ITEMS.find((entry) => entry.slug === slug);
}
