import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProgrammaticListingPage } from '@/components/seo/ProgrammaticListingPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poupi.com.br';
const MIN_PRODUCTS = 10;

type Props = { params: Promise<{ slug: string }> };

async function fetchCategory(slug: string) {
  const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}?limit=10`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category || Number(data.total ?? 0) < MIN_PRODUCTS) return { title: 'Top 10 | Poupi', robots: { index: false } };
  const url = `${SITE_URL}/top-10/${slug}`;
  const title = `Top 10 ${data.category} | Poupi`;
  const description = `Ranking com 10 opcoes de ${data.category} monitoradas pelo Poupi, com preco e disponibilidade.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Poupi', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category || Number(data.total ?? 0) < MIN_PRODUCTS) notFound();
  return (
    <ProgrammaticListingPage
      title={`Top 10 ${data.category}`}
      description="Ranking editorial gerado a partir de disponibilidade, atualizacao recente e menor preco monitorado."
      breadcrumb={[{ label: 'Poupi', href: '/' }, { label: data.category, href: `/categoria/${slug}` }, { label: 'Top 10' }]}
      products={data.products.slice(0, 10)}
    />
  );
}
