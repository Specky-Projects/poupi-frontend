'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { MobileBottomNav } from '../../components/MobileBottomNav';

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

const PLAN_COPY: Record<string, { tagline: string; description: string; benefits: string[]; cta: string }> = {
  free: {
    tagline: 'Descubra se o Nuvii funciona para você.',
    description: 'Comece a monitorar preços e criar alertas sem compromisso.',
    benefits: [
      'Até 10 produtos monitorados',
      '1 alerta ativo por vez',
      'Histórico de preços: 7 dias',
      'Deal Score em cada produto',
    ],
    cta: 'Plano gratuito',
  },
  plus: {
    tagline: 'Para pais que querem nunca mais pagar caro.',
    description: 'Alertas ilimitados, histórico completo e prioridade nas atualizações.',
    benefits: [
      'Até 200 produtos monitorados',
      'Alertas ilimitados',
      'Histórico de preços: 90 dias',
      'Prioridade de atualização de preços',
      'Relatório mensal de economia (em breve)',
      'Sugestão de preço-alvo por IA (em breve)',
    ],
    cta: 'Assinar Plus',
  },
  pro: {
    tagline: 'Para famílias que monitoram tudo.',
    description: 'Sem limites. Para quem leva a sério a economia nas compras do bebê.',
    benefits: [
      'Produtos ilimitados',
      'Alertas ilimitados',
      'Histórico completo (sem limite)',
      'Prioridade máxima nas atualizações',
      'Relatório mensal de economia (em breve)',
      'Sugestão de preço-alvo por IA (em breve)',
      'Acesso antecipado a novos recursos',
    ],
    cta: 'Assinar Pro',
  },
};

const FALLBACK_PLANS: Plan[] = [
  { id: 'free', name: 'Free', priceBrl: 0, description: 'Descubra se o Nuvii funciona para você.' },
  { id: 'plus', name: 'Plus', priceBrl: 14.9, description: 'Para pais que querem nunca mais pagar caro.', highlight: true },
  { id: 'pro', name: 'Pro', priceBrl: 39.9, description: 'Para famílias que monitoram tudo.' },
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
    track('checkout_initiated', { plan: planId });
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
      setMessage('Assinatura ativada com sucesso. Bem-vindo ao plano Premium!');
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
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-8 pb-28 text-[#1A1D3B] lg:pb-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm font-medium text-[#7C5CFF]">← Voltar ao painel</Link>

        <header className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E4E7F2]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Escolha seu plano Nuvii Baby</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5B607C]">
                Quanto mais você monitora, mais você economiza. Sem fidelidade — cancele quando quiser.
              </p>
            </div>
            <div className="rounded-xl bg-[#EDE7FF] p-4 text-[#1A1D3B]">
              <div className="text-sm text-[#5B607C]">Seu plano atual</div>
              <div className="mt-1 text-2xl font-black text-[#7C5CFF]">{status?.planName ?? currentPlan}</div>
              <div className="mt-1 text-sm text-[#5B607C]">
                {typeof days === 'number' ? `${days} dias Premium restantes` : 'Plano gratuito ativo'}
              </div>
            </div>
          </div>
        </header>

        {/* Banner de upgrade contextual para usuários Free */}
        {currentPlan === 'free' && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#7C5CFF]/30 bg-[#EDE7FF] px-4 py-3">
            <i className="ti ti-sparkles mt-0.5 shrink-0 text-xl text-[#7C5CFF]" />
            <div>
              <p className="text-sm font-bold text-[#1A1D3B]">Você está deixando economia na mesa.</p>
              <p className="mt-0.5 text-sm text-[#5B607C]">
                Com o Plus, você monitora 200 produtos e cria alertas ilimitados — por menos do que uma caixa de fralda.
              </p>
            </div>
          </div>
        )}

        {message && <div className="mt-5 rounded-xl border border-[#87cfa2] bg-[#eefaf2] px-4 py-3 text-sm font-medium text-[#21633c]">{message}</div>}
        {error && <div className="mt-5 rounded-xl border border-[#f0a5a5] bg-[#fff1f1] px-4 py-3 text-sm text-[#9f2828]">{error}</div>}

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => {
            const copy = PLAN_COPY[plan.id] ?? { tagline: plan.description, description: '', benefits: [], cta: `Assinar ${plan.name}` };
            const isCurrent = plan.id === currentPlan;
            const isPlus = plan.highlight ?? plan.id === 'plus';
            return (
              <article
                key={plan.id}
                className={`relative rounded-2xl border p-6 shadow-sm transition ${
                  isPlus
                    ? 'border-[#7C5CFF] bg-[#EDE7FF] shadow-[0_20px_60px_rgba(124,92,255,0.18)] ring-2 ring-[#7C5CFF]/30 lg:-mt-4'
                    : isCurrent
                    ? 'border-[#22C55E] bg-white ring-2 ring-[#22C55E]/20'
                    : 'border-[#E4E7F2] bg-white'
                }`}
              >
                {isPlus && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#7C5CFF] px-4 py-1 text-xs font-black text-white shadow">
                    ⭐ Mais escolhido
                  </span>
                )}
                {isCurrent && !isPlus && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#e8f8ee] px-3 py-1 text-xs font-bold text-[#2f8a51]">Plano atual</span>
                )}

                <div className="pt-2">
                  <h2 className={`text-2xl font-black ${isPlus ? 'text-[#7C5CFF]' : 'text-[#1A1D3B]'}`}>{plan.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-[#1A1D3B]">{copy.tagline}</p>
                  <p className="mt-1 text-xs text-[#5B607C]">{copy.description}</p>

                  <div className="mt-5">
                    <span className={`text-4xl font-black ${isPlus ? 'text-[#7C5CFF]' : 'text-[#1A1D3B]'}`}>
                      {plan.priceBrl === 0 ? 'Grátis' : plan.priceBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    {plan.priceBrl > 0 && <span className="ml-1 text-sm text-[#5B607C]">/mês</span>}
                  </div>
                  {plan.id !== 'free' && (
                    <p className="mt-1 text-xs font-semibold text-[#5B607C]">Sem fidelidade · Cancele quando quiser</p>
                  )}

                  <ul className="mt-5 grid gap-2.5 text-sm">
                    {copy.benefits.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <i className="ti ti-check mt-0.5 shrink-0 text-[#22C55E]" />
                        <span className="text-[#1A1D3B]">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => subscribe(plan.id)}
                    disabled={isCurrent || loadingPlan === plan.id}
                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-black shadow-sm transition ${
                      isCurrent
                        ? 'cursor-default border border-[#22C55E] bg-white text-[#2f8a51]'
                        : isPlus
                        ? 'bg-[#7C5CFF] text-white shadow-[0_12px_30px_rgba(124,92,255,0.3)] hover:bg-[#6B4DDE]'
                        : 'bg-[#1A1D3B] text-white hover:bg-[#2A2F5B]'
                    } disabled:opacity-70`}
                  >
                    {isCurrent ? '✓ Plano atual' : loadingPlan === plan.id ? 'Processando...' : copy.cta}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* Em breve — recursos futuros */}
        {currentPlan === 'free' && (
          <section className="mt-6 rounded-2xl border border-[#E4E7F2] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EDE7FF] text-[#7C5CFF]">
                <i className="ti ti-rocket text-2xl" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black">Chegando em breve para assinantes</h3>
                  <span className="rounded-full bg-[#EDE7FF] px-2 py-0.5 text-xs font-bold text-[#7C5CFF]">Em breve</span>
                </div>
                <ul className="mt-2 grid gap-1 text-sm text-[#5B607C]">
                  <li className="flex items-center gap-2"><i className="ti ti-chart-bar text-[#7C5CFF]" /> Relatório mensal: quanto você economizou com os alertas</li>
                  <li className="flex items-center gap-2"><i className="ti ti-brain text-[#7C5CFF]" /> Sugestão automática de preço-alvo por produto</li>
                </ul>
                <button
                  onClick={() => subscribe('plus')}
                  className="mt-3 rounded-xl bg-[#7C5CFF] px-4 py-2 text-sm font-bold text-white hover:bg-[#6B4DDE]"
                >
                  Assinar Plus e ser o primeiro a receber →
                </button>
              </div>
            </div>
          </section>
        )}

        {currentPlan !== 'free' && (
          <section className="mt-6 rounded-2xl border border-[#E4E7F2] bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-bold">Gerenciar assinatura</h2>
                <p className="mt-1 text-sm text-[#5B607C]">
                  {status?.expiresAt ? `Seu acesso vai até ${new Date(status.expiresAt).toLocaleDateString('pt-BR')}.` : 'Você possui uma assinatura ativa.'}
                </p>
              </div>
              <button onClick={cancel} className="rounded-xl border border-[#f2dada] px-4 py-2 text-sm font-bold text-[#b13a3a] hover:bg-[#fff1f1]">Cancelar assinatura</button>
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-wrap gap-4 text-sm text-[#5B607C]">
          <Link href="/faq" className="hover:text-[#7C5CFF]">FAQ</Link>
          <Link href="/privacidade" className="hover:text-[#7C5CFF]">Política de Privacidade</Link>
          <Link href="/termos" className="hover:text-[#7C5CFF]">Termos de Uso</Link>
        </footer>
      </div>
      <MobileBottomNav />
    </main>
  );
}
