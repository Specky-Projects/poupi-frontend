import './globals.css';

import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Provider from '../providers/session-provider';
import { getSiteUrl } from '../lib/site-url';

const SITE_URL = getSiteUrl();
const SITE_NAME = 'Radar do Berço';
const SITE_TITLE = 'Radar do Berço | Compare preços de produtos para bebês';
const SITE_DESCRIPTION =
  'Compare preços de fraldas, fórmulas, mamadeiras e produtos infantis. Economize tempo e dinheiro com o Radar do Berço.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['fraldas', 'formula infantil', 'mamadeiras', 'produtos infantis', 'comparar preços', 'alerta de preço'],
  authors: [{ name: SITE_NAME }],
  robots: { index: false, follow: false }, // default safe; public pages override explicitly
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: '/images/radar-berco-hero.svg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/images/radar-berco-hero.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    slogan: 'Menos tempo procurando. Mais tempo cuidando.',
    description: 'Comparador inteligente de preços para produtos infantis.',
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/dashboard?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </head>
      <body>
        <Provider>
          {children}
        </Provider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
