export function getPublicApiUrl(localPort = '8000') {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/^\uFEFF/, '').trim().replace(/\/$/, '');
  return `http://localhost:${localPort}`;
}
