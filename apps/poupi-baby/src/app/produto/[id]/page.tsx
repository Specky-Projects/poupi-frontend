import { getSiteUrl } from '@/lib/site-url';
import { getBackendUrl } from '@/lib/backend-url';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from './ProductPageClient';
import { PublicProductPage } from '@/components/seo/PublicProductPage';

const BACKEND = getBackendUrl("3001");
const SITE_URL = getSiteUrl();

function getLocalBackendUrl() {
  if (process.env.NODE_ENV === 'production') return null;
  const host = 'localhost';
  return `http://${host}:3001`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchBackendJson(path: string, revalidate: number) {
  const localBackend = getLocalBackendUrl();
  try {
    let res = await fetch(`${BACKEND}${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(4_000),
    });
    if ((res.status === 401 || res.status === 404) && localBackend && BACKEND !== localBackend) {
      res = await fetch(`${localBackend}${path}`, {
        next: { revalidate },
        signal: AbortSignal.timeout(4_000),
      });
    }
    if (!res.ok) return null;
    return res.json();
  } catch {
    if (localBackend && BACKEND !== localBackend) {
      try {
        const res = await fetch(`${localBackend}${path}`, {
          next: { revalidate },
          signal: AbortSignal.timeout(4_000),
        });
        if (res.ok) return res.json();
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function fetchPublicProduct(slugOrId: string) {
  return fetchBackendJson(`/seo/products/${encodeURIComponent(slugOrId)}`, 3600);
}

async function fetchInternalLinks(slugOrId: string) {
  return fetchBackendJson(
    `/seo/products/${encodeURIComponent(slugOrId)}/internal-links`,
    3600,
  );
}

async function fetchVariants(slugOrId: string) {
  return fetchBackendJson(`/seo/products/${encodeURIComponent(slugOrId)}/variants`, 3600);
}

async function fetchPublicPriceHistory(slugOrId: string) {
  return fetchBackendJson(
    `/seo/products/${encodeURIComponent(slugOrId)}/price-history?days=365`,
    1800,
  );
}

function buildPublicChartData(raw: unknown): Array<{ date: string; price: number }> {
  const histories = (raw as { histories?: Array<{ history?: Array<{ capturedAt?: string; price?: string | number }> }> } | null)?.histories ?? [];
  const byDay = new Map<string, { capturedAt: string; price: number }>();

  for (const entry of histories) {
    for (const point of entry.history ?? []) {
      if (!point.capturedAt || point.price == null) continue;
      const price = Number(point.price);
      if (!Number.isFinite(price) || price <= 0) continue;
      const day = new Date(point.capturedAt).toISOString().slice(0, 10);
      const current = byDay.get(day);
      if (!current || price < current.price) {
        byDay.set(day, { capturedAt: point.capturedAt, price });
      }
    }
  }

  return [...byDay.values()]
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
    .map((point) => ({
      date: new Date(point.capturedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      price: point.price,
    }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchPublicProduct(id);

  if (!product) {
    return { title: 'Produto | Nuvii Baby', robots: { index: false } };
  }

  const name = product.canonicalName || product.title;
  const bestOffer = product.offers?.find((o: any) => o.availability) ?? product.offers?.[0];
  const price = bestOffer ? Number(bestOffer.currentPrice ?? bestOffer.price) : null;
  const store = bestOffer?.marketplace?.name ?? '';
  const canonicalUrl = `${SITE_URL}/produto/${product.slug}`;

  const description = [
    name,
    product.brand ? `Marca: ${product.brand}` : '',
    price ? `Menor Preço: R$ ${price.toFixed(2).replace('.', ',')}` : '',
    store ? `em ${store}` : '',
    product.category ? `| ${product.category}` : '',
    '| Nuvii Baby — Monitor de preços',
  ].filter(Boolean).join(' ');

  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: `Compare preços de ${name} nas principais farmácias. Histórico de preços, Deal Score e alertas automáticos — Nuvii Baby.`,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    image: product.imageUrl ?? undefined,
    url: canonicalUrl,
  };

  if (price && bestOffer) {
    productJsonLd.offers = {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: bestOffer.marketplace?.name },
      url: bestOffer.productUrl,
    };
  }

  return {
    title: `${name} — Melhor Preço | Nuvii Baby`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${name} — Melhor Preço`,
      description,
      url: canonicalUrl,
      type: 'website',
      images: product.imageUrl ? [{ url: product.imageUrl, alt: name }] : [],
      siteName: 'Nuvii Baby',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Melhor Preço | Nuvii Baby`,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
    other: {
      'application/ld+json': JSON.stringify(productJsonLd),
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  if (UUID_RE.test(id)) {
    return <ProductPageClient />;
  }

  const [product, internalLinks, priceHistoryRaw] = await Promise.all([
    fetchPublicProduct(id),
    fetchInternalLinks(id),
    fetchPublicPriceHistory(id),
  ]);
  if (!product) notFound();

  // Fetch deal score — endpoint is now public (no auth required)
  let dealScore: { score: number; emoji: string; label: string; labelColor: string } | null = null;
  try {
    const dsData = await fetchBackendJson(`/deal-score/product/${product.id}`, 900);
    const best = dsData?.best?.score;
    if (best) dealScore = { score: best.score, emoji: best.emoji, label: best.label, labelColor: best.labelColor };
  } catch { /* non-critical */ }

  // Fetch family variants for package comparator (non-critical)
  let variants: unknown[] = [];
  if (product.productFamilySlug) {
    try {
      variants = (await fetchVariants(id)) ?? [];
    } catch { /* non-critical */ }
  }

  return (
    <PublicProductPage
      product={product}
      internalLinks={internalLinks}
      dealScore={dealScore}
      variants={variants}
      priceHistory={buildPublicChartData(priceHistoryRaw)}
    />
  );
}
