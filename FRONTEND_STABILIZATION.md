# Poupi Frontend Stabilization

Last verified: 2026-05-26.

## Current State

- This local folder has no detected `.git` directory.
- The workspace is a pnpm/turbo monorepo.
- Apps live under `apps/*`.
- Shared packages live under `packages/*`.
- Real `.env.local` files exist locally and must not be committed.
- Safe examples now exist as `.env.example` and per-app `.env.local.example` files.

## Production Guardrail

Run:

```bash
pnpm check:prod-env
```

The check must pass before any production deploy.

Current status:

- `npm run check:prod-env` passes.
- `npx tsc --noEmit` passes in `apps/poupi-baby`.
- `npx eslint .` in `apps/poupi-baby` has 0 errors and remaining warnings only.
- Local development fallback is centralized in:
  - `apps/poupi-baby/src/lib/backend-url.ts`;
  - `apps/poupi-baby/src/services/api.ts`;
  - `packages/api-client/src/index.ts`.
- Production throws when required URL env vars are missing.

## Target Rules

- Production builds must never silently fallback to localhost.
- `NEXT_PUBLIC_*` variables are browser-visible and cannot contain secrets.
- `BACKEND_URL` is server-side only and should point to an internal service URL in production.
- Localhost defaults are allowed only for explicit local development.
- Deployments should inject env vars through CI/Coolify secrets.

## Required Variables

```env
NEXT_PUBLIC_API_URL=https://api.example.com
BACKEND_URL=http://data-core:8000
NEXT_PUBLIC_SITE_URL=https://www.example.com
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

## Safe Migration Sequence

1. Put this folder under Git or replace it with a clean clone from the official GitHub repo.
2. Confirm all `.env.local` files are ignored and not staged.
3. Run `pnpm install --frozen-lockfile`.
4. Run `pnpm check:prod-env`.
5. Keep duplicated backend URL fallbacks out of app routes and pages.
6. Keep helpers failing fast in production when `BACKEND_URL` or `NEXT_PUBLIC_API_URL` is missing.
7. Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
8. Deploy from CI/Coolify, not from notebook-only state.

## Do Not Do

- Do not commit real `.env.local` files.
- Do not expose `BACKEND_URL` as `NEXT_PUBLIC_BACKEND_URL`.
- Do not remove local env files until deployment env vars are validated.
- Do not deploy production from this unversioned local folder.
