import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import type { ProgrammaticSeoPayload } from '@/components/seo/ProgrammaticSeoPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poupi.com.br';

export async function fetchSeoPayload(path: string): Promise<ProgrammaticSeoPayload | null> {
  try {
    const res = await fetch(`${BACKEND}${path}`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function metadataFromPayload(payload: ProgrammaticSeoPayload | null, fallbackTitle: string): Metadata {
  if (!payload) return { title: fallbackTitle, robots: { index: false, follow: true } };
  const url = `${SITE_URL}${payload.canonicalPath}`;
  return {
    title: `${payload.title} | Poupi`,
    description: payload.description,
    alternates: { canonical: url },
    robots: payload.robots.index ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: payload.title, description: payload.description, url, type: 'website', siteName: 'Poupi', locale: 'pt_BR' },
    twitter: { card: 'summary', title: payload.title, description: payload.description },
  };
}

export function assertSeoPayload(payload: ProgrammaticSeoPayload | null, requestedPath: string): ProgrammaticSeoPayload {
  if (!payload) notFound();
  if (payload.canonicalPath !== requestedPath) redirect(payload.canonicalPath);
  if (!payload.robots.index) notFound();
  return payload;
}
