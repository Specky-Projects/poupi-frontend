/**
 * Capability Delivery Catalog — Mission Control's Source of Truth for the
 * *delivery status* of each capability (NOT domain logic). See
 * docs/CAPABILITY_DELIVERY_FRAMEWORK.md. This is the data behind the Capability
 * Dashboard and Roadmap; it tracks how far each capability has advanced through
 * the pipeline, never re-deriving any backend catalog.
 *
 * Entries are grounded in verified evidence only. A capability whose endpoint
 * shape has not yet been inspected is marked `phase: 0` (audit pending) rather
 * than assumed working.
 */

/** Implementation category — drives priority order (A first). */
export type CapabilityCategory = "A" | "B" | "C" | "D" | "E";

/** Highest pipeline phase fully completed (0 = audit pending … 7 = certified). */
export type DeliveryPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DeliveryStatus =
  | "live" // certified end-to-end with real data, in production or locally
  | "in_progress"
  | "audited" // Fase 0/1 done, not yet wired
  | "planned"
  | "blocked"; // implementation done, real-data certification gated (e.g. prod)

/** How much of the backend is reused vs. newly built. */
export type ReuseLevel = "full" | "adapter" | "extension" | "new";

export type ProductionStatus = "READY" | "BLOCKED" | "NOT_DEPLOYED";

export type CapabilityEntry = {
  id: string;
  name: string;
  /** Functional domain (single SoT). */
  domain: string;
  /** Backend owner of the SoT. */
  owner: string;
  project: "data-core" | "poupi-crypto" | "poupi-baby" | "mission-control";
  sourceOfTruth: string;
  /** Backend endpoint, or null if none exists yet. */
  endpoint: string | null;
  /** MC BFF route once built. */
  bffRoute: string | null;
  /** Normalized UI contract once built. */
  contract: string | null;
  /** Reusable data hook once built. */
  hook: string | null;
  /** Reusable widget once built. */
  widget: string | null;
  /** MC screen route once built. */
  screen: string | null;
  /** Test files that guard this capability's delivery stack. */
  tests: string[];
  category: CapabilityCategory;
  phase: DeliveryPhase;
  status: DeliveryStatus;
  reuse: ReuseLevel;
  production: ProductionStatus;
  dependencies: string[];
  /** Whether Fase 7 real-data certification has been achieved (never mocks). */
  certifiedRealData: boolean;
  notes: string;
};

export const CAPABILITY_CATALOG: CapabilityEntry[] = [
  {
    id: "architecture.capability-registry",
    name: "Architecture — Capability Registry",
    domain: "Architecture",
    owner: "capability_orchestrator",
    project: "data-core",
    sourceOfTruth: "CapabilityRegistry (business-os + universal-platform bootstraps)",
    endpoint: "GET /capabilities",
    bffRoute: "/api/capabilities",
    contract: "CapabilityRegistryPayload",
    hook: "useCapabilities",
    widget: "CapabilityRegistryWidget",
    screen: "/architecture",
    tests: ["src/lib/capability-catalog.test.ts", "src/lib/capability-standard.test.ts"],
    category: "A",
    phase: 7,
    status: "live",
    reuse: "full",
    production: "BLOCKED", // real endpoint verified locally; prod data-core not serving
    dependencies: [],
    certifiedRealData: true, // 46 real capabilities via local end-to-end cert
    notes:
      "Template canônico. Certificado end-to-end local com 46 capabilities reais (business-os 36 + universal-platform 10). Prod BLOCKED (Coolify).",
  },
  {
    id: "overview.executive-status",
    name: "Overview — Executive Status",
    domain: "Overview",
    owner: "certification (ProductionCertificationService)",
    project: "poupi-crypto",
    sourceOfTruth: "ProductionCertificationSnapshot",
    endpoint: "GET /api/v1/crypto/admin/executive/status",
    bffRoute: "/api/overview",
    contract: "OverviewPayload",
    hook: "useOverview",
    widget: "OverviewStatusWidget",
    screen: "/",
    tests: [
      "src/lib/overview-status.test.ts",
      "src/components/widgets/OverviewStatusWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "A",
    phase: 6,
    status: "blocked",
    reuse: "full",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false, // local cert green; real data needs prod DB snapshot
    notes:
      "Stack ADR-0002 completo e certificacao local verde (ok/degraded/NO_DATA/unavailable). Phase 9 prod cert BLOCKED: endpoints 65.109.239.250:8002/:8000, sslip hosts e localhost:8000 inacessiveis; nenhum snapshot real observavel.",
  },
  {
    id: "universal-platform.daily-brief",
    name: "Operator Cockpit — Daily Brief",
    domain: "Universal Platform",
    owner: "universal_platform (DailyBriefBuilder)",
    project: "data-core",
    sourceOfTruth: "DailyBriefBuilder.build()",
    endpoint: "GET /universal-platform/daily-brief",
    bffRoute: "/api/daily-brief",
    contract: "DailyBriefContract",
    hook: "useDailyBrief",
    widget: "DailyBriefWidget",
    screen: "/cockpit",
    tests: [
      "src/lib/daily-brief.test.ts",
      "src/components/widgets/DailyBriefWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "D",
    phase: 6,
    status: "blocked",
    reuse: "full",
    production: "BLOCKED",
    dependencies: ["universal-platform.runtime (event source)"],
    certifiedRealData: false,
    notes:
      "BFF+contract+hook+widget construídos e compostos em /cockpit (merged em main via b3037aa). Endpoint verificado 200 dentro do container prod (docker exec curl); mas o host público (dvq6dwsagsw4p4oqwuw7bak9.65.109.239.250.sslip.io) não responde de fora — mesma classe de bloqueio já registrada em overview.executive-status. Runtime ainda stateless: sem event source, brief bem-formado porém vazio (status 'empty', não erro).",
  },
  {
    id: "universal-platform.alerts",
    name: "Operator Cockpit — Alerts",
    domain: "Universal Platform",
    owner: "universal_platform (UnifiedAlertEngine)",
    project: "data-core",
    sourceOfTruth: "UnifiedAlertEngine.evaluate()",
    endpoint: "GET /universal-platform/alerts",
    bffRoute: "/api/alerts",
    contract: "AlertsContract",
    hook: "useAlerts",
    widget: "AlertsWidget",
    screen: "/cockpit",
    tests: [
      "src/lib/alerts.test.ts",
      "src/components/widgets/AlertsWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "D",
    phase: 6,
    status: "blocked",
    reuse: "full",
    production: "BLOCKED",
    dependencies: ["universal-platform.runtime (event source)"],
    certifiedRealData: false,
    notes: "Idem daily-brief: stack completo e composto em /cockpit; mesmo bloqueio de exposição pública; depende de event source para alertas não-vazios.",
  },
  {
    id: "universal-platform.status",
    name: "Universal Platform — Status",
    domain: "Universal Platform",
    owner: "universal_platform (Phase2Platform)",
    project: "data-core",
    sourceOfTruth: "Phase2Platform.status()",
    endpoint: "GET /universal-platform/status",
    bffRoute: "/api/platform-status",
    contract: "PlatformStatusContract",
    hook: "usePlatformStatus",
    widget: "PlatformStatusWidget",
    screen: "/architecture",
    tests: [
      "src/lib/platform-status.test.ts",
      "src/components/widgets/PlatformStatusWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "A",
    phase: 7,
    status: "live",
    reuse: "full",
    production: "BLOCKED", // certified locally with real data; prod data-core not serving
    dependencies: [],
    certifiedRealData: true, // end-to-end: ok (10 caps, 4 adapters) + unavailable degradation
    notes:
      "Entregue via pipeline Fase 1→7. PlatformStatusContract + BFF /api/platform-status + PlatformStatusWidget reutilizável, composto em /architecture. Cert local real: ok/degraded/unavailable (11 testes). Prod BLOCKED (Coolify).",
  },
  {
    id: "business-os.opportunities",
    name: "Opportunity Discovery — Poupi Baby",
    domain: "Business OS",
    owner: "business_os (PoupiBabyOpportunityBridge)",
    project: "data-core",
    sourceOfTruth: "JsonlOpportunityEvidenceRegistry (runtime_data/*.jsonl)",
    endpoint: "GET /business-os/poupi-baby/opportunities",
    bffRoute: null,
    contract: null,
    hook: null,
    widget: null,
    screen: null,
    tests: [],
    category: "A",
    phase: 1,
    status: "audited",
    reuse: "full",
    production: "BLOCKED",
    dependencies: ["poupi-baby runtime (standby)"],
    certifiedRealData: false,
    notes:
      "Endpoint pronto (auth). Store JSONL efêmero; Poupi Baby em standby → vazio esperado. Falha 'dados reais' até Baby emitir.",
  },
  {
    id: "portfolio.state",
    name: "Portfolio — State",
    domain: "Portfolio",
    owner: "portfolio",
    project: "poupi-crypto",
    sourceOfTruth: "portfolio_routes",
    endpoint: "portfolio_routes (shape audit pending)",
    bffRoute: null,
    contract: null,
    hook: null,
    widget: null,
    screen: null,
    tests: [],
    category: "B",
    phase: 0,
    status: "planned",
    reuse: "adapter",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false,
    notes: "Fase 0 pendente: inspecionar rotas/shape antes de qualquer contrato.",
  },
  {
    id: "mirror.state",
    name: "Mirror — State",
    domain: "Mirror",
    owner: "mirror",
    project: "poupi-crypto",
    sourceOfTruth: "mirror_v2_routes",
    endpoint: "mirror_v2_routes (shape audit pending)",
    bffRoute: null,
    contract: null,
    hook: null,
    widget: null,
    screen: null,
    tests: [],
    category: "C",
    phase: 0,
    status: "planned",
    reuse: "adapter",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false,
    notes: "Fase 0 pendente. Provável composição (modo/committee/portfolio/perf).",
  },
  {
    id: "committee.decisions",
    name: "Committee — Decisions",
    domain: "Committee",
    owner: "meta_committee",
    project: "poupi-crypto",
    sourceOfTruth: "meta_committee_routes",
    endpoint: "meta_committee_routes (shape audit pending)",
    bffRoute: null,
    contract: null,
    hook: null,
    widget: null,
    screen: null,
    tests: [],
    category: "B",
    phase: 0,
    status: "planned",
    reuse: "adapter",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false,
    notes: "Fase 0 pendente.",
  },
  {
    id: "kill-switch.state",
    name: "Kill Switch — State",
    domain: "Kill Switch",
    owner: "kill_switch",
    project: "poupi-crypto",
    sourceOfTruth: "kill_switch_routes (app/analytics/kill_switch_intelligence.py)",
    endpoint: "GET /api/v1/crypto/analytics/kill-switch/report",
    bffRoute: "/api/kill-switch",
    contract: "KillSwitchContract",
    hook: "useKillSwitch",
    widget: "KillSwitchWidget",
    screen: "/mirror",
    tests: [
      "src/lib/kill-switch.test.ts",
      "src/components/widgets/KillSwitchWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "B",
    phase: 6,
    status: "blocked",
    reuse: "adapter",
    production: "NOT_DEPLOYED",
    dependencies: [],
    certifiedRealData: false,
    notes:
      "Fase 0 concluída: /report compõe root_cause+edge_deterioration+recovery em uma chamada (sem precisar múltiplos endpoints). Stack completo (contrato+BFF+hook+widget+tela /mirror) implementado e testado com payloads mockados fiéis ao report_to_dict() real. dd_daily_pct/dd_weekly_pct/dd_monthly_pct/consecutive_losses são ecoados do request (default 0), não telemetria — não há endpoint de estado triggered/not-triggered ao vivo neste escopo; widget marca isso como Not Audited. Sem verificação contra poupi-crypto rodando (nenhum backend local disponível nesta sessão) e sem deploy — certificação de dado real pendente.",
  },
  {
    id: "infrastructure.health",
    name: "Infrastructure — Health / Readiness",
    domain: "Infrastructure",
    owner: "data-core observability",
    project: "data-core",
    sourceOfTruth: "GET /health, GET /ready",
    endpoint: "GET /health, GET /ready",
    bffRoute: "/api/infrastructure-health",
    contract: "HealthContract",
    hook: "useInfrastructureHealth",
    widget: "InfrastructureHealthWidget",
    screen: "/architecture",
    tests: [
      "src/lib/infrastructure-health.test.ts",
      "src/components/widgets/InfrastructureHealthWidget.test.tsx",
      "src/lib/capability-catalog.test.ts",
      "src/lib/capability-standard.test.ts",
    ],
    category: "A",
    phase: 6,
    status: "blocked",
    reuse: "full",
    production: "BLOCKED",
    dependencies: [],
    certifiedRealData: false,
    notes: "Endpoints existem; dado real exige serviço no ar (DB/Redis) — BLOCKED em prod.",
  },
];

/** Delivery-status summary for the Capability Dashboard header. */
export function catalogSummary(entries: CapabilityEntry[] = CAPABILITY_CATALOG) {
  const byStatus: Record<DeliveryStatus, number> = {
    live: 0,
    in_progress: 0,
    audited: 0,
    planned: 0,
    blocked: 0,
  };
  for (const e of entries) byStatus[e.status] += 1;
  return {
    total: entries.length,
    byStatus,
    certifiedRealData: entries.filter((e) => e.certifiedRealData).length,
  };
}
