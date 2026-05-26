'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Plan = {
  id: string;
  name: string;
  priceBrl: number;
  description: string;
  highlight?: boolean;
};

type BillingStatus = {
  currentPlan?: string;
  planName?: string;
  subscriptionId?: string;
  status?: string;
  expiresAt?: string | null;
  daysRemaining?: number | null;
  availablePlans?: Plan[];
};

const FALLBACK_PLANS: Plan[] = [
  { id: 'free', name: 'Free', priceBrl: 0, description: 'Para começar a acompanhar preços.' },
  { id: 'plus', name: 'Plus', priceBrl: 14.9, description: 'Mais produtos, alertas ilimitados e histórico ampliado.', highlight: true },
  { id: 'pro', name: 'Pro', priceBrl: 39.9, description: 'Recursos avançados para quem acompanha muitas compras.' },
];

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    const res = await fetch('/api/billing/status');
    if (res.ok) setStatus(await res.json());
  }

  useEffect(() => { loadStatus(); }, []);

  async function subscribe(planId: string) {
    if (planId === 'free') return;
    setLoadingPlan(planId);
    setError(null);
    setMessage(null);
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoadingPlan(null);
    if (!res.ok) {
      setError(data?.error || data?.message || 'Não foi possível iniciar a assinatura.');
      return;
    }
    if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    else {
      setMessage('Assinatura ativada com sucesso.');
      await loadStatus();
    }
  }

  async function cancel() {
    if (!confirm('Cancelar sua assinatura? O acesso permanece até o fim do período pago.')) return;
    setError(null);
    const res = await fetch('/api/billing/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: status?.subscriptionId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || data?.message || 'Não foi possível cancelar.');
      return;
    }
    setMessage('Assinatura cancelada. Seu acesso permanece até o fim do período.');
    await loadStatus();
  }

  const currentPlan = status?.currentPlan ?? 'free';
  const plans = status?.availablePlans?.length ? status.availablePlans : FALLBACK_PLANS;
  const days = status?.daysRemaining;

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#201335]">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-medium text-[#6c2bd9]">Voltar ao painel</Link>
        <header className="mt-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#eadff7]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Planos Poupi Baby</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#675b77]">Escolha o nível de acompanhamento ideal para economizar com menos esforço.</p>
            </div>
            <div className="rounded-lg bg-[#f5efff] p-4 text-[#3a176e]">
              <div className="text-sm">Seu plano atual</div>
              <div className="mt-1 text-2xl font-semibold">{status?.planName ?? currentPlan}</div>
              <div className="mt-1 text-sm">{typeof days === 'number' ? `${days} dias de Premium restantes` : 'Sem Premium ativo'}</div>
            </div>
          </div>
        </header>

        {message && <div className="mt-5 rounded-lg border border-[#87cfa2] bg-[#eefaf2] px-4 py-3 text-sm text-[#21633c]">{message}</div>}
        {error && <div className="mt-5 rounded-lg border border-[#f0a5a5] bg-[#fff1f1] px-4 py-3 text-sm text-[#9f2828]">{error}</div>}

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            return (
              <article key={plan.id} className={`relative rounded-lg border bg-white p-5 shadow-sm ${isCurrent ? 'border-[#6c2bd9] ring-2 ring-[#eadff7]' : 'border-[#eadff7]'} ${plan.highlight ? 'lg:-mt-3' : ''}`}>
                {plan.highlight && <span className="absolute right-4 top-4 rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-semibold text-[#2f8a51]">Mais escolhido</span>}
                {isCurrent && <span className="absolute left-4 top-4 rounded-full bg-[#f5efff] px-3 py-1 text-xs font-semibold text-[#6c2bd9]">Plano atual</span>}
                <div className="pt-8">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-2 min-h-10 text-sm text-[#675b77]">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-3xl font-semibold">{plan.priceBrl === 0 ? 'Grátis' : plan.priceBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    {plan.priceBrl > 0 && <span className="text-sm text-[#675b77]">/mês</span>}
                  </div>
                  <ul className="mt-6 grid gap-3 text-sm text-[#3d314f]">
                    {(plan.id === 'free'
                      ? ['Até 10 produtos', '1 alerta ativo', 'Histórico de 7 dias']
                      : plan.id === 'plus'
                      ? ['Até 200 produtos', 'Alertas ilimitados', 'Histórico de 90 dias', 'Prioridade de sincronização']
                      : ['Produtos ilimitados', 'Alertas ilimitados', 'Histórico completo', 'Recursos avançados']
                    ).map((item) => <li key={item}><i className="ti ti-check mr-2 text-[#58bd7a]" />{item}</li>)}
                  </ul>
                  <button
                    onClick={() => subscribe(plan.id)}
                    disabled={isCurrent || loadingPlan === plan.id}
                    className={`mt-7 w-full rounded-lg px-4 py-3 text-sm font-semibold ${isCurrent ? 'border border-[#58bd7a] bg-white text-[#2f8a51]' : 'bg-[#6c2bd9] text-white'} disabled:opacity-70`}
                  >
                    {isCurrent ? 'Plano atual' : loadingPlan === plan.id ? 'Processando...' : plan.id === 'free' ? 'Plano gratuito' : `Assinar ${plan.name}`}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {currentPlan !== 'free' && (
          <section className="mt-6 rounded-lg border border-[#eadff7] bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-semibold">Gerenciar assinatura</h2>
                <p className="mt-1 text-sm text-[#675b77]">
                  {status?.expiresAt ? `Seu acesso atual vai até ${new Date(status.expiresAt).toLocaleDateString('pt-BR')}.` : 'Você possui uma assinatura ativa.'}
                </p>
              </div>
              <button onClick={cancel} className="rounded-lg border border-[#f2dada] px-4 py-2 text-sm font-semibold text-[#b13a3a] hover:bg-[#fff1f1]">Cancelar assinatura</button>
            </div>
          </section>
        )}
        <footer className="mt-8 flex flex-wrap gap-4 text-sm text-[#675b77]">
          <Link href="/faq" className="hover:text-[#6c2bd9]">FAQ</Link>
          <Link href="/privacidade" className="hover:text-[#6c2bd9]">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-[#6c2bd9]">Termos de Uso</Link>
        </footer>
      </div>
    </main>
  );
}
