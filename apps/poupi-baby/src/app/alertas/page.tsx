'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Alert = {
  id: string;
  targetPrice: string | number;
  active: boolean;
  createdAt: string;
  product: { id: string; title: string; imageUrl?: string };
};

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAlerts() {
    const res = await fetch('/api/alerts');
    if (res.ok) setAlerts(await res.json());
    setLoading(false);
  }

  async function cancelAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    setAlerts((prev) => prev.map((alert) => alert.id === id ? { ...alert, active: false } : alert));
  }

  useEffect(() => { loadAlerts(); }, []);

  const active = alerts.filter((alert) => alert.active);
  const history = alerts.filter((alert) => !alert.active);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#201335]">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm font-medium text-[#6c2bd9]">Voltar ao painel</Link>
        <header className="mt-5 rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#eadff7]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Alertas de preço</h1>
              <p className="mt-2 text-sm text-[#675b77]">Acompanhe o que ainda está ativo e o histórico do que já foi encerrado.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-[#f5efff] px-5 py-3">
                <div className="text-2xl font-semibold text-[#6c2bd9]">{active.length}</div>
                <div className="text-xs text-[#675b77]">ativos</div>
              </div>
              <div className="rounded-lg bg-[#eefaf2] px-5 py-3">
                <div className="text-2xl font-semibold text-[#2f8a51]">{history.length}</div>
                <div className="text-xs text-[#675b77]">histórico</div>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c2bd9] border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <section className="mt-6 rounded-lg border border-[#eadff7] bg-white p-10 text-center shadow-sm">
            <i className="ti ti-bell-off text-4xl text-[#b9aec8]" />
            <p className="mt-3 text-sm text-[#675b77]">Nenhum alerta criado ainda.</p>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-lg border border-[#eadff7] bg-white shadow-sm">
              <div className="border-b border-[#eadff7] px-5 py-4">
                <h2 className="font-semibold">Alertas ativos</h2>
                <p className="mt-1 text-sm text-[#675b77]">Produtos que ainda podem gerar notificação.</p>
              </div>
              <div className="divide-y divide-[#f1e9fb]">
                {active.length ? active.map((alert) => <AlertRow key={alert.id} alert={alert} onCancel={() => cancelAlert(alert.id)} />) : <Empty text="Nenhum alerta ativo no momento." />}
              </div>
            </section>

            <section className="rounded-lg border border-[#eadff7] bg-white shadow-sm">
              <div className="border-b border-[#eadff7] px-5 py-4">
                <h2 className="font-semibold">Histórico</h2>
                <p className="mt-1 text-sm text-[#675b77]">Alertas cancelados ou já encerrados.</p>
              </div>
              <div className="divide-y divide-[#f1e9fb]">
                {history.length ? history.map((alert) => <AlertRow key={alert.id} alert={alert} compact />) : <Empty text="Seu histórico ainda está vazio." />}
              </div>
            </section>
          </div>
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

function AlertRow({ alert, onCancel, compact }: { alert: Alert; onCancel?: () => void; compact?: boolean }) {
  return (
    <article className={`flex gap-4 p-4 ${compact ? 'opacity-75' : ''}`}>
      {alert.product.imageUrl ? <img src={alert.product.imageUrl} alt={alert.product.title} className="h-14 w-14 rounded-lg object-contain" /> : <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#f5efff] text-[#6c2bd9]"><i className="ti ti-package text-xl" /></div>}
      <div className="min-w-0 flex-1">
        <Link href={`/produto/${alert.product.id}`} className="block truncate text-sm font-semibold hover:text-[#6c2bd9]">{alert.product.title}</Link>
        <p className="mt-1 text-sm text-[#675b77]">Meta: <strong className="text-[#6c2bd9]">{Number(alert.targetPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
        <p className="mt-1 text-xs text-[#8a7f98]">Criado em {new Date(alert.createdAt).toLocaleDateString('pt-BR')}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${alert.active ? 'bg-[#e8f8ee] text-[#2f8a51]' : 'bg-[#f1eef5] text-[#675b77]'}`}>{alert.active ? 'Ativo' : 'Inativo'}</span>
        {onCancel && <button onClick={onCancel} className="text-xs font-semibold text-[#b13a3a] hover:underline">Cancelar</button>}
      </div>
    </article>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-[#8a7f98]">{text}</div>;
}
