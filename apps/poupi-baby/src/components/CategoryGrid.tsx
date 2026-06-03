'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resolveUnit, formatPricePerUnit } from '@/lib/unit-label';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function scoreDecision(score: number): { badge: string; label: string; color: string; bg: string } {
  if (score >= 90) return { badge: '🔥', label: 'Oferta Forte', color: '#d97706', bg: '#fef3c7' };
  if (score >= 80) return { badge: '🟢', label: 'Comprar Agora', color: '#2f8a51', bg: '#e8f8ee' };
  if (score >= 70) return { badge: '🟢', label: 'Boa Oferta', color: '#2f8a51', bg: '#e8f8ee' };
  if (score >= 50) return { badge: '🟡', label: 'Vale Monitorar', color: '#92720a', bg: '#fef9e7' };
  return { badge: '⏳', label: 'Melhor Esperar', color: '#b13a3a', bg: '#fff1f1' };
}

function scoreRecommendation(score: number): string {
  if (score >= 80) return 'Eu aproveitaria essa oferta.';
  if (score >= 70) return 'Esse preço está melhor do que costumamos encontrar.';
  if (score >= 50) return 'Se não tiver urgência, vale acompanhar mais alguns dias.';
  return 'Já vimos preços melhores para este produto.';
}

type Offer = {
  price: number;
  currentPrice?: number | null;
  pricePerUnit?: number | null;
  productUrl?: string | null;
  offerUrl?: string | null;
  marketplaceName?: string | null;
  marketplace: { name: string };
};

type Product = {
  id: string;
  slug: string;
  canonicalName?: string | null;
  title: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  variantLabel?: string | null;
  offers: Offer[];
};

type ScoreBadge = { score: number; emoji: string; label?: string; labelColor?: string } | null;

function extractSize(variantLabel: string | null | undefined): string | null {
  if (!variantLabel) return null;
  const parts = variantLabel.split(' - ');
  if (parts.length >= 2) return parts[0].trim();
  return null;
}

const SIZE_ORDER = ['RN', 'P', 'M', 'G', 'XG', 'XXG', 'XXXG'];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function CategoryGrid({
  products,
}: {
  products: Product[];
  category: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get('marca');
  const selectedSize = searchParams.get('tamanho');
  const showUnavailable = searchParams.get('indisponiveis') === '1';
  const [scores, setScores] = useState<Record<string, ScoreBadge>>({});

  function setFilter(next: { brand?: string | null; size?: string | null; unavailable?: boolean | null }) {
    const params = new URLSearchParams(searchParams.toString());
    if ('brand' in next) {
      if (next.brand) params.set('marca', next.brand);
      else params.delete('marca');
    }
    if ('size' in next) {
      if (next.size) params.set('tamanho', next.size);
      else params.delete('tamanho');
    }
    if ('unavailable' in next) {
      if (next.unavailable) params.set('indisponiveis', '1');
      else params.delete('indisponiveis');
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const { brands, sizes } = useMemo(() => {
    const brandSet = new Set<string>();
    const sizeSet = new Set<string>();
    for (const p of products) {
      if (p.brand) brandSet.add(p.brand);
      const s = extractSize(p.variantLabel);
      if (s) sizeSet.add(s);
    }
    return {
      brands: [...brandSet].sort(),
      sizes: sortSizes([...sizeSet]),
    };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const hasOffer = p.offers.length > 0;
      if (!showUnavailable && !hasOffer) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (selectedSize && extractSize(p.variantLabel) !== selectedSize) return false;
      return true;
    });
  }, [products, selectedBrand, selectedSize, showUnavailable]);

  useEffect(() => {
    const candidates = filtered.filter((product) => product.offers.length > 0).slice(0, 24);
    if (!candidates.length) {
      setScores({});
      return;
    }

    let cancelled = false;
    Promise.all(
      candidates.map(async (product) => {
        try {
          const res = await fetch(`/api/deal-score/${product.id}`);
          if (!res.ok) return [product.id, null] as const;
          const data = await res.json();
          const best = data?.best?.score;
          if (!best) return [product.id, null] as const;
          return [product.id, {
            score: Number(best.score),
            emoji: String(best.emoji ?? ''),
            label: best.label ? String(best.label) : undefined,
            labelColor: best.labelColor ? String(best.labelColor) : undefined,
          }] as const;
        } catch {
          return [product.id, null] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setScores(Object.fromEntries(entries));
    });

    return () => {
      cancelled = true;
    };
  }, [filtered]);

  const hasFilters = brands.length > 1 || sizes.length > 1;
  const unavailableCount = products.filter((p) => p.offers.length === 0).length;

  return (
    <div className="space-y-4">
      {hasFilters && (
        <div className="rounded-lg border border-[#E4E7F2] bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {brands.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#5B607C]">
                  <i className="ti ti-tag mr-1" />Marca:
                </span>
                <button
                  onClick={() => setFilter({ brand: null })}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    selectedBrand === null
                      ? 'bg-[#5B4CF0] text-white'
                      : 'border border-[#E4E7F2] text-[#5B607C] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                  }`}
                >
                  Todas
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilter({ brand: selectedBrand === b ? null : b })}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      selectedBrand === b
                        ? 'bg-[#5B4CF0] text-white'
                        : 'border border-[#E4E7F2] text-[#5B607C] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {brands.length > 1 && sizes.length > 1 && (
              <div className="h-5 w-px bg-[#E4E7F2]" aria-hidden />
            )}

            {sizes.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#5B607C]">
                  <i className="ti ti-ruler-2 mr-1" />Tamanho:
                </span>
                <button
                  onClick={() => setFilter({ size: null })}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                    selectedSize === null
                      ? 'bg-[#5B4CF0] text-white'
                      : 'border border-[#E4E7F2] text-[#5B607C] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                  }`}
                >
                  Todos
                </button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter({ size: selectedSize === s ? null : s })}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                      selectedSize === s
                        ? 'bg-[#5B4CF0] text-white'
                        : 'border border-[#E4E7F2] text-[#5B607C] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {unavailableCount > 0 && (
              <button
                onClick={() => setFilter({ unavailable: !showUnavailable })}
                className={`ml-auto rounded-full px-3 py-1 text-xs font-medium transition ${
                  showUnavailable
                    ? 'bg-[#f3f4f6] text-[#5B607C]'
                    : 'border border-dashed border-[#C9CEEA] text-[#8A8FB1] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                }`}
              >
                <i className={`ti ${showUnavailable ? 'ti-eye-off' : 'ti-eye'} mr-1`} />
                {showUnavailable ? `Ocultar ${unavailableCount} indisponiveis` : `Mostrar ${unavailableCount} indisponiveis`}
              </button>
            )}
          </div>
        </div>
      )}

      {hasFilters && (
        <p className="text-xs text-[#8A8FB1]">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          {(selectedBrand || selectedSize || showUnavailable) && (
            <button
              onClick={() => setFilter({ brand: null, size: null, unavailable: null })}
              className="ml-2 text-[#5B4CF0] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-[#E4E7F2] bg-white p-8 text-center text-sm text-[#8A8FB1]">
          Nenhum produto encontrado para os filtros selecionados.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, index) => {
            const bestOffer = p.offers[0] ?? null;
            const bestPrice = bestOffer ? Number(bestOffer.currentPrice ?? bestOffer.price) : null;
            const pricePerUnit = bestOffer?.pricePerUnit ? Number(bestOffer.pricePerUnit) : null;
            const unit = resolveUnit({ category: p.category, title: p.title, variantLabel: p.variantLabel });
            const name = p.canonicalName || p.title;
            const score = bestPrice !== null ? scores[p.id] : null;
            const decision = score ? scoreDecision(score.score) : null;
            const recommendation = score ? scoreRecommendation(score.score) : null;
            const isTopDeal = !!score && score.score >= 80;
            return (
              <article
                key={p.id}
                className="flex h-full flex-col rounded-lg border bg-white p-4 shadow-sm transition"
                style={isTopDeal && decision ? {
                  borderColor: decision.color + '55',
                } : { borderColor: '#E4E7F2' }}
              >
                <Link href={`/produto/${p.slug}`} className="block flex-1">
                  {/* Decision badge — primeira coisa visível */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {decision ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: decision.bg, color: decision.color }}
                      >
                        {decision.badge} {decision.label} · {score?.score}/100
                      </span>
                    ) : (
                      <span className="inline-block h-[22px] w-20 animate-pulse rounded-full bg-[#F2F4FF]" />
                    )}
                    {index === 0 && bestPrice !== null && !decision && (
                      <span className="inline-block rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#2f8a51]">
                        Menor preço da lista
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={name} width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF]">
                        <i className="ti ti-package text-2xl text-[#5B4CF0]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {p.brand && <p className="text-xs font-semibold text-[#5B4CF0]">{p.brand}</p>}
                      <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold">{name}</h2>
                      {p.variantLabel && <p className="mt-0.5 text-xs text-[#5B607C]">{p.variantLabel}</p>}
                    </div>
                  </div>

                  {/* Recomendação em linguagem humana */}
                  {recommendation && (
                    <p className="mt-2 text-xs" style={{ color: decision?.color ?? '#5B607C' }}>
                      {recommendation}
                    </p>
                  )}

                  <div className="mt-3">
                    {pricePerUnit ? (
                      <>
                        <p className="text-xl font-black text-[#5B4CF0]">
                          {formatPricePerUnit(pricePerUnit, unit)}
                        </p>
                        <p className="text-sm text-[#5B607C]">{bestPrice ? `${money(bestPrice)} total` : ''}</p>
                      </>
                    ) : bestPrice ? (
                      <p className="text-xl font-black text-[#5B4CF0]">{money(bestPrice)}</p>
                    ) : (
                      <p className="text-sm text-[#8A8FB1]">Indisponível</p>
                    )}
                  </div>
                </Link>

                <Link href={`/produto/${p.slug}`} className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#5B4CF0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#493BD0]">
                  Comparar e decidir
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
