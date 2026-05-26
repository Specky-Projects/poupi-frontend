import Link from 'next/link';
import { SeoInternalLinks, type SeoInternalLinkGraph } from './SeoInternalLinks';

type ProductCard = {
  id: string;
  slug: string;
  canonicalName?: string | null;
  title: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  offers?: Array<{ price: number; currentPrice?: number | null; pricePerUnit?: number | null; marketplace?: { name: string } }>;
  bestPrice?: number;
  pricePerUnit?: number | null;
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProgrammaticListingPage({
  title,
  description,
  breadcrumb,
  products,
  internalLinks,
}: {
  title: string;
  description: string;
  breadcrumb: Array<{ label: string; href?: string }>;
  products: ProductCard[];
  internalLinks?: SeoInternalLinkGraph | null;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-6 text-[#201335]">
      <div className="mx-auto max-w-5xl space-y-5">
        <nav className="text-xs text-[#675b77]">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumb.map((item, index) => (
              <li key={`${item.label}:${index}`} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden>/</span>}
                {item.href ? <Link href={item.href} className="hover:text-[#6c2bd9]">{item.label}</Link> : <span className="font-medium text-[#201335]">{item.label}</span>}
              </li>
            ))}
          </ol>
        </nav>

        <header>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-[#675b77]">{description}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => {
            const bestOffer = product.offers?.[0] ?? null;
            const price = product.bestPrice ?? (bestOffer ? Number(bestOffer.currentPrice ?? bestOffer.price) : null);
            const name = product.canonicalName || product.title;
            return (
              <Link key={product.id} href={`/produto/${product.slug}`} className="rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm transition hover:border-[#cdb8ef]">
                <div className="flex items-start gap-3">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={name} width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#f5efff] text-sm font-semibold text-[#6c2bd9]">
                      #{index + 1}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold">{name}</span>
                    {(product.brand || product.category) && (
                      <span className="mt-1 block text-xs text-[#675b77]">{[product.brand, product.category].filter(Boolean).join(' - ')}</span>
                    )}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  {price ? <p className="text-lg font-bold text-[#6c2bd9]">{money(price)}</p> : <p className="text-sm text-[#8a7f98]">Indisponivel</p>}
                  {bestOffer?.marketplace?.name && <p className="text-xs text-[#8a7f98]">{bestOffer.marketplace.name}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        <SeoInternalLinks graph={internalLinks} />
      </div>
    </main>
  );
}
