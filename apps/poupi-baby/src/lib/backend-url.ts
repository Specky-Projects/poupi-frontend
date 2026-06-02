export function getBackendUrl(localPort = "8000") {
  const configured = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/^\uFEFF/, "").trim().replace(/\/$/, "");

  if (process.env.NODE_ENV === "production") {
    throw new Error("BACKEND_URL or NEXT_PUBLIC_API_URL is required in production");
  }

  return `http://localhost:${localPort}`;
}
