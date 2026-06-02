import { getSiteUrl } from '@/lib/site-url';
import type { MetadataRoute } from 'next';

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/produto/',
          '/categoria/',
          '/marca/',
          '/farmacia/',
          '/melhor-preco/',
          '/promocoes/',
          '/comparar/',
          '/top-10/',
          '/melhor-custo-beneficio/',
          '/quedas-de-preco/',
          '/tendencia-de-preco/',
          '/faq',
          '/privacidade',
          '/termos',
        ],
        disallow: [
          '/admin',
          '/dashboard',
          '/alertas',
          '/conta',
          '/billing',
          '/operacional',
          '/login',
          '/api/',
        ],
      },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`],
  };
}
