# ADR-0002 - Capability Delivery Pattern for Mission Control

- **Status:** ADOPTED (2026-07-02)
- **Deciders:** Mission Control architecture
- **Scope:** Every current and future Mission Control capability
- **Supersedes:** any ad-hoc screen, fetch, widget, or contract delivery path

## Context

The first certifiable capability, `universal-platform.status`, validated the full
delivery chain:

Source of Truth -> Contract -> BFF -> Hook -> Reusable Widget -> Screen
Composition -> Tests -> Certification.

This is now the institutional delivery pattern for Mission Control. The frontend
is read-only and advisory-only. It visualizes backend-owned facts; it does not
create operational logic.

## Decision

Every capability must pass through the same mandatory phases:

1. **Source of Truth** - identify the backend owner, official endpoint,
   aggregator, owner, and capability. If no Source of Truth exists, stop.
2. **Contract** - create the minimum normalized TypeScript contract needed by
   the UI. Reuse existing backend/UI types whenever possible.
3. **BFF** - expose one thin Mission Control endpoint that proxies, normalizes,
   handles errors, and degrades gracefully. No business calculation and no
   parallel cache.
4. **Hook** - fetch the BFF contract and expose loading, error, refresh, and
   typed data. Nothing else.
5. **Widget** - render the contract. Widgets never access backend services.
6. **Screen Composition** - screens only compose hooks and reusable widgets.
   Screens do not fetch, normalize, or implement domain decisions.
7. **Certification** - typecheck, lint, tests, build, regression checks, and
   compile must pass before delivery is accepted.

The mandatory priority ladder is:

REUSE -> EXTEND -> GENERALIZE -> CREATE NEW.

## Consequences

- No frontend component may call `data-core`, `poupi-crypto`, engines, or
  backend internals directly.
- All external service access is contained in `src/app/api/*` BFF routes through
  typed clients.
- Hooks may call only local Mission Control BFF routes.
- Widgets are presentational and receive already-normalized contracts.
- Screens are composition surfaces only.
- Certified capabilities must be represented in `src/lib/capability-catalog.ts`
  with Source of Truth, contract, BFF, hook, widget, screen, tests, and
  certification status.

## Enforcement

The standard is documented in `docs/CAPABILITY_DELIVERY_FRAMEWORK.md`, tracked in
`src/lib/capability-catalog.ts`, and guarded by tests:

- `src/lib/capability-catalog.test.ts`
- `src/lib/capability-standard.test.ts`

## Prohibited

- Operational logic in the frontend.
- Direct fetch from screens to backend services.
- Widgets with backend access or business rules.
- Duplicated contracts or duplicated BFF routes.
- Capability-specific hooks when an existing reusable hook satisfies the need.
- Engine calls from Mission Control UI code.
- Bypassing the BFF.
