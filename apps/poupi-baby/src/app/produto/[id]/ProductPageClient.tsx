'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PriceChart } from '@/components/PriceChart';
import { AlertModal } from '@/components/AlertModal';
import { DealScoreWidget, type DealScoreData } from '@/components/DealScoreWidget';

type Offer = {
  id: string;
  price: string | number;
  currentPrice?: string | number | null;
  originalPrice?: string | number | null;
  pricePerUnit?: string | number | null;
  scrapingStatus?: string | null;
  lastValidPrice?: string | number | null;
  lastValidScrapedAt?: string | null;
  lastScrapedAt?: string | null;
  city?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  freightPrice?: string | number | null;
  productUrl: string;
  availability: boolean;
  marketplace: { name: string; logoUrl?: string | null };
};

type Product = {
  id: string;
  title: string;
  canonicalName?: string | null;
  productFamilyName?: string | null;
  productFamilySlug?: string | null;
  variantLabel?: string | null;
  measureValue?: number | null;
  measureUnit?: string | null;
  imageUrl?: string | null;
  brand?: string | null;
  category?: string | null;
  ean?: string | null;
  normalizedSize?: string | null;
  quantity?: number | null;
  unitType?: string | null;
};

type HistoryPoint = { capturedAt: string; price: string | number };

type ProductDetail = {
  product: Product;
  offers: Offer[];
  histories: { offerId: string; history: HistoryPoint[] }[];
  variants?: Array<Product & { offers: Offer[] }>;
};

type ScoreResult = {
  best: { offerId: string; marketplace: string; score: DealScoreData } | null;
  all: Array<{ offerId: string; marketplace: string; score: DealScoreData | null }>;
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const offerPrice = (offer?: Offer | null) => Number(offer?.currentPrice ?? offer?.price ?? 0);

function formatDate(iso?: string | null) {
  if (!iso) return 'sem coleta';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function normalizeProductResponse(raw: any): ProductDetail {
  if (raw?.product) {
    return {
      product: raw.product,
      offers: raw.offers ?? raw.product?.offers ?? [],
      histories: raw.histories ?? [],
      variants: raw.variants ?? [],
    };
  }

  const { offers, histories, ...product } = raw ?? {};
  return {
    product,
    offers: offers ?? [],
    histories: histories ?? [],
    variants: [],
  };
}

function bestVariantOffer(variant: { offers?: Offer[] }) {
  return variant.offers?.filter((offer) => offer.availability).sort((a, b) => offerPrice(a) - offerPrice(b))[0] ?? variant.offers?.[0] ?? null;
}

function bestValueVariant(variants: Array<Product & { offers: Offer[] }>) {
  return variants
    .map((variant) => ({ variant, offer: bestVariantOffer(variant) }))
    .filter((entry) => entry.offer?.pricePerUnit)
    .sort((a, b) => Number(a.offer?.pricePerUnit) - Number(b.offer?.pricePerUnit))[0] ?? null;
}

export function ProductPageClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<ProductDetail | null>(null);
  const [scores, setScores] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [sort, setSort] = useState<'price' | 'unit' | 'store'>('price');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Produto nao encontrado');
        return res.json();
      })
      .then((raw) => {
        const normalized = normalizeProductResponse(raw);
        const ordered = [...normalized.offers].sort((a, b) => offerPrice(a) - offerPrice(b));
        setData({ ...normalized, offers: ordered });
        setSelectedOffer(ordered[0] ?? null);
      })
      .catch((e) => setError(e.message));

    fetch(`/api/deal-score/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((s: ScoreResult | null) => setScores(s))
      .catch(() => {});
  }, [id]);

  const sortedOffers = useMemo(() => {
    const offers = [...(data?.offers ?? [])];
    return offers.sort((a, b) => {
      if (sort === 'unit') return Number(a.pricePerUnit ?? offerPrice(a)) - Number(b.pricePerUnit ?? offerPrice(b));
      if (sort === 'store') return a.marketplace.name.localeCompare(b.marketplace.name);
      return offerPrice(a) - offerPrice(b);
    });
  }, [data?.offers, sort]);

  const stats = useMemo(() => {
    const prices = (data?.offers ?? []).map((offer) => offerPrice(offer)).filter((price) => Number.isFinite(price) && price > 0);
    const available = (data?.offers ?? []).filter((offer) => offer.availability).length;
    const min = prices.length ? Math.min(...prices) : null;
    const max = prices.length ? Math.max(...prices) : null;
    return {
      min,
      max,
      available,
      spread: min !== null && max !== null ? max - min : 0,
      percent: min !== null && max !== null && max > min ? Math.round(((max - min) / max) * 100) : 0,
    };
  }, [data?.offers]);

  const chartData = useMemo(() => {
    if (!data || !selectedOffer) return [];
    const entry = data.histories.find((h) => h.offerId === selectedOffer.id);
    if (!entry) return [];
    return [...entry.history]
      .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime())
      .map((h) => ({
        date: new Date(h.capturedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        price: Number(h.price),
      }));
  }, [data, selectedOffer]);

  const activeScore = useMemo(() => {
    if (!scores || !selectedOffer) return scores?.best?.score ?? null;
    return scores.all.find((score) => score.offerId === selectedOffer.id)?.score ?? scores.best?.score ?? null;
  }, [scores, selectedOffer]);

  if (error) return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
      <div className="text-center">
        <p className="text-lg text-red-500">{error}</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-[#6c2bd9]">Voltar</button>
      </div>
    </main>
  );

  if (!data) return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c2bd9] border-t-transparent" />
    </main>
  );

  const { product } = data;
  const lowestPrice = stats.min;
  const best = sortedOffers[0] ?? null;
  const variants = data.variants ?? [];
  const valueVariant = bestValueVariant([{ ...product, offers: data.offers }, ...variants]);

  return (
    <>
      {showAlertModal && lowestPrice && (
        <AlertModal
          productId={product.id}
          productTitle={product.title}
          currentPrice={lowestPrice}
          onClose={() => setShowAlertModal(false)}
          onCreated={() => setShowAlertModal(false)}
        />
      )}

      <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#201335]">
        <div className="mx-auto max-w-6xl space-y-5">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-[#675b77] hover:text-[#201335]">
            <i className="ti ti-arrow-left" /> Voltar
          </button>

          <section className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[180px_1fr_260px] lg:items-center">
              <div className="flex justify-center rounded-lg bg-[#f8f3ff] p-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className="h-36 w-36 object-contain" />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center text-[#6c2bd9]"><i className="ti ti-package text-5xl" /></div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {product.brand && <span className="rounded-full bg-[#f5efff] px-2.5 py-1 text-[#6c2bd9]">{product.brand}</span>}
                  {product.category && <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-[#2f8a51]">{product.category}</span>}
                  {product.ean && <span className="rounded-full bg-[#f7f2ee] px-2.5 py-1 text-[#675b77]">EAN {product.ean}</span>}
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight">{product.canonicalName || product.title}</h1>
                <p className="mt-2 text-sm text-[#675b77]">
                  Acompanhamento por produto canonico: varias lojas, um historico de decisao e comparacao de preco por unidade.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  {product.productFamilyName && <span className="rounded-full bg-[#fff5d8] px-2.5 py-1 text-[#8a6316]">Familia: {product.productFamilyName}</span>}
                  {product.variantLabel && <span className="rounded-full bg-[#f7f2ee] px-2.5 py-1 text-[#675b77]">Variante: {product.variantLabel}</span>}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MiniMetric label="Menor preco" value={lowestPrice ? money(lowestPrice) : '-'} />
                  <MiniMetric label="Ofertas ativas" value={`${stats.available}/${data.offers.length}`} />
                  <MiniMetric label="Economia possivel" value={stats.spread > 0 ? money(stats.spread) : '-'} hint={stats.percent > 0 ? `${stats.percent}% entre lojas` : undefined} />
                </div>
              </div>

              <div className="rounded-lg bg-[#f5efff] p-4">
                <div className="text-sm font-medium text-[#675b77]">Melhor oferta agora</div>
                <div className="mt-2 text-3xl font-semibold text-[#6c2bd9]">{best ? money(offerPrice(best)) : '-'}</div>
                <div className="mt-1 text-sm text-[#201335]">{best?.marketplace.name ?? 'Sem loja disponivel'}</div>
                {best?.pricePerUnit && <div className="mt-1 text-xs text-[#675b77]">{money(Number(best.pricePerUnit))} por unidade</div>}
                <button onClick={() => setShowAlertModal(true)} className="mt-4 w-full rounded-lg bg-[#6c2bd9] px-4 py-2.5 text-sm font-semibold text-white">
                  Criar alerta
                </button>
              </div>
            </div>
          </section>

          {variants.length > 0 && (
            <section className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-lg font-semibold">Variantes da mesma familia</h2>
                  <p className="mt-1 text-sm text-[#675b77]">Compare embalagens e tamanhos pelo custo real, nao apenas pelo preco bruto.</p>
                </div>
                {valueVariant && (
                  <span className="rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-semibold text-[#2f8a51]">
                    melhor custo-beneficio: {valueVariant.variant.variantLabel || valueVariant.variant.canonicalName}
                  </span>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[{ ...product, offers: data.offers }, ...variants].map((variant) => {
                  const offer = bestVariantOffer(variant);
                  const isCurrent = variant.id === product.id;
                  const isBestValue = valueVariant?.variant.id === variant.id;
                  return (
                    <a key={variant.id} href={`/produto/${variant.id}`} className={`rounded-lg border p-4 transition ${isCurrent ? 'border-[#6c2bd9] bg-[#faf7ff]' : 'border-[#eadff7] hover:border-[#cdb8ef]'}`}>
                      <div className="flex items-start gap-3">
                        {variant.imageUrl ? <img src={variant.imageUrl} alt={variant.title} className="h-14 w-14 rounded-lg object-contain" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f5efff] text-[#6c2bd9]"><i className="ti ti-package text-xl" /></div>}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1">
                            {isCurrent && <span className="rounded-full bg-[#f5efff] px-2 py-0.5 text-[11px] font-semibold text-[#6c2bd9]">atual</span>}
                            {isBestValue && <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#2f8a51]">melhor valor</span>}
                          </div>
                          <h3 className="mt-2 line-clamp-2 text-sm font-semibold">{variant.variantLabel || variant.canonicalName || variant.title}</h3>
                          <p className="mt-1 text-xs text-[#675b77]">{offer?.marketplace.name ?? 'Sem loja'}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold text-[#6c2bd9]">{offer ? money(offerPrice(offer)) : '-'}</div>
                          {offer?.pricePerUnit && <div className="text-xs text-[#675b77]">{money(Number(offer.pricePerUnit))}/{variant.measureUnit === 'g' ? 'g' : variant.measureUnit === 'ml' ? 'ml' : 'un'}</div>}
                        </div>
                        {variant.measureValue && variant.measureUnit && <div className="text-xs font-medium text-[#8a7f98]">{variant.measureValue} {variant.measureUnit}</div>}
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-lg font-semibold">Comparacao entre farmacias</h2>
                  <p className="mt-1 text-sm text-[#675b77]">Ordene as ofertas e selecione uma loja para ver historico e score.</p>
                </div>
                <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-lg border border-[#eadff7] bg-white px-3 text-sm outline-none focus:border-[#6c2bd9]">
                  <option value="price">Menor preco</option>
                  <option value="unit">Preco por unidade</option>
                  <option value="store">Loja</option>
                </select>
              </div>

              <div className="space-y-3">
                {sortedOffers.length === 0 && <p className="text-sm text-[#8a7f98]">Nenhuma oferta disponivel.</p>}
                {sortedOffers.map((offer, index) => {
                  const selected = selectedOffer?.id === offer.id;
                  const score = scores?.all.find((item) => item.offerId === offer.id)?.score;
                  return (
                    <button
                      key={offer.id}
                      onClick={() => setSelectedOffer(offer)}
                      className={`w-full rounded-lg border p-4 text-left transition ${selected ? 'border-[#6c2bd9] bg-[#faf7ff]' : 'border-[#eadff7] bg-white hover:border-[#cdb8ef]'}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {index === 0 && <span className="rounded-full bg-[#e8f8ee] px-2 py-1 text-xs font-semibold text-[#2f8a51]">melhor preco</span>}
                            <span className="font-semibold">{offer.marketplace.name}</span>
                            {!offer.availability && <span className="rounded-full bg-[#fff1f1] px-2 py-1 text-xs font-semibold text-[#b13a3a]">indisponivel</span>}
                            {score && <span className="rounded-full bg-[#fff5d8] px-2 py-1 text-xs font-semibold text-[#8a6316]">score {score.score}/100</span>}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#675b77]">
                            {offer.pricePerUnit && <span>{money(Number(offer.pricePerUnit))}/un</span>}
                            {offer.originalPrice && Number(offer.originalPrice) > offerPrice(offer) && <span>de {money(Number(offer.originalPrice))}</span>}
                            {(offer.city || offer.state) && <span>{[offer.city, offer.state].filter(Boolean).join(' - ')}</span>}
                            <span>coleta: {formatDate(offer.lastValidScrapedAt ?? offer.lastScrapedAt)}</span>
                            {offer.scrapingStatus && <span>status: {offer.scrapingStatus}</span>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <div className="text-right">
                            <div className="text-xl font-semibold text-[#6c2bd9]">{money(offerPrice(offer))}</div>
                            <div className="text-xs text-[#675b77]">{Number(offer.freightPrice ?? 0) > 0 ? `frete ${money(Number(offer.freightPrice))}` : 'frete nao informado'}</div>
                          </div>
                          <a href={offer.productUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="rounded-lg bg-[#6c2bd9] px-3 py-2 text-sm font-semibold text-white">
                            Ver
                          </a>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">Historico da loja selecionada</h2>
                <p className="mt-1 text-sm text-[#675b77]">{selectedOffer?.marketplace.name ?? 'Selecione uma oferta'}</p>
                <div className="mt-4">
                  {chartData.length ? <PriceChart data={chartData} /> : <div className="rounded-lg bg-[#f7f2ee] p-6 text-center text-sm text-[#675b77]">Historico sera formado nas proximas coletas.</div>}
                </div>
              </div>

              <div className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold">Sinal de oportunidade</h2>
                <DealScoreWidget data={activeScore} />
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function MiniMetric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-[#eadff7] bg-[#fffdf9] p-3">
      <div className="text-xs font-medium text-[#675b77]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-[#8a7f98]">{hint}</div>}
    </div>
  );
}
