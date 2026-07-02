# Phase 10 — Operator Experience Architecture

Status: **DESIGN ONLY — not implemented.** No code, backend, endpoint, screen,
or widget was created by this phase. Every artifact below is either a reuse
of code that already exists (see file paths cited throughout) or an explicit
"Fase 0 audit pending" placeholder, consistent with the existing capability
catalog (`src/lib/capability-catalog.ts`) and `CAPABILITY_AUDIT_AND_ROADMAP.md`.

Governing question for every decision in this document:

> **"Se eu abrir o Mission Control às 8h da manhã, quais informações preciso
> ver primeiro para operar todo o ecossistema?"**

---

## 0. Ground truth (audit summary)

Full audit performed against the actual codebase on 2026-07-02. Source of
truth: `src/lib/capability-catalog.ts`, `src/lib/nav.ts`,
`src/app/**`, `src/components/widgets/**`.

- **11** capabilities cataloged. **2 live** (`architecture.capability-registry`,
  `universal-platform.status`), **1 audited-but-empty**
  (`business-os.opportunities`), **3 blocked** on infra/prod, **5 planned**
  (Fase 0 pending: Mirror, Committee, Kill Switch, Portfolio).
- **4 data widgets exist**: `OverviewStatusWidget`, `PlatformStatusWidget`,
  `InfrastructureHealthWidget`, `CapabilityRegistryWidget`. **2 primitives**:
  `StatusChip`, `HealthBadge`.
- **4 BFF routes exist**, all thin adapters (fetch → normalize → degrade to
  200 with notes): `/api/overview`, `/api/capabilities`,
  `/api/platform-status`, `/api/infrastructure-health`.
- **4 hooks exist**: `useOverview`, `useCapabilities`, `usePlatformStatus`,
  `useInfrastructureHealth` — identical `{data, error, loading, refresh?}`
  shape, all client-side, all polling every 30s except `useCapabilities`.
- **Nav has 23 items across 4 groups; only 2 are `live: true`.** Every other
  item renders the existing honest placeholder (`src/app/[section]/page.tsx`)
  showing the intended data source. Nothing silently shows empty data.
- **Zero UI for Timeline, Replay, Explainability, Mirror, Committee, Kill
  Switch, Portfolio, Research (non-scientific), Poupi Baby.** Backend modules
  for Timeline/Replay/Explainability already exist in `data-core`
  (`app/observation/timeline.py`, `app/execution_runtime/replay.py`,
  `app/scientific_consumers/explainability_binding.py`) but are **not
  exposed as capabilities** — no endpoint audit, no BFF, no contract.

This audit is the REUSE inventory required before Etapa 2. Nothing below
invents a capability, widget, or backend call that doesn't already exist or
isn't explicitly marked "Fase 0 pending" in the existing framework.

---

## Etapa 1 — Inventário por domínio

| Domínio | Sub-áreas (per mission brief) | Capabilities hoje | Estado |
|---|---|---|---|
| **Overview / Command** | Executive status | `overview.executive-status` | live (Fase 6, prod BLOCKED) |
| **Mirror** | State, Committee, Kill Switch, Portfolio, Replay, Explainability | `mirror.state`, `committee.decisions`, `kill-switch.state`, `portfolio.state` | all Fase 0 (planned) |
| **Research** | Hypotheses, Experiments, Rankings, Evidence, Confidence | none in catalog; nav stubs `/research`, `/scientific` overlap | not audited |
| **Business OS** | Opportunities, Projects, Learning, Knowledge, Timeline | `business-os.opportunities` (Fase 1, audited, empty — Baby standby) | Projects/Learning/Knowledge/Timeline not audited |
| **Universal Platform** | Daily Brief, Alerts, Health, Status | `universal-platform.status` (live), `.daily-brief` + `.alerts` (Fase 2, blocked — no event source) | partial |
| **Poupi Baby** | Offers, Reviewer, Publications, Affiliate, CTR, Revenue | none direct; only referenced as bridge inside `business-os.opportunities` | not audited; Baby in STANDBY ([[poupi_baby_standby]]) |
| **Infrastructure** | Health, Readiness, Deployments | `infrastructure.health` (Fase 6, blocked — needs live DB/Redis) | Deployments not audited |
| **Architecture / Capabilities** | Registry | `architecture.capability-registry` (live, Fase 7) | live |

**Finding:** of 8 mission-brief domains, only **Overview**, **Universal
Platform**, **Infrastructure**, and **Architecture** have any certified
capability. Mirror, Research, Business OS (beyond one bridge), and Poupi
Baby have **no UI today** — the architecture below must represent that
honestly, not paper over it with placeholder widgets that look real.

---

## Etapa 2 — Arquitetura de Navegação

### Current state (as-built, `src/lib/nav.ts`)

4 groups, 23 items, 2 `live: true`. Two duplication problems already visible
in the source:

- `/research` (source: `poupi-crypto research`) and `/scientific` (source:
  `poupi-crypto research/omega`) point at overlapping data — two nav items
  for one domain.
- `/opportunity-discovery` (source: `data-core business_os poupi-baby
  opportunities`) **is** the capability `business-os.opportunities` — it's
  a Business OS sub-area promoted to a top-level nav item, duplicating
  `/business-os`.
- `/universal-learning` (source: `poupi-crypto learning`) and
  `/knowledge-graph` (source: `poupi-crypto knowledge`) map directly to the
  mission brief's **Business OS → Learning / Knowledge** sub-areas, but live
  in the "Business" group pointing at a different backend (`poupi-crypto`
  instead of `data-core business_os`) than `business-os.opportunities`. This
  is a source-of-truth mismatch, not just a nav grouping issue — flagged for
  Fase 0 audit, not resolved here.
- `/seo` and `/affiliate` are Poupi Baby / Universal Platform concerns
  (`AffiliateAdapter` lives in `universal_platform`) but sit in "Business" —
  ownership doesn't match backend.

### Proposed navigation (design only — not wired)

Reduces 23 flat items to **11 top-level screens**, each an owner of a
domain, with sub-tabs replacing what are today separate nav entries. No
existing `live` screen moves or is renamed in a way that breaks its route;
`/architecture` keeps working during migration (see UX Roadmap).

```
Mission Control
├── Executive Dashboard        (/)                    [LIVE — reuse]
├── Operator Cockpit           (/cockpit)              [COMPOSE — new screen, reused widgets]
├── Mirror                     (/mirror)               [Fase 0 pending]
│   ├── State
│   ├── Committee
│   ├── Kill Switch
│   └── Portfolio
├── Research                   (/research)             [Fase 0 pending — merges /research + /scientific]
│   ├── Scientific Pipeline (Omega)
│   ├── Hypotheses / Experiments / Rankings / Evidence / Confidence
├── Business OS                (/business-os)          [PARTIAL — 1 capability audited]
│   ├── Opportunities                                  (was /opportunity-discovery)
│   ├── Projects
│   ├── Learning                                       (was /universal-learning — needs SoT audit)
│   └── Knowledge                                      (was /knowledge-graph — needs SoT audit)
├── Poupi Baby                 (/poupi-baby)           [Fase 0 pending]
│   ├── Offers / Reviewer / Publications
│   └── Affiliate / CTR / Revenue                      (was /seo, /affiliate)
├── Universal Platform         (/universal-platform)   [PARTIAL — 1/3 capabilities live]
│   ├── Status                                         [LIVE — reuse]
│   ├── Daily Brief                                    [BLOCKED — no event source]
│   └── Alerts                                         [BLOCKED — no event source]
├── Infrastructure             (/infrastructure)       [PARTIAL — health live as widget, no screen yet]
│   ├── Health / Readiness                             [LIVE widget — reuse]
│   └── Deployments                                    [not audited]
├── Timeline                   (/timeline)             [Fase 0 pending — merges /timeline + /replay + /explainability]
├── Capabilities                (/architecture)        [LIVE — EXTEND existing]
└── Settings                   (/settings)             [utility, no capability]
```

Net effect: **11 primary nav items instead of 23**, zero loss of coverage
(every removed item becomes a tab inside its true domain owner), and every
duplication identified above is resolved by merge rather than deletion.

---

## Etapa 3 — Executive Dashboard (Home)

**Goal:** answer in <5s: is everything working? incident? Mirror up? Research
healthy? Business OS receiving data? Poupi Baby publishing? urgent action?

**Rule applied:** only reuse existing widgets. Where a domain has no
capability yet, the screen must say so honestly — it reuses the *existing*
`SectionPage` placeholder pattern (`src/app/[section]/page.tsx`), not a new
fake-healthy widget.

```
┌─────────────────────────────────────────────────────────────────┐
│  EXECUTIVE DASHBOARD                              [auto-refresh]│
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────┐  ┌────────────────────────────┐ │
│  │ OverviewStatusWidget       │  │ InfrastructureHealthWidget  │ │
│  │ (reuse, /api/overview)     │  │ (reuse, /api/infra-health)  │ │
│  │ Health score + domain grid │  │ health/ready/checks/blockers│ │
│  └───────────────────────────┘  └────────────────────────────┘ │
│  ┌───────────────────────────┐  ┌────────────────────────────┐ │
│  │ PlatformStatusWidget       │  │ CapabilityRegistryWidget    │ │
│  │ (reuse, /api/platform-     │  │ (reuse, /api/capabilities)  │ │
│  │  status)                   │  │  — summarized: live/blocked/│ │
│  │ ok/degraded/unavailable    │  │  planned counts             │ │
│  └───────────────────────────┘  └────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  DOMAIN STRIP (one honest tile per mission-brief domain)         │
│  [Mirror: NO_DATA]  [Research: NO_DATA]  [Business OS: NO_DATA*] │
│  [Poupi Baby: NO_DATA]                                           │
│  * business-os.opportunities audited but empty (Baby standby)    │
│  Each tile reuses StatusChip; NO_DATA links to the domain screen │
│  placeholder — never fabricates a fake "healthy" state.          │
└─────────────────────────────────────────────────────────────────┘
```

Nothing new is built here except the **Domain Strip**, which is a client-side
composition (COMPOSE, not CREATE) over data already returned by
`useOverview()` (its `domains: DomainHealth[]` field already carries this
per-domain shape) plus `useCapabilities()` to detect which domains have zero
catalog entries. Zero new backend calls.

---

## Etapa 4 — Operator Cockpit

Order fixed by the mission brief. Each row states its reuse tier.

```
┌─────────────────────────────────────────────────────────────────┐
│ MISSION SUMMARY        → OverviewStatusWidget            [REUSE] │
├─────────────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE HEALTH  → InfrastructureHealthWidget       [REUSE]│
├─────────────────────────────────────────────────────────────────┤
│ PRODUCTION CERTIFICATION → filtered CapabilityRegistryWidget     │
│   (client-side filter: phase >= 6)                       [COMPOSE]│
├─────────────────────────────────────────────────────────────────┤
│ DAILY BRIEF            → placeholder (universal-platform.        │
│   daily-brief, Fase 2, BLOCKED — no event source)      [PLACEHOLDER]│
├─────────────────────────────────────────────────────────────────┤
│ CRITICAL ALERTS         → placeholder (universal-platform.       │
│   alerts, Fase 2, BLOCKED)                              [PLACEHOLDER]│
├─────────────────────────────────────────────────────────────────┤
│ CURRENT INCIDENT        → derived from OverviewPayload.domains   │
│   where status ∈ {NOT_READY, NOT_AVAILABLE}              [COMPOSE]│
├─────────────────────────────────────────────────────────────────┤
│ PENDING ACTIONS         → derived from useCapabilities() where   │
│   status ∈ {blocked, planned}, grouped by domain          [COMPOSE]│
├─────────────────────────────────────────────────────────────────┤
│ MIRROR                  → placeholder (Fase 0 pending)  [PLACEHOLDER]│
│ RESEARCH                → placeholder (Fase 0 pending)  [PLACEHOLDER]│
│ BUSINESS OS              → placeholder + opportunities   [PARTIAL]│
│ POUPI BABY               → placeholder (Fase 0 pending) [PLACEHOLDER]│
└─────────────────────────────────────────────────────────────────┘
```

"COMPOSE" rows read data already fetched by existing hooks
(`useOverview`, `useCapabilities`) and re-render it in a new shape client-side
— **no new BFF route, no new backend logic**, consistent with the
prohibition on new endpoints for this phase.

---

## Etapa 5 — Global Timeline

Backend already exists and is unexposed:

- `data-core/app/observation/timeline.py`
- `data-core/app/execution_runtime/replay.py`
- `data-core/app/operational_truth/analyzers/replayability.py`
- `data-core/app/scientific_consumers/explainability_binding.py`

Per the mission's own prohibition ("não implementar persistência nova"; "não
criar backend novo... endpoints novos sem necessidade"), Timeline is **not**
built in this phase. It is catalogued the same way `mirror.state` /
`committee.decisions` already are: **Fase 0 audit pending.** The design
below is the target shape once that audit runs — it does not authorize
building it now.

```
┌─────────────────────────────────────────────────────────────────┐
│ GLOBAL TIMELINE  (single scroll, filterable by stage)             │
├─────────────────────────────────────────────────────────────────┤
│ ● Mirror Signal → ● Committee → ● Decision → ● Preview →          │
│ ● Execution → ● Replay → ● Learning → ● Business OS →             │
│ ● Mission Control → ● Operator                                    │
│                                                                     │
│ [Filter: All | Replay only | Explainability only]                 │
│ Replay and Explainability become FILTERS on one timeline, not      │
│ separate screens — resolves the /timeline vs /replay vs            │
│ /explainability duplication found in current nav.ts.               │
└─────────────────────────────────────────────────────────────────┘
```

One event stream, one BFF (future), one hook, one widget — not three
screens. This consolidation is itself a UX-audit finding (see Etapa 9).

---

## Etapa 6 — Project Health

Derived **entirely** from `capability-catalog.ts` grouped by `domain`/owner
— zero new backend. This is a pure aggregation the frontend can already
compute from `useCapabilities()`.

```
┌─────────────────────────────────────────────────────────────────┐
│ PROJECT           PHASE   PROD   CERT   BLOCKERS         PROGRESS│
├─────────────────────────────────────────────────────────────────┤
│ Architecture       7      BLOCKED live   Coolify           ████████│
│ Universal Platform 2-7    BLOCKED mixed  event source,     ██████░░│
│                                          Coolify                  │
│ Overview            6      BLOCKED blocked prod snapshot    ███████░│
│ Business OS         0-1    BLOCKED audited Baby standby     ██░░░░░░│
│ Infrastructure      6      BLOCKED blocked DB/Redis live    ███████░│
│ Mirror              0      —       planned Fase 0 audit     ░░░░░░░░│
│ Research            —      —       —       not catalogued   ░░░░░░░░│
│ Poupi Baby          —      —       —       not catalogued   ░░░░░░░░│
└─────────────────────────────────────────────────────────────────┘
```

Progress bar = `phase / 7`. Rows with no catalog entry render as `—`, never
a fabricated phase.

---

## Etapa 7 — Capability Explorer

**EXTEND** (not create) `CapabilityRegistryWidget` and `/architecture` into
a dedicated, filterable screen. Every column below is already a field on
`Capability`/catalog entries per the ground-truth audit — nothing is new
data, only new presentation.

```
┌─────────────────────────────────────────────────────────────────┐
│ CAPABILITY EXPLORER          [filter: phase | status | owner]     │
├─────────────────────────────────────────────────────────────────┤
│ ID │ Name │ Owner │ Endpoint │ SoT │ Deps │ Consumers │ Phase │   │
│    │      │       │          │     │      │           │Status │Cert│
├─────────────────────────────────────────────────────────────────┤
│ (rows = capability-catalog.ts entries, drill-down → detail panel) │
└─────────────────────────────────────────────────────────────────┘
```

Replaces the current flat "grouped by kind" rendering with sortable/
filterable table + detail drawer. Same data source (`/api/capabilities`),
same hook (`useCapabilities`).

---

## Etapa 8 — Roadmap Visual

Same source as Etapa 6/7, pivoted by phase instead of domain — a Kanban with
columns `Fase 0` → `Fase 7`, cards = capabilities, card shows blockers/deps/
reuse class (already present in `capability-catalog.ts`: `full` / `extension`
/ `adapter`). Generated, never hand-maintained — this directly replaces the
manual table in `CAPABILITY_AUDIT_AND_ROADMAP.md` with a live view once
built (that doc remains the human-readable snapshot in the meantime).

---

## Etapa 9 — UX Audit

**Duplicated information / redundant screens found in current `nav.ts`:**

1. `/research` and `/scientific` — same backend family (`poupi-crypto
   research` vs `research/omega`), two nav entries. **Merge into
   `/research` with a Scientific Pipeline tab.**
2. `/timeline`, `/replay`, `/explainability` — three nav stubs for what the
   mission brief itself describes as one causal chain. **Merge into one
   Timeline screen with stage filters** (Etapa 5).
3. `/opportunity-discovery` duplicates `business-os.opportunities`, which
   already belongs under `/business-os`. **Fold in as a tab.**
4. `/universal-learning` and `/knowledge-graph` reference `poupi-crypto`
   as source but conceptually match Business OS's own Learning/Knowledge
   sub-areas (per mission brief), which are `data-core business_os`-owned.
   **Source mismatch — do not merge blindly; flag for Fase 0 audit to
   determine actual owner before assigning a tab.**
5. `/seo` and `/affiliate` sit under "Business" but their backends
   (`poupi-baby`, `universal_platform.AffiliateAdapter`) belong to Poupi
   Baby and Universal Platform respectively. **Split: `/seo` →  Poupi Baby
   tab; `/affiliate` → Universal Platform tab (it's an adapter of that
   platform, not a Business OS concern).**
6. `/infrastructure` and `/deployments` are both infra concerns with no
   catalog entry for deployments. **Merge as tabs under `/infrastructure`.**
7. `/audit` and `/analytics` have no capability backing and unclear source
   ownership. **Do not place in primary nav** until a Fase 0 audit assigns
   them a real backend — currently they're speculative, violating "nunca
   catálogo manual."

**Can the operator find everything quickly?** Not today — 23 flat items
with no grouping-by-domain and 21 of them dead-ending in an identical
placeholder is worse than fewer, tab-structured screens. The proposed
11-item structure fixes this without deleting any planned capability.

**Does navigation follow operational logic?** The current 4 groups
("Command / Trading Intelligence / Business / Platform") mix ownership
groupings with operational-flow groupings. The proposed structure groups by
**domain ownership** (Mirror owns Mirror+Committee+Kill Switch+Portfolio;
Universal Platform owns Daily Brief+Alerts+Status+Affiliate) which matches
how capabilities are actually catalogued (`domain` field), so Capability
Explorer and nav stay in sync automatically instead of drifting.

---

## Deliverable 3 — Widget Inventory

| Widget | Capability | Reutilizado | Tela(s) |
|---|---|---|---|
| `OverviewStatusWidget` | `overview.executive-status` | yes (existing) | Executive Dashboard, Operator Cockpit (Mission Summary) |
| `InfrastructureHealthWidget` | `infrastructure.health` | yes (existing) | Executive Dashboard, Operator Cockpit, Infrastructure |
| `PlatformStatusWidget` | `universal-platform.status` | yes (existing) | Executive Dashboard, Universal Platform |
| `CapabilityRegistryWidget` | `architecture.capability-registry` | yes (existing); EXTEND for Capability Explorer | Executive Dashboard (summarized), Capabilities |
| `StatusChip` | (primitive) | yes (existing) | Executive Dashboard Domain Strip, all placeholders |
| `HealthBadge` | (primitive) | yes (existing) | Executive Dashboard, Operator Cockpit |
| Domain Strip | derived (COMPOSE over `useOverview`+`useCapabilities`) | derived, no new fetch | Executive Dashboard |
| Production Certification panel | derived (COMPOSE, phase≥6 filter) | derived, no new fetch | Operator Cockpit |
| Current Incident banner | derived (COMPOSE over `OverviewPayload.domains`) | derived, no new fetch | Operator Cockpit |
| Pending Actions list | derived (COMPOSE over `useCapabilities` status filter) | derived, no new fetch | Operator Cockpit |
| Project Health panel | derived (COMPOSE, group by domain) | derived, no new fetch | Project Health |
| Roadmap Kanban | derived (COMPOSE, group by phase) | derived, no new fetch | Roadmap |
| `SectionPage` placeholder | n/a (existing honest-empty pattern) | yes (existing) | every not-yet-live screen |

## Deliverable 4 — Screen Inventory

| Tela | Widgets | Capabilities | Backend |
|---|---|---|---|
| Executive Dashboard (`/`) | Overview, Infra Health, Platform Status, Capability Registry (summary), Domain Strip | overview.executive-status, infrastructure.health, universal-platform.status, architecture.capability-registry | data-core, poupi-crypto |
| Operator Cockpit (`/cockpit`) | Overview, Infra Health, Cert panel, Incident banner, Pending Actions, + 4 domain placeholders | same as above (composed) + daily-brief/alerts (blocked) | data-core, poupi-crypto |
| Mirror (`/mirror`) | `SectionPage` placeholder ×4 tabs | mirror.state, committee.decisions, kill-switch.state, portfolio.state | poupi-crypto (Fase 0) |
| Research (`/research`) | `SectionPage` placeholder | not catalogued | poupi-crypto (not audited) |
| Business OS (`/business-os`) | `SectionPage` placeholder + Opportunities bridge | business-os.opportunities | data-core |
| Poupi Baby (`/poupi-baby`) | `SectionPage` placeholder ×2 tabs | none | poupi-baby (Fase 0) |
| Universal Platform (`/universal-platform`) | Platform Status (live) + 2 placeholders | universal-platform.status/.daily-brief/.alerts | data-core |
| Infrastructure (`/infrastructure`) | Infra Health (live) + Deployments placeholder | infrastructure.health | data-core |
| Timeline (`/timeline`) | placeholder (Fase 0) | none yet | data-core (unexposed) |
| Capabilities (`/architecture`) | Capability Registry (extended: table + drill-down), Project Health, Roadmap Kanban | architecture.capability-registry | data-core |
| Settings (`/settings`) | none (utility) | n/a | n/a |

---

## Deliverable 5 — UX Roadmap

Priority order: maior reutilização → maior valor operacional → menor
esforço → menor risco.

1. **Executive Dashboard build-out (Domain Strip)** — pure composition over
   existing hooks, zero new backend. Highest reuse, immediate operator value
   (honest "what's dark" view). *Effort: low. Risk: none.*
2. **Nav restructure (23→11 items, tab-based)** — no backend change, pure
   `nav.ts` + routing refactor; resolves 7 duplication findings from Etapa 9.
   *Effort: low. Risk: low (route changes need redirects for any bookmarked
   old paths).*
3. **Operator Cockpit composed rows** (Cert panel, Incident banner, Pending
   Actions) — same reuse tier as #1, higher operator value once #1 ships.
   *Effort: low-medium.*
4. **Capability Explorer extension** — extends existing widget, no new
   backend; unlocks Etapa 6/7/8 (Project Health + Roadmap Kanban reuse this
   same data). *Effort: medium.*
5. **Project Health + Roadmap Kanban** — depends on #4's data shape being
   exposed; both are derived views, no new fetch. *Effort: low once #4
   lands.*
6. **Mirror / Committee / Kill Switch / Portfolio Fase 0 audits** — highest
   operational value (this is the actual trading system) but blocked on
   backend shape audits already scheduled in `CAPABILITY_AUDIT_AND_ROADMAP.md`
   Tier 5. Not a UX task — do not start screens before the audit defines
   contracts.
7. **Timeline consolidation** — depends on a new Fase 0 audit of
   `data-core` timeline/replay/explainability modules (none audited yet).
   Highest architectural payoff (single spine replaces 3 planned screens)
   but requires backend audit first, so it's sequenced after Mirror.
8. **Business OS Learning/Knowledge source-of-truth resolution** — must
   happen before those nav items can be assigned a tab (finding #4 in Etapa
   9); currently blocked by an ownership ambiguity, not effort.
9. **Poupi Baby / Research screens** — Poupi Baby is in STANDBY
   ([[poupi_baby_standby]]), Research has zero catalog entries. Lowest
   priority until either capability exists to audit.

---

## Deliverable 6 — Relatório Final

**O Mission Control já pode ser considerado um Centro de Operações?**
Não ainda. Hoje ele certifica corretamente 2 capabilities (Architecture,
Universal Platform Status) e expõe honestamente que o resto está vazio — o
que é a decisão de design certa (`SectionPage` nunca finge dados) — mas isso
significa que **4 de 8 domínios operacionais da missão (Mirror, Research,
Business OS além de 1 bridge, Poupi Baby) não têm nenhuma tela funcional
hoje.** Um centro de operações real precisa desses domínios visíveis.

**Quais telas já podem ser usadas diariamente?** `/` (Overview) e
`/architecture` (Capability Registry) — ambas com dados reais locais,
ambas bloqueadas apenas em produção (Coolify, per
[[p1_matrix_snapshot_platform]] e outras memórias de deploy). `/architecture`
com InfrastructureHealthWidget e PlatformStatusWidget também é utilizável
hoje para diagnosticar bloqueios de infra.

**Quais capabilities ainda impedem isso?**
- `mirror.state`, `committee.decisions`, `kill-switch.state`,
  `portfolio.state` — Fase 0 (nem o shape do endpoint foi auditado).
- Timeline/Replay/Explainability — backend existe em `data-core` mas nunca
  foi auditado como capability.
- `universal-platform.daily-brief` / `.alerts` — endpoint pronto, mas sem
  event source real (stateless, vazio).
- `business-os.opportunities` — endpoint pronto, mas Poupi Baby em standby
  não emite eventos.
- Deploy em produção via Coolify continua sendo o bloqueio transversal a
  quase toda capability Fase 6-7 (mesmo padrão descrito em múltiplas
  memórias de projeto, e.g. [[business_os_phase2_platform]],
  [[research_lab_v1_state]]).

**Existe alguma duplicação arquitetural?** Sim, 7 achados na Etapa 9 (nav
duplicado para Research/Scientific, Timeline/Replay/Explainability como 3
telas separadas para 1 fluxo, Opportunity Discovery duplicando Business OS,
Learning/Knowledge com fonte de dados ambígua, SEO/Affiliate mal alocados
em "Business", Infrastructure/Deployments fragmentados, Audit/Analytics sem
capability). Nenhuma duplicação de backend, contrato ou BFF foi encontrada —
o problema é 100% de navegação/apresentação, não de arquitetura de dados.

**Qual deve ser a próxima sprint?** Itens 1-3 do UX Roadmap: Executive
Dashboard Domain Strip + restruturação de navegação (23→11) + Operator
Cockpit composed rows. Todos são composição pura sobre hooks/widgets já
existentes — zero backend novo, zero risco de deploy, maior valor
operacional imediato (visibilidade honesta do que está ligado vs. apagado).
Fase 0 audits de Mirror/Committee/Kill Switch/Portfolio devem ser abertos em
paralelo como trabalho de backend, não de UX.

---

**Ambientes:** este documento é uma auditoria de código LOCAL (arquivos no
repositório) — nenhuma capability aqui foi validada em VPS/Coolify/Railway/
Neon/Vercel. Nenhum status "live" acima implica produção; ver
`capability-catalog.ts` para o campo `prod` de cada entrada (a maioria é
`BLOCKED`).

STATUS: **DESIGN COMPLETE — no implementation performed.**
