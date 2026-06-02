'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
  imageUrl?: string | null;
  variantLabel?: string | null;
  offers: Offer[];
};

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
  category,
}: {
  products: Product[];
  category: string;
}) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showUnavailable, setShowUnavailable] = useState(false);

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

  const hasFilters = brands.length > 1 || sizes.length > 1;
  const unavailableCount = products.filter((p) => p.offers.length === 0).length;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      {hasFilters && (
        <div className="rounded-lg border border-[#E4E7F2] bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Linha (brand) */}
            {brands.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#5B607C]">Linha:</span>
                <button
                  onClick={() => setSelectedBrand(null)}
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
                    onClick={() => setSelectedBrand(selectedBrand === b ? null : b)}
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

            {/* Separator */}
            {brands.length > 1 && sizes.length > 1 && (
              <div className="h-5 w-px bg-[#E4E7F2]" aria-hidden />
            )}

            {/* Tamanho (size) */}
            {sizes.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#5B607C]">Tamanho:</span>
                <button
                  onClick={() => setSelectedSize(null)}
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
                    onClick={() => setSelectedSize(selectedSize === s ? null : s)}
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

            {/* Toggle unavailable */}
            {unavailableCount > 0 && (
              <button
                onClick={() => setShowUnavailable((v) => !v)}
                className={`ml-auto rounded-full px-3 py-1 text-xs font-medium transition ${
                  showUnavailable
                    ? 'bg-[#f3f4f6] text-[#5B607C]'
                    : 'border border-dashed border-[#C9CEEA] text-[#8A8FB1] hover:border-[#5B4CF0] hover:text-[#5B4CF0]'
                }`}
              >
                {showUnavailable ? `Ocultar ${unavailableCount} indisponíveis` : `+ Mostrar ${unavailableCount} indisponíveis`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {hasFilters && (
        <p className="text-xs text-[#8A8FB1]">
          {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          {(selectedBrand || selectedSize) && (
            <button
              onClick={() => { setSelectedBrand(null); setSelectedSize(null); }}
              className="ml-2 text-[#5B4CF0] hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </p>
      )}

      {/* Product grid */}
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
            const name = p.canonicalName || p.title;
            const offerHref = bestOffer?.offerUrl || bestOffer?.productUrl || null;
            const marketplaceName = bestOffer?.marketplaceName || bestOffer?.marketplace?.name;
            return (
              <article
                key={p.id}
                className="rounded-lg border border-[#E4E7F2] bg-white p-4 shadow-sm transition hover:border-[#cdb8ef]"
              >
                <Link href={`/produto/${p.slug}`} className="block">
                  <div className="flex items-start gap-3">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={name} width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
                      : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#EEF2FF] text-2xl">📦</div>}
                    <div className="min-w-0 flex-1">
                      {index === 0 && bestPrice !== null && (
                        <span className="mb-1 inline-block rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#2f8a51]">🏆 Melhor preço</span>
                      )}
                      {p.brand && <p className="text-xs font-semibold text-[#5B4CF0]">{p.brand}</p>}
                      <h2 className="mt-0.5 line-clamp-2 text-sm font-semibold">{name}</h2>
                      {p.variantLabel && <p className="mt-0.5 text-xs text-[#5B607C]">{p.variantLabel}</p>}
                    </div>
                  </div>
                </Link>
                <div className="mt-3">
                  {pricePerUnit ? (
                    <>
                      <p className="text-xl font-black text-[#5B4CF0]">{money(pricePerUnit)}<span className="ml-1 text-xs font-semibold text-[#5B607C]">/un</span></p>
                      <p className="text-sm text-[#5B607C]">{bestPrice ? money(bestPrice) : ''} total</p>
                    </>
                  ) : bestPrice ? (
                    <p className="text-xl font-black text-[#5B4CF0]">{money(bestPrice)}</p>
                  ) : (
                    <p className="text-sm text-[#8A8FB1]">Indisponível</p>
                  )}
                  {marketplaceName && (
                    <p className="mt-1 text-xs text-[#8A8FB1]">🛒 {marketplaceName}</p>
                  )}
                </div>
                {offerHref ? (
                  <a href={offerHref} target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#5B4CF0] px-3 py-2 text-sm font-semibold text-white hover:bg-[#493BD0]">
                    Ver oferta
                  </a>
                ) : (
                  <Link href={`/produto/${p.slug}`} className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#D9DEF0] px-3 py-2 text-sm font-semibold text-[#5B607C] hover:border-[#5B4CF0] hover:text-[#5B4CF0]">
                    Ver produto
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
