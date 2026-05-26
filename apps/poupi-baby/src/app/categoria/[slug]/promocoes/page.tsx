import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgrammaticListingPage } from '@/components/seo/ProgrammaticListingPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poupi.com.br';
const MIN_PRODUCTS = 8;

type Props = { params: Promise<{ slug: string }> };

async function fetchCategory(slug: string) {
  const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}?limit=36`, { next: { revalidate: 900 } });
  if (!res.ok) return null;
  return res.json();
}

async function fetchLinks(slug: string) {
  const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}/internal-links`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category) return { title: 'Promocoes | Poupi', robots: { index: false } };
  const weak = Number(data.total ?? 0) < MIN_PRODUCTS;
  const url = `${SITE_URL}/categoria/${slug}/promocoes`;
  const title = `Promocoes de ${data.category} | Poupi`;
  const description = `Ofertas e promocoes de ${data.category} nas farmacias monitoradas pelo Poupi.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: weak ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: 'website', siteName: 'Poupi', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [data, internalLinks] = await Promise.all([fetchCategory(slug), fetchLinks(slug)]);
  if (!data?.category || Number(data.total ?? 0) < MIN_PRODUCTS) notFound();
  return (
    <ProgrammaticListingPage
      title={`Promocoes de ${data.category}`}
      description={`${data.total} produtos monitorados com disponibilidade recente nas principais farmacias.`}
      breadcrumb={[{ label: 'Poupi', href: '/' }, { label: data.category, href: `/categoria/${slug}` }, { label: 'Promocoes' }]}
      products={data.products}
      internalLinks={internalLinks}
    />
  );
}
