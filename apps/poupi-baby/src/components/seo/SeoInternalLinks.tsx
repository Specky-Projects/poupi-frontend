type SeoInternalLink = {
  type: string;
  title: string;
  href: string;
  reason: string;
  score: number;
  imageUrl?: string | null;
  price?: number | null;
  marketplace?: string | null;
};

type SeoLinkWidget = {
  id: string;
  title: string;
  links: SeoInternalLink[];
};

export type SeoInternalLinkGraph = {
  pageType: string;
  slug: string;
  linkCount: number;
  orphanRisk: 'low' | 'medium' | 'high';
  widgets: SeoLinkWidget[];
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function SeoInternalLinks({ graph }: { graph?: SeoInternalLinkGraph | null }) {
  if (!graph?.widgets?.length) return null;

  return (
    <section className="space-y-4">
      {graph.widgets.map((widget) => (
        <div key={widget.id} className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">{widget.title}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {widget.links.slice(0, 9).map((link) => (
              <Link
                key={`${widget.id}:${link.href}`}
                href={link.href}
                className="group flex min-h-20 gap-3 rounded-lg border border-[#f0e8fa] bg-[#fffdf9] p-3 transition hover:border-[#cdb8ef]"
              >
                {link.imageUrl ? (
                  <img src={link.imageUrl} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-md object-contain" />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#f5efff] text-xs font-semibold text-[#6c2bd9]">
                    {link.type}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-semibold text-[#201335] group-hover:text-[#6c2bd9]">
                    {link.title}
                  </span>
                  {link.price !== null && link.price !== undefined && (
                    <span className="mt-1 block text-sm font-bold text-[#6c2bd9]">{money(link.price)}</span>
                  )}
                  {link.marketplace && <span className="mt-0.5 block text-xs text-[#675b77]">{link.marketplace}</span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
import Link from 'next/link';
