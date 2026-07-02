/**
 * Server-side backend registry for the Mission Control BFF.
 *
 * These base URLs are read on the server ONLY (no NEXT_PUBLIC_ prefix) so that
 * tokens and internal service addresses are never shipped to the browser. Each
 * BFF route handler picks the backend it needs from here and normalizes the
 * response into the shared contract in `./contracts`.
 *
 * REUSE: request execution goes through @poupi-frontend/api-client (ApiClient),
 * which already supports a per-instance baseUrl + bearer token. Mission Control
 * does not re-implement any HTTP client.
 */
import { ApiClient } from "@poupi-frontend/api-client";

export type BackendId =
  | "poupi-crypto"
  | "poupi-baby"
  | "data-core";

type BackendConfig = {
  id: BackendId;
  /** Human label shown in diagnostics. */
  label: string;
  /** Resolved base URL (no trailing slash). */
  baseUrl: string;
  /** Optional static bearer token for server-to-server auth. */
  token?: string;
};

function env(name: string, fallback: string): string {
  const value = process.env[name];
  return (value && value.trim()) || fallback;
}

const BACKENDS: Record<BackendId, BackendConfig> = {
  "poupi-crypto": {
    id: "poupi-crypto",
    label: "Poupi Crypto (FastAPI)",
    baseUrl: env("POUPI_CRYPTO_API_URL", "http://localhost:8000"),
    token: process.env.POUPI_CRYPTO_API_TOKEN,
  },
  "poupi-baby": {
    id: "poupi-baby",
    label: "Poupi Baby (NestJS)",
    baseUrl: env("POUPI_BABY_API_URL", "http://localhost:3001"),
    token: process.env.POUPI_BABY_API_TOKEN,
  },
  "data-core": {
    id: "data-core",
    label: "Data Core",
    baseUrl: env("DATA_CORE_API_URL", "http://localhost:8080"),
    token: process.env.DATA_CORE_API_TOKEN,
  },
};

/** Returns a configured ApiClient for the given backend. */
export function backendClient(id: BackendId): ApiClient {
  const config = BACKENDS[id];
  const token = config.token;
  return new ApiClient({
    baseUrl: config.baseUrl,
    getToken: token ? () => token : undefined,
  });
}

export function backendLabel(id: BackendId): string {
  return BACKENDS[id].label;
}
