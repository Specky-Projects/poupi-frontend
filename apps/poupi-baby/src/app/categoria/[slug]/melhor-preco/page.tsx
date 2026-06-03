import { getSiteUrl } from '@/lib/site-url';
import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgrammaticListingPage } from '@/components/seo/ProgrammaticListingPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = getSiteUrl();
const MIN_PRODUCTS = 8;

type Props = { params: Promise<{ slug: string }> };

async function fetchCategory(slug: string) {
  try {
    const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}?limit=36`, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchLinks(slug: string) {
  try {
    const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}/internal-links`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category) return { title: 'Melhor preço | Nuvii Baby', robots: { index: false } };
  const weak = Number(data.total ?? 0) < MIN_PRODUCTS;
  const url = `${SITE_URL}/categoria/${slug}/melhor-preco`;
  const title = `Melhor preço em ${data.category} | Nuvii Baby`;
  const description = `Compare os menores preços de ${data.category} nas farmácias monitoradas pelo Nuvii Baby.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: weak ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url, type: 'website', siteName: 'Nuvii Baby', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [data, internalLinks] = await Promise.all([fetchCategory(slug), fetchLinks(slug)]);
  if (!data?.category || Number(data.total ?? 0) < MIN_PRODUCTS) notFound();
  const products = [...data.products].sort((a, b) => {
    const ap = Number(a.offers?.[0]?.currentPrice ?? a.offers?.[0]?.price ?? Number.MAX_SAFE_INTEGER);
    const bp = Number(b.offers?.[0]?.currentPrice ?? b.offers?.[0]?.price ?? Number.MAX_SAFE_INTEGER);
    return ap - bp;
  });
  return (
    <ProgrammaticListingPage
      title={`Melhor preço em ${data.category}`}
      description={`${data.total} produtos monitorados. Lista ordenada pelos menores preços disponiveis agora.`}
      breadcrumb={[{ label: 'Nuvii Baby', href: '/' }, { label: data.category, href: `/categoria/${slug}` }, { label: 'Melhor preço' }]}
      products={products}
      internalLinks={internalLinks}
    />
  );
}
