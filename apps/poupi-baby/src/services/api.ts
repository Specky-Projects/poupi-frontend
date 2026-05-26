import { createApiClient } from "@poupi-frontend/api-client";

function getPublicApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_URL is required in production");
  }
  return "http://localhost:8000";
}

export const api = createApiClient({
  baseUrl: getPublicApiUrl(),
});

export function createAuthApi(backendToken: string) {
  return createApiClient({
    baseUrl: getPublicApiUrl(),
    getToken: () => backendToken,
  });
}
