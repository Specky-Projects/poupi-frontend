import { ProgrammaticListingPage } from './ProgrammaticListingPage';

export type ProgrammaticSeoPayload = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: { index: boolean; follow: boolean };
  products: Array<{
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
  }>;
  internalLinks?: any;
  content: Array<{ type: string; title: string; body: string; facts: Record<string, unknown> }>;
  jsonLd?: Record<string, unknown>;
};

export function ProgrammaticSeoPage({ payload, breadcrumb }: { payload: ProgrammaticSeoPayload; breadcrumb: Array<{ label: string; href?: string }> }) {
  return (
    <>
      {payload.jsonLd &&
        Object.entries(payload.jsonLd).map(([key, value]) => (
          <script key={key} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }} />
        ))}
      <ProgrammaticListingPage
        title={payload.title}
        description={payload.description}
        breadcrumb={breadcrumb}
        products={payload.products}
        internalLinks={payload.internalLinks}
      />
      {payload.content.length > 0 && (
        <section className="bg-[#fbfaf7] px-4 pb-8 text-[#201335]">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {payload.content.map((block) => (
              <article key={`${block.type}:${block.title}`} className="rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">{block.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#675b77]">{block.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
