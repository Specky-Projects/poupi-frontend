'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MobileBottomNav } from '../../components/MobileBottomNav';

type Alert = {
  id: string;
  targetPrice: string | number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string | null;
  cancelledAt?: string | null;
  product: { id: string; title: string; imageUrl?: string; currentPrice?: string | number | null };
};

type Quota = { plan: string; atLimit: boolean; unlimited: boolean };

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function alertStatus(alert: Alert): { label: string; color: string; bg: string } {
  if (!alert.active) {
    if (alert.triggeredAt) return { label: 'Disparado', color: '#2f8a51', bg: '#e8f8ee' };
    if (alert.cancelledAt) return { label: 'Cancelado', color: '#b13a3a', bg: '#fff1f1' };
    return { label: 'Expirado', color: '#8A8FB1', bg: '#F2F4FF' };
  }
  return { label: 'Ativo', color: '#7C5CFF', bg: '#EDE7FF' };
}

function proximityPct(current: number | null, target: number): number | null {
  if (!current || current <= 0 || target <= 0) return null;
  if (current <= target) return 100;
  return Math.max(0, Math.round((1 - (current - target) / current) * 100));
}

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAlerts() {
    const [alertRes, quotaRes] = await Promise.all([
      fetch('/api/alerts'),
      fetch('/api/products/quota'),
    ]);
    if (alertRes.ok) setAlerts(await alertRes.json());
    if (quotaRes.ok) setQuota(await quotaRes.json());
    setLoading(false);
  }

  async function cancelAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: false, cancelledAt: new Date().toISOString() } : a));
  }

  useEffect(() => { loadAlerts(); }, []);

  const active = useMemo(() => {
    return alerts
      .filter((a) => a.active)
      .sort((a, b) => {
        const pa = proximityPct(Number(a.product.currentPrice) || null, Number(a.targetPrice));
        const pb = proximityPct(Number(b.product.currentPrice) || null, Number(b.targetPrice));
        return (pb ?? 0) - (pa ?? 0);
      });
  }, [alerts]);

  const history = alerts.filter((a) => !a.active);
  const atLimit = quota?.atLimit && !quota?.unlimited;

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-8 pb-28 text-[#1A1D3B] lg:pb-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-medium text-[#7C5CFF]">← Voltar ao painel</Link>

        <header className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E4E7F2]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Alertas de preço</h1>
              <p className="mt-2 text-sm text-[#5B607C]">Eu aviso quando o preço chegar na sua meta. Ordenados por proximidade.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#EDE7FF] px-5 py-3">
                <div className="text-2xl font-black text-[#7C5CFF]">{active.length}</div>
                <div className="text-xs text-[#5B607C]">ativos</div>
              </div>
              <div className="rounded-xl bg-[#e8f8ee] px-5 py-3">
                <div className="text-2xl font-black text-[#2f8a51]">{history.length}</div>
                <div className="text-xs text-[#5B607C]">histórico</div>
              </div>
            </div>
          </div>
        </header>

        {atLimit && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#7C5CFF]/30 bg-[#EDE7FF] px-4 py-3">
            <i className="ti ti-crown shrink-0 text-xl text-[#7C5CFF]" />
            <p className="flex-1 text-sm font-medium text-[#1A1D3B]">
              Você atingiu o limite do plano Free. Faça upgrade para criar alertas ilimitados e nunca perder uma oferta.
            </p>
            <Link href="/billing" className="shrink-0 rounded-lg bg-[#7C5CFF] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#6B4DDE]">
              Ver planos →
            </Link>
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7C5CFF] border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <section className="mt-6 rounded-2xl border border-[#E4E7F2] bg-white p-10 text-center shadow-sm">
            <i className="ti ti-bell-ringing text-4xl text-[#7C5CFF]" />
            <h2 className="mt-3 text-base font-bold">Nenhum alerta criado ainda</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#5B607C]">
              Defina uma meta de preço e eu aviso por e-mail ou Telegram quando chegar lá.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="rounded-xl bg-[#7C5CFF] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#6B4DDE]">
                Buscar produto →
              </Link>
              <Link href="/faq" className="text-sm font-medium text-[#5B607C] hover:text-[#7C5CFF]">Como funciona?</Link>
            </div>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-[#E4E7F2] bg-white shadow-sm">
              <div className="border-b border-[#E4E7F2] px-5 py-4">
                <h2 className="font-bold">Alertas ativos</h2>
                <p className="mt-1 text-sm text-[#5B607C]">Ordenados por quem está mais perto da meta.</p>
              </div>
              <div className="divide-y divide-[#EDF0FB]">
                {active.length ? active.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onCancel={() => cancelAlert(alert.id)} />
                )) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[#8A8FB1]">Nenhum alerta ativo no momento.</p>
                    <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-[#7C5CFF] hover:underline">
                      Criar alerta para um produto →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#E4E7F2] bg-white shadow-sm">
              <div className="border-b border-[#E4E7F2] px-5 py-4">
                <h2 className="font-bold">Histórico</h2>
                <p className="mt-1 text-sm text-[#5B607C]">Alertas encerrados — disparados, cancelados ou expirados.</p>
              </div>
              <div className="divide-y divide-[#EDF0FB]">
                {history.length ? history.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} compact />
                )) : (
                  <div className="p-8 text-center text-sm text-[#8A8FB1]">Seu histórico ainda está vazio.</div>
                )}
              </div>
            </section>
          </div>
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

function AlertRow({ alert, onCancel, compact }: {
  alert: Alert;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const target = Number(alert.targetPrice);
  const current = Number(alert.product.currentPrice) || null;
  const diff = current !== null ? current - target : null;
  const diffPct = current !== null && current > 0 ? ((current - target) / current) * 100 : null;
  const prox = proximityPct(current, target);
  const status = alertStatus(alert);

  return (
    <article className={`p-4 ${compact ? 'opacity-80' : ''}`}>
      <div className="flex gap-3">
        {alert.product.imageUrl
          ? <img src={alert.product.imageUrl} alt={alert.product.title} className="h-14 w-14 shrink-0 rounded-xl object-contain" />
          : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EDE7FF] text-[#7C5CFF]"><i className="ti ti-package text-xl" /></div>}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/produto/${alert.product.id}`} className="block truncate text-sm font-bold hover:text-[#7C5CFF]">{alert.product.title}</Link>
            <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: status.bg, color: status.color }}>{status.label}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {current !== null && (
              <span className="text-[#5B607C]">
                Preço atual: <strong className="text-[#1A1D3B]">{money(current)}</strong>
              </span>
            )}
            <span className="text-[#5B607C]">
              Meta: <strong className="text-[#7C5CFF]">{money(target)}</strong>
            </span>
            {diff !== null && (
              <span className={diff > 0 ? 'font-semibold text-[#b13a3a]' : 'font-semibold text-[#2f8a51]'}>
                {diff > 0 ? `Falta ${money(diff)}` : '✓ Meta atingida!'}
                {diffPct !== null && diff > 0 && <span className="ml-1 opacity-70">({diffPct.toFixed(0)}%)</span>}
              </span>
            )}
          </div>

          {alert.active && prox !== null && (
            <div className="mt-2.5">
              <div className="mb-1 flex items-center justify-between text-[10px] text-[#8A8FB1]">
                <span>Progresso até a meta</span>
                <span className="font-bold text-[#7C5CFF]">{prox}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E4E7F2]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${prox}%`, background: prox >= 80 ? '#22C55E' : prox >= 50 ? '#7C5CFF' : '#8A8FB1' }}
                />
              </div>
            </div>
          )}

          <div className="mt-2 text-[10px] text-[#8A8FB1]">Criado em {new Date(alert.createdAt).toLocaleDateString('pt-BR')}</div>
        </div>
      </div>

      {alert.active && !compact && onCancel && (
        <div className="mt-3">
          <button onClick={onCancel} className="text-xs font-semibold text-[#b13a3a] hover:underline">
            Cancelar alerta
          </button>
        </div>
      )}
    </article>
  );
}
