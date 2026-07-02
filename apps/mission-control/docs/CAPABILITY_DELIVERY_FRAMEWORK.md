# Mission Control - Capability Delivery Framework

**Status:** Adopted 2026-07-02. Mission Control evolves only through certified
capabilities. No feature is built directly. This framework is the executable
counterpart of `ADR-0002`.

## Capability Delivery Standard

Every capability must have, with no exceptions:

| Required layer | Rule |
|---|---|
| Source of Truth | Backend owner, official endpoint/aggregator, owner, and capability must be identified first. If none exists, stop. |
| Contract | Minimal normalized TypeScript contract. Reuse existing types; do not duplicate backend models. |
| BFF | One thin `src/app/api/*` route: proxy, normalization, error handling, graceful degradation. No business logic and no parallel cache. |
| Hook | Reusable data hook: fetch local BFF, loading, error, refresh, typed data. Nothing else. |
| Widget | Reusable presentational component. Receives the contract; never accesses backend. |
| Screen | Composition only. No fetch, no normalization, no domain logic. |
| Tests | Contract, BFF normalization, states, widget rendering, catalog regression, and standard conformance. |
| Certification | typecheck, lint, tests, build, regression, compile. Delivery is accepted only when all pass. |

Mandatory priority ladder:

`REUSE -> EXTEND -> GENERALIZE -> CREATE NEW`

## Official Pipeline

| Phase | Name | Output | Stop condition |
|---|---|---|---|
| 1 | Source of Truth | backend, endpoint, aggregator, owner, capability | No SoT exists. Do not invent one. |
| 2 | Contract | minimum UI contract | Contract duplicates backend model without need. |
| 3 | BFF | thin local endpoint | Business logic, cache, or fake fallback appears. |
| 4 | Hook | reusable typed hook | Hook does more than fetch/state/refresh. |
| 5 | Widget | reusable widget | Widget fetches or owns domain decisions. |
| 6 | Screen Composition | screen composed from widgets | Screen fetches or normalizes data. |
| 7 | Certification | green local evidence | typecheck/lint/tests/build/regression fail. |

## Source of Truth

- Functional domain data has exactly one backend Source of Truth.
- Mission Control does not re-derive backend facts.
- `src/lib/capability-catalog.ts` is only the Mission Control delivery-status
  Source of Truth. It tracks delivery state, not domain logic.

## BFF Requirement

All backend access goes through Mission Control BFF routes under `src/app/api/*`.
The UI never calls `data-core`, `poupi-crypto`, engines, or backend internals
directly.

## Hook Requirement

Screens do not fetch. A screen consumes a hook, and the hook consumes only the
local BFF route.

## Widget Requirement

Widgets are reusable and presentational. They receive normalized contracts as
props and may render loading/error/empty states, but they never fetch or call
backend clients.

## Screen Requirement

Screens are composition layers. They may choose which hooks and widgets to place
together, but they do not implement capability logic.

## Certification Requirement

A capability is not delivered until these pass locally:

- typecheck
- lint
- focused tests
- build
- regression tests
- compile

Real-data certification is required whenever the Source of Truth can be run
locally or in production. Mocks may support unit tests, but never count as
delivery evidence.

## Governance and CI Readiness

The delivery pattern is enforced by tests that are safe to run in future CI:

- `src/lib/capability-standard.test.ts` guards ADR-0002 conformance: no screen
  fetches, no widget/backend access, hooks call only `/api/*`, backend clients
  stay in BFF routes, BFF routes remain GET-only, and the roadmap references the
  catalog and ADR.
- `src/lib/capability-catalog.test.ts` guards catalog integrity: certified
  capabilities must have Source of Truth, category, backend, contract, BFF, hook,
  widget, screen, tests, and certification evidence.

CI does not need a new framework. Running the existing test suite is enough to
detect governance regressions before a capability is considered delivered.

## Prohibitions

Do not create operational logic in the frontend. Do not fetch directly from
backend services. Do not create widgets with business rules. Do not duplicate
contracts. Do not duplicate BFF routes. Do not bypass the BFF. Do not call
engines directly from Mission Control UI code.

## Reference Implementation

`universal-platform.status` is the canonical implementation of this standard:

`data-core Phase2Platform.status()` -> `PlatformStatusContract` ->
`GET /api/platform-status` -> `usePlatformStatus` -> `PlatformStatusWidget` ->
`/architecture` -> tests and local certification.
