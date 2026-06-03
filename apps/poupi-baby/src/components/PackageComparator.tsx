'use client';

import Link from 'next/link';
import { resolveUnit, formatPricePerUnit } from '@/lib/unit-label';

type Variant = {
  id: string;
  slug: string;
  title: string;
  canonicalName?: string | null;
  variantLabel?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  offers: Array<{
    price: unknown;
    currentPrice: unknown;
    pricePerUnit: unknown;
    marketplace?: { name?: string | null } | null;
  }>;
};

function extractSize(variantLabel: string | null | undefined): string | null {
  if (!variantLabel) return null;
  const parts = variantLabel.split(' - ');
  return parts.length >= 2 ? parts[0].trim() : null;
}

function extractQty(variantLabel: string | null | undefined): number | null {
  if (!variantLabel) return null;
  const m = variantLabel.match(/(\d+)\s*(?:unidades|un|g|ml|lencos?|lenços?)?/i);
  return m ? parseInt(m[1], 10) : null;
}

function bestPrice(variant: Variant): number | null {
  const o = variant.offers[0];
  if (!o) return null;
  const v = Number(o.currentPrice ?? o.price ?? 0);
  return v > 0 ? v : null;
}

function bestPricePerUnit(variant: Variant): number | null {
  const o = variant.offers[0];
  if (!o || o.pricePerUnit == null) return null;
  const v = Number(o.pricePerUnit);
  return v > 0 ? v : null;
}

function buildComparableGroups(currentId: string, variants: Variant[]): Variant[][] {
  const bySize = new Map<string, Variant[]>();
  for (const v of variants) {
    const size = extractSize(v.variantLabel) ?? '__no_size__';
    if (!bySize.has(size)) bySize.set(size, []);
    bySize.get(size)!.push(v);
  }

  const groups: Variant[][] = [];
  for (const group of bySize.values()) {
    if (group.length < 2) continue;
    if (!group.some((v) => v.id === currentId)) continue;
    const withPrice = group.filter((v) => bestPricePerUnit(v) !== null);
    if (withPrice.length < 2) continue;
    groups.push(withPrice);
  }
  return groups;
}

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function PackageComparator({
  currentId,
  variants,
  category,
  title,
}: {
  currentId: string;
  variants: Variant[];
  category?: string | null;
  title?: string | null;
}) {
  const groups = buildComparableGroups(currentId, variants);
  if (groups.length === 0) return null;

  const unit = resolveUnit({ category, title });

  return (
    <section className="rounded-lg border border-[#E4E7F2] bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Comparador de pacotes</h2>
      <p className="mt-1 mb-4 text-sm text-[#5B607C]">
        Mesmo produto e tamanho, quantidades diferentes. Veja qual pacote entrega melhor custo por {unit}.
      </p>

      {groups.map((group, gi) => {
        const sorted = [...group].sort((a, b) => {
          const pa = bestPricePerUnit(a) ?? Infinity;
          const pb = bestPricePerUnit(b) ?? Infinity;
          return pa - pb;
        });
        const bestId = sorted[0]?.id;
        const bestUnitPrice = bestPricePerUnit(sorted[0]) ?? null;
        const highestUnitPrice = sorted
          .map(bestPricePerUnit)
          .filter((price): price is number => price !== null)
          .sort((a, b) => b - a)[0] ?? null;

        return (
          <div key={gi} className="space-y-2">
            {sorted.map((v) => {
              const ppu = bestPricePerUnit(v);
              const total = bestPrice(v);
              const isBest = v.id === bestId;
              const isCurrent = v.id === currentId;
              const qty = extractQty(v.variantLabel);
              const marketplace = v.offers[0]?.marketplace?.name ?? null;
              const name = v.canonicalName || v.title;
              const unitDiff = ppu !== null && bestUnitPrice !== null ? ppu - bestUnitPrice : null;
              const percentDiff = ppu !== null && bestUnitPrice !== null && ppu > bestUnitPrice
                ? Math.round(((ppu - bestUnitPrice) / ppu) * 100)
                : 0;
              const totalDiff = unitDiff !== null && qty !== null ? unitDiff * qty : null;
              const bestSavings = isBest && highestUnitPrice !== null && bestUnitPrice !== null && highestUnitPrice > bestUnitPrice
                ? Math.round(((highestUnitPrice - bestUnitPrice) / highestUnitPrice) * 100)
                : 0;

              return (
                <div
                  key={v.id}
                  className={`rounded-lg border p-3 transition ${
                    isBest
                      ? 'border-[#2f8a51] bg-[#f3fbf6]'
                      : isCurrent
                        ? 'border-[#5B4CF0] bg-[#faf7ff]'
                        : 'border-[#E4E7F2] hover:border-[#cdb8ef]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isBest && (
                          <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#2f8a51]">
                            Melhor custo
                          </span>
                        )}
                        {isCurrent && (
                          <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#5B4CF0]">
                            Este pacote
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm font-semibold">{name}</p>
                      {qty !== null && (
                        <p className="text-xs text-[#5B607C]">{qty} {unit}{qty !== 1 ? 's' : ''}</p>
                      )}
                      {marketplace && (
                        <p className="text-xs text-[#8A8FB1]">{marketplace}</p>
                      )}
                      {isBest && bestSavings > 0 && (
                        <p className="mt-1 text-xs font-semibold text-[#2f8a51]">
                          Economiza ate {bestSavings}% por {unit} contra o pacote mais caro.
                        </p>
                      )}
                      {!isBest && percentDiff > 0 && unitDiff !== null && (
                        <p className="mt-1 text-xs text-[#8A8FB1]">
                          {percentDiff}% mais caro por {unit} ({formatPricePerUnit(unitDiff, unit)} a mais)
                          {totalDiff !== null ? `, ${money(totalDiff)} nesta embalagem` : ''}.
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {ppu !== null && (
                        <p className={`text-base font-bold ${isBest ? 'text-[#2f8a51]' : 'text-[#5B4CF0]'}`}>
                          {formatPricePerUnit(ppu, unit)}
                        </p>
                      )}
                      {total !== null && (
                        <p className="text-xs text-[#5B607C]">{money(total)} total</p>
                      )}
                      {!isCurrent && (
                        <Link
                          href={`/produto/${v.slug}`}
                          className="mt-1 inline-block text-xs text-[#5B4CF0] hover:underline"
                        >
                          Ver
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
