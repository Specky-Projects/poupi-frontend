import type { FC } from 'react';
import Link from 'next/link';
import { SeoInternalLinks, type SeoInternalLinkGraph } from './SeoInternalLinks';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://poupi.com.br';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

type Offer = {
  id: string;
  price: number | string;
  currentPrice?: number | string | null;
  originalPrice?: number | string | null;
  pricePerUnit?: number | string | null;
  productUrl: string;
  availability: boolean;
  freightPrice?: number | string | null;
  marketplace: { name: string; slug?: string | null; logoUrl?: string | null };
};

type Product = {
  id: string;
  slug: string;
  title: string;
  canonicalName?: string | null;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  variantLabel?: string | null;
  measureValue?: number | null;
  measureUnit?: string | null;
  productFamilySlug?: string | null;
  ean?: string | null;
  updatedAt?: string | null;
  offers: Offer[];
};

function offerPrice(o: Offer) {
  return Number(o.currentPrice ?? o.price ?? 0);
}

export const PublicProductPage: FC<{ product: Product; internalLinks?: SeoInternalLinkGraph | null }> = ({ product, internalLinks }) => {
  const name = product.canonicalName || product.title;
  const available = product.offers.filter((o) => o.availability).sort((a, b) => offerPrice(a) - offerPrice(b));
  const unavailable = product.offers.filter((o) => !o.availability);
  const allOffers = [...available, ...unavailable];
  const best = available[0] ?? null;
  const bestPrice = best ? offerPrice(best) : null;
  const prices = available.map(offerPrice);
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const spread = bestPrice !== null && maxPrice !== null ? maxPrice - bestPrice : 0;

  const categorySlug = product.category
    ? product.category.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : null;
  const brandSlug = product.brand
    ? product.brand.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : null;

  const canonicalUrl = `${SITE_URL}/produto/${product.slug}`;
  const updatedLabel = product.updatedAt
    ? new Date(product.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: product.imageUrl,
    sku: product.ean ?? undefined,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    url: canonicalUrl,
    offers: available.map((o) => ({
      '@type': 'Offer',
      price: offerPrice(o).toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: o.marketplace.name },
      url: o.productUrl,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Poupi', item: SITE_URL },
      ...(product.category && categorySlug
        ? [{ '@type': 'ListItem', position: 2, name: product.category, item: `${SITE_URL}/categoria/${categorySlug}` }]
        : []),
      { '@type': 'ListItem', position: product.category ? 3 : 2, name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#201335]">
        <div className="mx-auto max-w-5xl space-y-5">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-[#675b77]">
            <ol className="flex flex-wrap items-center gap-1">
              <li><Link href="/" className="hover:text-[#6c2bd9]">Poupi</Link></li>
              {product.category && categorySlug && (
                <>
                  <li aria-hidden>/</li>
                  <li><Link href={`/categoria/${categorySlug}`} className="hover:text-[#6c2bd9]">{product.category}</Link></li>
                </>
              )}
              <li aria-hidden>/</li>
              <li className="font-medium text-[#201335]">{name}</li>
            </ol>
          </nav>

          {/* Header do produto */}
          <section className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[160px_1fr_240px] lg:items-start">

              {/* Imagem */}
              <div className="flex justify-center rounded-lg bg-[#f8f3ff] p-4">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={name} width={144} height={144} className="h-36 w-36 object-contain" />
                  : <div className="flex h-36 w-36 items-center justify-center text-5xl text-[#6c2bd9]">📦</div>}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {product.brand && brandSlug && (
                    <Link href={`/marca/${brandSlug}`} className="rounded-full bg-[#f5efff] px-2.5 py-1 text-[#6c2bd9] hover:bg-[#ebe0ff]">{product.brand}</Link>
                  )}
                  {product.category && categorySlug && (
                    <Link href={`/categoria/${categorySlug}`} className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[#2f8a51] hover:bg-[#d5f0df]">{product.category}</Link>
                  )}
                  {product.ean && <span className="rounded-full bg-[#f7f2ee] px-2.5 py-1 text-[#675b77]">EAN {product.ean}</span>}
                </div>

                <h1 className="mt-3 text-2xl font-semibold tracking-tight">{name}</h1>

                {product.variantLabel && (
                  <p className="mt-1 text-sm text-[#675b77]">Variante: {product.variantLabel}</p>
                )}

                {updatedLabel && (
                  <p className="mt-2 text-xs text-[#8a7f98]">Atualizado em {updatedLabel}</p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <PriceStat label="Menor preço" value={bestPrice ? money(bestPrice) : 'Indisponível'} highlight />
                  <PriceStat label="Lojas monitoradas" value={`${allOffers.length}`} />
                  <PriceStat label="Economia possível" value={spread > 0 ? money(spread) : '-'} />
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-lg bg-[#f5efff] p-4">
                <p className="text-sm font-medium text-[#675b77]">Melhor preço agora</p>
                <p className="mt-2 text-3xl font-bold text-[#6c2bd9]">{best ? money(offerPrice(best)) : '—'}</p>
                {best && <p className="mt-1 text-sm text-[#201335]">{best.marketplace.name}</p>}
                {best?.pricePerUnit && (
                  <p className="mt-1 text-xs text-[#675b77]">{money(Number(best.pricePerUnit))} por unidade</p>
                )}
                <Link
                  href="/login"
                  className="mt-4 block w-full rounded-lg bg-[#6c2bd9] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#5a21c0]"
                >
                  Criar alerta de preço grátis
                </Link>
                <p className="mt-2 text-center text-xs text-[#8a7f98]">Receba notificação quando baixar</p>
              </div>
            </div>
          </section>

          {/* Comparação de farmácias */}
          <section className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Comparação de preços por farmácia</h2>
            <p className="mt-1 mb-4 text-sm text-[#675b77]">
              Preços coletados automaticamente pelo Poupi. Compare antes de comprar.
            </p>
            <div className="space-y-3">
              {allOffers.length === 0 && (
                <p className="text-sm text-[#8a7f98]">Nenhuma oferta disponível no momento.</p>
              )}
              {allOffers.map((offer, i) => (
                <div
                  key={offer.id}
                  className={`rounded-lg border p-4 ${i === 0 && offer.availability ? 'border-[#6c2bd9] bg-[#faf7ff]' : 'border-[#eadff7]'}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {i === 0 && offer.availability && (
                          <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-xs font-semibold text-[#2f8a51]">melhor preço</span>
                        )}
                        <span className="font-semibold">{offer.marketplace.name}</span>
                        {!offer.availability && (
                          <span className="rounded-full bg-[#fff1f1] px-2 py-0.5 text-xs font-semibold text-[#b13a3a]">indisponível</span>
                        )}
                      </div>
                      {offer.pricePerUnit && (
                        <p className="mt-1 text-xs text-[#675b77]">{money(Number(offer.pricePerUnit))} por unidade</p>
                      )}
                      {offer.originalPrice && Number(offer.originalPrice) > offerPrice(offer) && (
                        <p className="mt-1 text-xs text-[#675b77] line-through">de {money(Number(offer.originalPrice))}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#6c2bd9]">{money(offerPrice(offer))}</p>
                        {Number(offer.freightPrice ?? 0) > 0 && (
                          <p className="text-xs text-[#675b77]">+ frete {money(Number(offer.freightPrice))}</p>
                        )}
                      </div>
                      {offer.availability && (
                        <Link
                          href={`/login?redirect=${encodeURIComponent(`/produto/${product.slug}`)}`}
                          className="rounded-lg bg-[#6c2bd9] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5a21c0]"
                          rel="nofollow"
                        >
                          Ver oferta
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA informativo */}
          <section className="rounded-lg border border-[#eadff7] bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-semibold">Vale a pena comprar agora?</h2>
            <p className="mt-2 text-sm text-[#675b77]">
              O Poupi analisa o histórico de preços de {name} e calcula automaticamente se é um bom momento para comprar.
              Crie uma conta gratuita e receba alertas quando o preço baixar.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-lg bg-[#6c2bd9] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a21c0]"
            >
              Monitorar preço grátis
            </Link>
          </section>

          <SeoInternalLinks graph={internalLinks} />
        </div>
      </main>
    </>
  );
};

function PriceStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-[#eadff7] bg-[#fffdf9] p-3">
      <p className="text-xs font-medium text-[#675b77]">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${highlight ? 'text-[#6c2bd9]' : ''}`}>{value}</p>
    </div>
  );
}
