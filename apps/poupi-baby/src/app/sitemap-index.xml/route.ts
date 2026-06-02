import { getSiteUrl } from '@/lib/site-url';
import { getBackendUrl } from '@/lib/backend-url';
const BACKEND = getBackendUrl("3001");
const SITE_URL = getSiteUrl();

export async function GET() {
  let data: { index: string[] } = { index: ['/sitemap.xml'] };
  try {
    const res = await fetch(`${BACKEND}/seo/sitemaps/partitions`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8_000),
    });
    if (res.ok) data = await res.json();
  } catch {
    // backend unreachable — fallback to single sitemap.xml
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${data.index
    .map((path: string) => `  <sitemap><loc>${SITE_URL}${path}</loc><lastmod>${new Date().toISOString()}</lastmod></sitemap>`)
    .join('\n')}\n</sitemapindex>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
