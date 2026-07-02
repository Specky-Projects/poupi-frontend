# Capability Audit and Roadmap - 2026-07-02

SoT of delivery status: `src/lib/capability-catalog.ts`. This document is the
human-readable roadmap generated from that catalog and the current code audit.
Governance references: `ADR-0002`, `CAPABILITY_DELIVERY_FRAMEWORK.md`, and
`src/lib/capability-catalog.ts`.

## Capability Audit

| Capability ID | Capability | SoT | Category | Backend existing | Contract | BFF | Hook | Widget | Screen | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| `architecture.capability-registry` | Architecture - Capability Registry | CapabilityRegistry | A | `GET /capabilities` | `CapabilityRegistryPayload` | `/api/capabilities` | `useCapabilities` | `CapabilityRegistryWidget` | `/architecture` | live, Fase 7 |
| `universal-platform.status` | Universal Platform - Status | `Phase2Platform.status()` | A | `GET /universal-platform/status` | `PlatformStatusContract` | `/api/platform-status` | `usePlatformStatus` | `PlatformStatusWidget` | `/architecture` | live, Fase 7 |
| `overview.executive-status` | Overview - Executive Status | `ProductionCertificationSnapshot` | A | `GET /api/v1/crypto/admin/executive/status` | `OverviewPayload` | `/api/overview` | `useOverview` | `OverviewStatusWidget` | `/` | blocked, Fase 6 |
| `business-os.opportunities` | Opportunity Discovery - Poupi Baby | `JsonlOpportunityEvidenceRegistry` | A | `GET /business-os/poupi-baby/opportunities` | not built | not built | not built | not built | not built | audited, Fase 1 |
| `infrastructure.health` | Infrastructure - Health / Readiness | `GET /health`, `GET /ready` | A | yes | `HealthContract` | `/api/infrastructure-health` | `useInfrastructureHealth` | `InfrastructureHealthWidget` | `/architecture` | blocked, Fase 6 |
| `universal-platform.daily-brief` | Operator Cockpit - Daily Brief | `DailyBriefBuilder.build()` | D | route not deployed | not built | not built | not built | not built | not built | blocked, Fase 2 |
| `universal-platform.alerts` | Operator Cockpit - Alerts | `UnifiedAlertEngine.evaluate()` | D | route not deployed | not built | not built | not built | not built | not built | blocked, Fase 2 |
| `portfolio.state` | Portfolio - State | `portfolio_routes` | B | shape audit pending | not built | not built | not built | not built | not built | planned, Fase 0 |
| `mirror.state` | Mirror - State | `mirror_v2_routes` | C | shape audit pending | not built | not built | not built | not built | not built | planned, Fase 0 |
| `committee.decisions` | Committee - Decisions | `meta_committee_routes` | B | shape audit pending | not built | not built | not built | not built | not built | planned, Fase 0 |
| `kill-switch.state` | Kill Switch - State | `kill_switch_routes` | B | shape audit pending | not built | not built | not built | not built | not built | planned, Fase 0 |

## Reuse Metrics

Catalog size: 11 capabilities.

| Reuse class | Count | Percent |
|---|---:|---:|
| Full backend reuse | 5 | 45.5% |
| Backend extension only | 2 | 18.2% |
| Adapter required | 4 | 36.4% |
| New backend capability | 0 | 0.0% |

No roadmap item currently requires a new backend capability. Architectural reuse
coverage is therefore 100% under the ladder `REUSE -> EXTEND -> GENERALIZE ->
CREATE NEW`.

Implemented Mission Control stacks with contract+BFF+hook+widget+screen: 3 of 3
implemented UI capabilities (100%).

## Conformance Audit

| Check | Result |
|---|---|
| Any capability accesses backend directly from UI? | No. Backend clients are confined to `src/app/api/*` and `src/lib/backends.ts`. |
| Any widget has operational/backend logic? | No. Widgets receive contracts as props. |
| Any screen fetches directly? | No. Screens compose hooks and widgets only. |
| Any duplicated contract found? | No duplicate normalized contract identified. |
| Any duplicated BFF found? | No duplicated BFF route identified. |
| Any BFF bypass found? | No. Hooks call local `/api/*` routes only. |

The conformance checks are guarded by `src/lib/capability-standard.test.ts`.

## Updated Roadmap

Objective order uses: lowest effort -> highest reuse -> lowest risk -> highest
impact -> satisfied dependencies.

### Tier 1 - Complete local certification already achieved

1. `architecture.capability-registry` - live, Fase 7.
2. `universal-platform.status` - live, Fase 7.

### Tier 2 - Production certification blocked

3. `overview.executive-status` - already has contract, BFF, hook, widget,
   screen, and local certification for ok/degraded/NO_DATA/unavailable. It is
   blocked only by real production snapshot availability. Phase 9 probe:
   `65.109.239.250:8002`, `65.109.239.250:8000`, known `sslip.io` hosts, and
   `localhost:8000` were unreachable, so it cannot be promoted to live.

### Tier 3 - Next implementable after certification gates

4. `infrastructure.health` - Category A, stack ADR-0002 delivered locally.
   Blocked only on service availability for real-data certification.
5. `business-os.opportunities` - Category A and endpoint exists, but useful data
   depends on Poupi Baby runtime emission.

### Tier 4 - Requires deployed extension / event source

6. `universal-platform.daily-brief`
7. `universal-platform.alerts`

Both depend on the read-only data-core routes and an event source. They must not
invent stored state in Mission Control.

### Tier 5 - Fase 0 audit pending

8. `committee.decisions`
9. `kill-switch.state`
10. `portfolio.state`
11. `mirror.state`

These require endpoint and payload inspection before any contract is created.

## Objective Next Capability

The next implementable capability is **Opportunity Discovery - Poupi Baby** if
data-core remains unavailable for real infrastructure certification.

Evidence:

- `overview.executive-status` remains blocked by unavailable production/equivalent runtime evidence.
- `infrastructure.health` now has contract, BFF, hook, widget, screen, tests,
  and local certification. Real certification is gated by data-core availability.
- `business-os.opportunities` is the next remaining Category A implementation
  target, but useful real data depends on Poupi Baby runtime emissions.
