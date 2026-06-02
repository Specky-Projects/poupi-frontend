import { getSiteUrl } from '@/lib/site-url';
import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgrammaticListingPage } from '@/components/seo/ProgrammaticListingPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = getSiteUrl();
const MIN_PRODUCTS = 8;

type Props = { params: Promise<{ slug: string }> };

async function fetchMarketplace(slug: string) {
  const res = await fetch(`${BACKEND}/seo/marketplaces/${encodeURIComponent(slug)}?limit=36`, { next: { revalidate: 900 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchLinks(slug: string) {
  const res = await fetch(`${BACKEND}/seo/marketplaces/${encodeURIComponent(slug)}/internal-links`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchMarketplace(slug);
  if (!data?.marketplace) return { title: 'Promoções de farmacia | Radar do Berço', robots: { index: false } };
  const weak = Number(data.total ?? 0) < MIN_PRODUCTS;
  const url = `${SITE_URL}/farmacia/${slug}/promocoes`;
  const title = `Promoções ${data.marketplace.name} | Radar do Berço`;
  const description = `Promoções e menores preços da ${data.marketplace.name} monitorados pelo Radar do Berço.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: weak ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: 'website', siteName: 'Radar do Berço', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [data, internalLinks] = await Promise.all([fetchMarketplace(slug), fetchLinks(slug)]);
  if (!data?.marketplace || Number(data.total ?? 0) < MIN_PRODUCTS) notFound();
  return (
    <ProgrammaticListingPage
      title={`Promoções ${data.marketplace.name}`}
      description={`${data.total} ofertas monitoradas com revalidacao rapida para capturar mudancas de preço.`}
      breadcrumb={[{ label: 'Radar do Berço', href: '/' }, { label: data.marketplace.name, href: `/farmacia/${slug}` }, { label: 'Promoções' }]}
      products={data.products}
      internalLinks={internalLinks}
    />
  );
}
