const FALLBACK_SITE_URL = 'http://localhost:3000';

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL;

  try {
    return new URL(raw).toString().replace(/\/$/, '');
  } catch {
    return FALLBACK_SITE_URL;
  }
}
