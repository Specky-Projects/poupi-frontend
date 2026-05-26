import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const BACKEND  = getBackendUrl("3001");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL   || 'https://poupi.com.br';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

async function fetchCategory(slug: string) {
  const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}?limit=24`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category) return { title: 'Categoria | Poupi', robots: { index: false } };

  const title = `${data.category} — Melhores Preços | Poupi`;
  const description = `Compare preços de ${data.category} nas principais farmácias e drogarias. ${data.total} produtos monitorados com histórico de preço e alertas automáticos.`;
  const url = `${SITE_URL}/categoria/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Poupi', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchCategory(slug);
  if (!data?.category) notFound();

  const { category, products, total, page, pages } = data as {
    category: string;
    slug: string;
    products: Array<{
      id: string; slug: string; canonicalName?: string | null; title: string;
      brand?: string | null; imageUrl?: string | null; variantLabel?: string | null;
      offers: Array<{ price: number; currentPrice?: number | null; pricePerUnit?: number | null; marketplace: { name: string } }>;
    }>;
    total: number; page: number; pages: number;
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category} — Melhores Preços`,
    url: `${SITE_URL}/categoria/${slug}`,
    description: `Compare preços de ${category} nas principais farmácias. ${total} produtos.`,
    numberOfItems: total,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Poupi', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: category, item: `${SITE_URL}/categoria/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#201335]">
        <div className="mx-auto max-w-5xl space-y-5">

          <nav className="text-xs text-[#675b77]">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:text-[#6c2bd9]">Poupi</Link></li>
              <li aria-hidden>/</li>
              <li className="font-medium text-[#201335]">{category}</li>
            </ol>
          </nav>

          <header>
            <h1 className="text-2xl font-semibold tracking-tight">{category} — Melhores Preços</h1>
            <p className="mt-1 text-sm text-[#675b77]">
              {total} produto{total !== 1 ? 's' : ''} monitorado{total !== 1 ? 's' : ''} nas principais farmácias.
              Preços atualizados automaticamente pelo Poupi.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const bestOffer = p.offers[0] ?? null;
              const bestPrice = bestOffer ? Number(bestOffer.currentPrice ?? bestOffer.price) : null;
              const name = p.canonicalName || p.title;
              return (
                <a
                  key={p.id}
                  href={`/produto/${p.slug}`}
                  className="rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm transition hover:border-[#cdb8ef]"
                >
                  <div className="flex items-start gap-3">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={name} width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
                      : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f5efff] text-2xl">📦</div>}
                    <div className="min-w-0 flex-1">
                      {p.brand && <p className="text-xs font-semibold text-[#6c2bd9]">{p.brand}</p>}
                      <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold">{name}</h2>
                      {p.variantLabel && <p className="mt-0.5 text-xs text-[#675b77]">{p.variantLabel}</p>}
                    </div>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      {bestPrice
                        ? <p className="text-lg font-bold text-[#6c2bd9]">{money(bestPrice)}</p>
                        : <p className="text-sm text-[#8a7f98]">Indisponível</p>}
                      {bestOffer?.pricePerUnit && (
                        <p className="text-xs text-[#675b77]">{money(Number(bestOffer.pricePerUnit))}/un</p>
                      )}
                    </div>
                    {bestOffer?.marketplace?.name && (
                      <p className="text-xs text-[#8a7f98]">{bestOffer.marketplace.name}</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>

          {pages > 1 && (
            <p className="text-center text-sm text-[#675b77]">
              Mostrando página {page} de {pages} — <a href="/login" className="text-[#6c2bd9] hover:underline">Crie uma conta para monitorar preços</a>
            </p>
          )}

          <section className="rounded-lg border border-[#eadff7] bg-white p-5 text-center shadow-sm">
            <h2 className="text-base font-semibold">Quer saber quando {category} entrar em promoção?</h2>
            <p className="mt-1 text-sm text-[#675b77]">O Poupi monitora preços 24h e envia alertas automáticos.</p>
            <a href="/login" className="mt-3 inline-block rounded-lg bg-[#6c2bd9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a21c0]">
              Criar conta grátis
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
