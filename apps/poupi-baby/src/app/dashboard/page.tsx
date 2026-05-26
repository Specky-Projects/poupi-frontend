'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

type Offer = {
  id: string;
  price: string | number;
  currentPrice?: string | number | null;
  originalPrice?: string | number | null;
  pricePerUnit?: string | number | null;
  scrapingStatus?: string | null;
  lastValidScrapedAt?: string | null;
  city?: string | null;
  state?: string | null;
  availability: boolean;
  marketplace?: { name: string };
};

type Product = {
  id: string;
  title: string;
  imageUrl?: string;
  category?: string | null;
  offers: Offer[];
};

type AlertItem = {
  id: string;
  targetPrice: string | number;
  active: boolean;
  product: { id: string; title: string };
};

type Quota = {
  plan: string;
  planName?: string;
  current: number;
  max: number;
  unlimited: boolean;
  atLimit: boolean;
};

type BillingStatus = {
  currentPlan?: string;
  plan?: string;
  planName?: string;
  daysRemaining?: number | null;
};

type Profile = {
  name?: string;
  email?: string;
  emailVerified?: boolean;
};

const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const offerPrice = (offer?: Offer | null) => Number(offer?.currentPrice ?? offer?.price ?? 0);

function bestOffer(product: Product) {
  return product.offers?.filter((o) => o.availability).sort((a, b) => offerPrice(a) - offerPrice(b))[0] ?? product.offers?.[0];
}

function productDiscount(product: Product) {
  const prices = product.offers?.map((o) => offerPrice(o)).filter((p) => Number.isFinite(p) && p > 0) ?? [];
  if (prices.length < 2) return 0;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return max > min ? Math.round(((max - min) / max) * 100) : 0;
}

function productSavings(product: Product) {
  const prices = product.offers?.map((o) => offerPrice(o)).filter((p) => Number.isFinite(p) && p > 0) ?? [];
  if (prices.length < 2) return 0;
  return Math.max(...prices) - Math.min(...prices);
}

function offerStores(product: Product) {
  return Array.from(new Set(product.offers?.map((o) => o.marketplace?.name).filter(Boolean) as string[]));
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'discount' | 'price' | 'recent'>('discount');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [productRes, alertRes, quotaRes, billingRes, accountRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/alerts'),
      fetch('/api/products/quota'),
      fetch('/api/billing/status'),
      fetch('/api/account'),
    ]);
    if (productRes.ok) setProducts(await productRes.json());
    if (alertRes.ok) setAlerts(await alertRes.json());
    if (quotaRes.ok) setQuota(await quotaRes.json());
    if (billingRes.ok) setBilling(await billingRes.json());
    if (accountRes.ok) setProfile(await accountRes.json());
  }

  useEffect(() => { refresh(); }, []);

  async function addProduct() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data?.error || data?.message || 'Nao foi possivel adicionar o produto.');
      return;
    }
    setUrl('');
    await refresh();
  }

  async function removeProduct(productId: string) {
    if (!confirm('Remover este produto da sua lista?')) return;
    const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      await refresh();
    }
  }

  const activeAlerts = alerts.filter((a) => a.active);
  const storeCount = useMemo(() => {
    const stores = new Set<string>();
    products.forEach((p) => p.offers?.forEach((o) => o.marketplace?.name && stores.add(o.marketplace.name)));
    return stores.size;
  }, [products]);
  const displayName = profile?.name || session?.user?.name || '';
  const greeting = displayName ? `Ola, ${displayName.split(' ')[0]}` : 'Ola';

  const sortedProducts = useMemo(() => {
    const filtered = products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sort === 'price') return offerPrice(bestOffer(a)) - offerPrice(bestOffer(b));
      if (sort === 'discount') return productDiscount(b) - productDiscount(a);
      return 0;
    });
  }, [products, query, sort]);

  const planName = billing?.planName || quota?.planName || quota?.plan || billing?.currentPlan || 'Free';
  const daysRemaining = billing?.daysRemaining;
  const offerCount = products.reduce((sum, product) => sum + (product.offers?.length ?? 0), 0);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#201335]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm">
            <div className="text-2xl font-semibold text-[#6c2bd9]">Poupi <span className="text-[#58bd7a]">baby</span></div>
            <nav className="mt-6 grid gap-1 text-sm font-medium">
              <Link className="rounded-lg bg-[#f5efff] px-3 py-2 text-[#6c2bd9]" href="/dashboard"><i className="ti ti-layout-dashboard mr-2" />Inicio</Link>
              <a className="rounded-lg px-3 py-2 text-[#675b77] hover:bg-[#f7f2ee]" href="#produtos"><i className="ti ti-tags mr-2" />Produtos</a>
              <Link className="rounded-lg px-3 py-2 text-[#675b77] hover:bg-[#f7f2ee]" href="/alertas"><i className="ti ti-bell mr-2" />Alertas</Link>
              <Link className="rounded-lg px-3 py-2 text-[#675b77] hover:bg-[#f7f2ee]" href="/billing"><i className="ti ti-crown mr-2" />Planos</Link>
              <Link className="rounded-lg px-3 py-2 text-[#675b77] hover:bg-[#f7f2ee]" href="/conta"><i className="ti ti-user-circle mr-2" />Conta</Link>
              {session?.user?.role === 'admin' && <Link className="rounded-lg px-3 py-2 text-[#675b77] hover:bg-[#f7f2ee]" href="/admin/dashboard"><i className="ti ti-shield-lock mr-2" />Admin</Link>}
            </nav>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-6 w-full rounded-lg border border-[#eadff7] px-3 py-2 text-sm font-medium text-[#675b77] hover:bg-[#f7f2ee]">Sair</button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="rounded-lg bg-[#6c2bd9] p-6 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm text-white/75">{displayName ? 'Que bom ter voce por aqui.' : 'Atualize seu perfil para personalizar sua experiencia.'}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">{greeting} <span aria-hidden>👋</span></h1>
                {!profile?.emailVerified && (
                  <Link href="/conta" className="mt-4 inline-flex rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white">
                    Confirme seu e-mail para garantir o recebimento dos alertas de preco.
                  </Link>
                )}
              </div>
              <div className="rounded-lg bg-white/14 p-4">
                <div className="text-sm text-white/75">Plano atual</div>
                <div className="mt-1 text-2xl font-semibold">{planName}</div>
                <div className="mt-1 text-sm text-white/80">
                  {typeof daysRemaining === 'number' ? `${daysRemaining} dias de Premium restantes` : 'Plano gratuito ativo'}
                </div>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            <Metric label="Produtos monitorados" value={products.length} hint={quota?.unlimited ? 'Ilimitado no seu plano' : quota ? `${Math.max(0, quota.max - quota.current)} espacos restantes` : 'Monitorados por voce'} icon="ti-package" />
            <Metric label="Ofertas comparadas" value={offerCount} hint="Farmacias e lojas vinculadas" icon="ti-tags" />
            <Metric label="Lojas cobertas" value={storeCount} hint="Quantidade real nas suas ofertas" icon="ti-building-store" />
            <Metric label="Premium" value={typeof daysRemaining === 'number' ? daysRemaining : '-'} hint={typeof daysRemaining === 'number' ? 'dias restantes' : `${activeAlerts.length} alertas ativos`} icon="ti-crown" />
          </div>

          <section className="mt-5 rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                className="h-12 flex-1 rounded-lg border border-[#eadff7] px-4 text-sm outline-none focus:border-[#6c2bd9]"
                placeholder="Cole a URL do produto ou agregador para comparar lojas"
              />
              <button onClick={addProduct} disabled={loading} className="rounded-lg bg-[#6c2bd9] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {loading ? 'Comparando...' : 'Monitorar produto'}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#8a7f98]">Se o link trouxer varias farmacias, a Poupi Baby salva uma unica ficha do produto com todas as ofertas encontradas.</p>
            {error && <div className="mt-3 rounded-lg border border-[#f0a5a5] bg-[#fff1f1] px-4 py-3 text-sm text-[#9f2828]">{error}</div>}
          </section>

          <section id="produtos" className="mt-5 rounded-lg border border-[#eadff7] bg-white shadow-sm">
            <div className="border-b border-[#eadff7] p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <h2 className="text-xl font-semibold">Central de oportunidades</h2>
                  <p className="mt-1 text-sm text-[#675b77]">Produtos unificados com melhor preco, lojas monitoradas e economia entre ofertas.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 rounded-lg border border-[#eadff7] px-3 text-sm outline-none focus:border-[#6c2bd9]" placeholder="Filtrar produtos" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-lg border border-[#eadff7] bg-white px-3 text-sm">
                    <option value="discount">Maior economia</option>
                    <option value="price">Menor preco</option>
                    <option value="recent">Recentes</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#f1e9fb]">
              {sortedProducts.length === 0 ? (
                <div className="p-10 text-center text-sm text-[#8a7f98]">Nenhuma oportunidade encontrada. Adicione um produto para comecar.</div>
              ) : sortedProducts.map((product) => {
                const offer = bestOffer(product);
                const discount = productDiscount(product);
                const savings = productSavings(product);
                const stores = offerStores(product);
                const availableOffers = product.offers?.filter((o) => o.availability).length ?? 0;
                return (
                  <article key={product.id} className="flex flex-col gap-4 p-4 transition hover:bg-[#fffcf7] md:flex-row md:items-center">
                    <Link href={`/produto/${product.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.title} className="h-16 w-16 rounded-lg object-contain" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f5efff] text-[#6c2bd9]"><i className="ti ti-package text-2xl" /></div>}
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.title}</h3>
                        <p className="mt-1 truncate text-xs text-[#675b77]">{stores.join(' • ') || 'Sem ofertas ativas'}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {discount > 0 && <span className="rounded-full bg-[#e8f8ee] px-2.5 py-1 text-xs font-semibold text-[#2f8a51]">{discount}% abaixo da maior oferta</span>}
                          {savings > 0 && <span className="rounded-full bg-[#fff5d8] px-2.5 py-1 text-xs font-semibold text-[#8a6316]">economia ate {money(savings)}</span>}
                          <span className="rounded-full bg-[#f5efff] px-2.5 py-1 text-xs font-semibold text-[#6c2bd9]">{availableOffers}/{product.offers?.length ?? 0} ofertas ativas</span>
                          {offer?.pricePerUnit && <span className="rounded-full bg-[#f7f2ee] px-2.5 py-1 text-xs font-semibold text-[#675b77]">{money(Number(offer.pricePerUnit))}/un</span>}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="text-right">
                        <div className="text-xs font-medium text-[#2f8a51]">melhor preco</div>
                        <div className="text-lg font-semibold">{offer ? money(offerPrice(offer)) : '-'}</div>
                        <div className="text-xs text-[#675b77]">{offer?.marketplace?.name ?? 'Sem loja'}</div>
                      </div>
                      <button onClick={() => removeProduct(product.id)} className="rounded-lg border border-[#f2dada] px-3 py-2 text-sm font-medium text-[#b13a3a] hover:bg-[#fff1f1]">Remover</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <footer className="mt-8 flex flex-wrap gap-4 pb-4 text-sm text-[#675b77]">
            <Link href="/faq" className="hover:text-[#6c2bd9]">FAQ</Link>
            <Link href="/privacidade" className="hover:text-[#6c2bd9]">Politica de Privacidade</Link>
            <Link href="/termos" className="hover:text-[#6c2bd9]">Termos de Uso</Link>
          </footer>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, hint, icon }: { label: string; value: number | string; hint: string; icon: string }) {
  return (
    <div className="rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-[#675b77]"><i className={`ti ${icon} text-[#6c2bd9]`} />{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-[#201335]">{value}</div>
      <div className="mt-1 text-xs text-[#8a7f98]">{hint}</div>
    </div>
  );
}
