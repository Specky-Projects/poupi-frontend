import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const BACKEND  = getBackendUrl("3001");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poupi.com.br';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function deSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchCategoryData(slug: string) {
  const res = await fetch(`${BACKEND}/seo/categories/${encodeURIComponent(slug)}?limit=24`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ categoria: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const data = await fetchCategoryData(categoria);
  const categoryName = data?.category ?? deSlug(categoria);
  const url = `${SITE_URL}/promocoes/${categoria}`;

  const title = `Promoção ${categoryName} — Ofertas Hoje | Poupi`;
  const description = `As melhores promoções de ${categoryName} nas farmácias. Produtos com preço abaixo da média histórica, rastreados em tempo real pelo Poupi.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: 'Poupi', locale: 'pt_BR' },
    twitter: { card: 'summary', title, description },
  };
}

export default async function PromocoesPage({ params }: Props) {
  const { categoria } = await params;
  const data = await fetchCategoryData(categoria);
  if (!data) notFound();

  const categoryName: string = data.category ?? deSlug(categoria);
  const products: Array<{
    id: string; slug: string; canonicalName?: string | null; title: string;
    brand?: string | null; imageUrl?: string | null; variantLabel?: string | null;
    offers: Array<{
      price: number; currentPrice?: number | null; originalPrice?: number | null;
      pricePerUnit?: number | null; marketplace: { name: string };
    }>;
  }> = data.products ?? [];

  const promoProducts = products.filter((p) => {
    const o = p.offers[0];
    if (!o) return false;
    const cur = Number(o.currentPrice ?? o.price);
    const orig = Number(o.originalPrice ?? 0);
    return orig > cur && orig > 0;
  });

  const allProducts = [
    ...promoProducts,
    ...products.filter((p) => !promoProducts.includes(p)),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Promoção ${categoryName}`,
    url: `${SITE_URL}/promocoes/${categoria}`,
    description: `Promoções de ${categoryName} nas farmácias.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#201335]">
        <div className="mx-auto max-w-5xl space-y-5">

          <nav className="text-xs text-[#675b77]">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:text-[#6c2bd9]">Poupi</Link></li>
              <li aria-hidden>/</li>
              <li><a href={`/categoria/${categoria}`} className="hover:text-[#6c2bd9]">{categoryName}</a></li>
              <li aria-hidden>/</li>
              <li className="font-medium text-[#201335]">Promoções</li>
            </ol>
          </nav>

          <header>
            <h1 className="text-2xl font-semibold tracking-tight">Promoção {categoryName} — Ofertas de Hoje</h1>
            <p className="mt-1 text-sm text-[#675b77]">
              Produtos com desconto em relação ao preço original.
              {promoProducts.length > 0
                ? ` ${promoProducts.length} produto${promoProducts.length !== 1 ? 's' : ''} em promoção agora.`
                : ' Preços rastreados nas principais farmácias.'}
            </p>
          </header>

          {promoProducts.length > 0 && (
            <div className="rounded-lg border border-[#e8f8ee] bg-[#f0fdf5] px-4 py-2 text-sm text-[#2f8a51] font-semibold">
              {promoProducts.length} produto{promoProducts.length !== 1 ? 's' : ''} com desconto identificado{promoProducts.length !== 1 ? 's' : ''} agora
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((p) => {
              const o = p.offers[0];
              const cur = o ? Number(o.currentPrice ?? o.price) : null;
              const orig = o?.originalPrice ? Number(o.originalPrice) : null;
              const hasDiscount = orig !== null && cur !== null && orig > cur;
              const discount = hasDiscount && orig && cur ? Math.round(((orig - cur) / orig) * 100) : 0;
              const name = p.canonicalName || p.title;
              return (
                <a
                  key={p.id}
                  href={`/produto/${p.slug}`}
                  className={`rounded-lg border bg-white p-4 shadow-sm transition hover:border-[#cdb8ef] ${hasDiscount ? 'border-[#6c2bd9]' : 'border-[#eadff7]'}`}
                >
                  <div className="flex items-start gap-3">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={name} width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
                      : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f5efff] text-2xl">📦</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1">
                        {p.brand && <span className="text-xs font-semibold text-[#6c2bd9]">{p.brand}</span>}
                        {hasDiscount && discount > 0 && (
                          <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-xs font-bold text-[#2f8a51]">-{discount}%</span>
                        )}
                      </div>
                      <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold">{name}</h2>
                      {p.variantLabel && <p className="mt-0.5 text-xs text-[#675b77]">{p.variantLabel}</p>}
                    </div>
                  </div>
                  <div className="mt-3">
                    {orig && hasDiscount && <p className="text-xs text-[#675b77] line-through">{money(orig)}</p>}
                    {cur ? <p className={`text-lg font-bold ${hasDiscount ? 'text-[#2f8a51]' : 'text-[#6c2bd9]'}`}>{money(cur)}</p>
                      : <p className="text-sm text-[#8a7f98]">Indisponível</p>}
                    {o?.marketplace?.name && <p className="text-xs text-[#8a7f98]">{o.marketplace.name}</p>}
                  </div>
                </a>
              );
            })}
          </div>

          <section className="rounded-lg border border-[#eadff7] bg-white p-5 text-center shadow-sm">
            <h2 className="text-base font-semibold">Não perca promoções de {categoryName}</h2>
            <p className="mt-1 text-sm text-[#675b77]">Receba alertas automáticos quando o preço baixar na sua farmácia favorita.</p>
            <a href="/login" className="mt-3 inline-block rounded-lg bg-[#6c2bd9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a21c0]">
              Criar alerta grátis
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
