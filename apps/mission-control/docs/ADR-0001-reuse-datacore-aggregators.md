# ADR-0001 — Reuse data-core / universal_platform aggregators for Mission Control

- **Status:** SEALED (2026-07-02) — implementation authorized for the two read-only routes; screen and BFF deferred until post-certification.
- **Deciders:** Arquiteto-Chefe (Mission Control V1)
- **Scope:** Data-access strategy for Mission Control screens, starting with the Operator Cockpit.
- **Supersedes:** the placeholder assumption in `src/lib/nav.ts` that Business OS / Universal Platform data lived in `poupi-crypto`. **They live in `data-core`.**

## Sealed sequence (authorized 2026-07-02)
1. ✅ Extend **only** `universal_platform/api.py` with `GET /daily-brief` and `GET /alerts`, routing through `Phase2Platform.execute("daily_brief.generate" | "alert.evaluate", …)` — reuses `_records_from_events → DailyBriefBuilder.build()` / `UnifiedAlertEngine.evaluate()` verbatim. No new logic, advisory-only.
2. ⏳ Redeploy data-core; certify `/health`, `/ready`, `/universal-platform/status`, `/daily-brief`, `/alerts`, opportunities — with real data.
3. ⏳ Only then: thin BFF `GET /api/cockpit` → single `OperatorCockpitContract`.
4. ⏳ Operator Cockpit screen consumes **only** that contract (no data-core internals, no duplicated rules).

## Finding that changes the "real data" expectation (verified 2026-07-02)
`UniversalObservationRuntime.observe()` is **pure/stateless** — it materializes a record per event and does **not** accumulate. There is **no persistent event store**. The existing capability handlers compute brief/alerts strictly from the `events` supplied in the request. Consequently the new `GET` routes return a **well-formed but empty** brief/alerts until an event source feeds them. Wiring an event source is a **separate** workstream (must not be smuggled into these routes as new logic). "Certify with real data" (step 2) therefore certifies *shape + reuse + advisory-only*, and will show empty aggregates until events flow — this is the honest baseline, not a defect.

## Context (evidence gathered 2026-07-02)

Mission Control must show a cross-domain operational picture (health, opportunities, alerts, brief). Per the reuse ladder **REUTILIZAR → INTEGRAR → VISUALIZAR → ESTENDER → CRIAR NOVO**, we audited what already aggregates this in the ecosystem.

### What exists in `data-core/app/universal_platform`
Real, tested aggregators — **no new aggregation logic is needed**:

- **`DailyBriefBuilder.build()` → `UnifiedDailyBrief`**
  `{ brief_id, generated_at, scientific_health, advisory_only, sections[] }`,
  each section `{ title, headline, metrics, lines[] }`. Sections cover Mirror,
  Infrastructure, Research, Affiliate, Knowledge, Optimization, top opportunities,
  and open alerts. Also renders markdown.
- **`UnifiedAlertEngine.evaluate()` → `UnifiedAlert[]`**
  `{ alert_id, title, severity, evidence[], root_cause, confidence,
  recommended_action, replay_ref, correlated_event_ids[], created_at, rule_id }`.
  Correlation rules + singleton-threshold escalation already implemented.
- **`Phase2Platform`** wires 4 adapters (poupi-baby, infrastructure, telegram,
  affiliate) + runtime + alert_engine + brief_builder through a
  `CapabilityOrchestrator`. Advisory-only, read-only, fail-safe.

### What exists in `data-core/app/business_os`
- **`GET /business-os/poupi-baby/opportunities`** and **`/latest`** (auth-gated) —
  read a JSONL evidence registry (`runtime_data/…jsonl`, "until DB wiring is
  explicit"), populated only when the Poupi Baby runtime emits.

### The gap (verified)
The **only HTTP endpoint** on `universal_platform` is
`GET /universal-platform/status` (a self-report of registered capabilities —
never business data). `DailyBriefBuilder` and `UnifiedAlertEngine` are reachable
**only through the orchestrator's capability handlers**, with no read-only HTTP
route to GET a brief or the current alerts.

### Production state (2026-07-02) — BLOCKED
Prod host `dvq6dwsagsw4p4oqwuw7bak9.65.109.239.250.sslip.io` (Coolify/Traefik):
`:80` → connection refused, `:8000` → timeout, while general outbound works
(example.com/github → 200). The data-core service is **not serving**; live /
real-data status **cannot be confirmed** and is classified **BLOCKED**. Even if
live, the opportunities registry is a per-container JSONL and Poupi Baby is on
stand-by → expected empty.

## Decision

1. **Mission Control does NOT re-implement aggregation.** It consumes data-core's
   existing `UnifiedDailyBrief` and `UnifiedAlert` outputs and the
   `/business-os/poupi-baby/opportunities` endpoint. The MC BFF
   (`src/app/api/*`) normalizes them into `src/lib/contracts.ts`.
2. **Close the gap by ESTENDER, not CRIAR NOVO:** add thin, **read-only** HTTP
   routes in `data-core/app/universal_platform/api.py` that return
   `DailyBriefBuilder.build(...).as_dict()` and
   `UnifiedAlertEngine.evaluate(...)` results over the existing runtime records.
   No new business logic, no mutation, advisory-only — consistent with the
   module's stated contract. (Owned by data-core; MC only consumes.)
3. **Correct the source mapping** in Mission Control's nav/config from
   `poupi-crypto` to `data-core` for Business OS, Universal Platform,
   Opportunity Discovery, Affiliate, and Alerts.
4. **Register `data-core` as a first-class BFF backend** (already scaffolded in
   `src/lib/backends.ts` via `DATA_CORE_API_URL`).

## Consequences

- Operator Cockpit's brief, alerts, and opportunity feed all trace to a single
  existing aggregator — one contract, one source of truth, zero duplicated logic.
- One prerequisite before the Cockpit shows real data: the two read-only
  data-core routes (item 2) must be shipped **and** data-core must be redeployed
  (currently BLOCKED on Coolify — human action required).
- Until then the Cockpit renders against the normalized contract and degrades
  gracefully (same pattern as the Overview BFF), showing "NO_DATA / backend
  unreachable" rather than failing.

## Prohibitions honored
No change to Mirror, Committee, Kill Switch, Position Sizing, Executor, Research
runtime, Business OS logic, or Poupi Baby. MC is read/visualize only; the single
data-core extension (item 2) is additive, read-only, advisory-only.
