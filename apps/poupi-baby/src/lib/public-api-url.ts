export function getPublicApiUrl(localPort = '8000') {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/^\uFEFF/, '').trim().replace(/\/$/, '');

  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL is required in production');
  }

  const host = 'localhost';
  return `http://${host}:${localPort}`;
}
