'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel, fmtDate } from '../components/AdminUi';

type AnalyticsData = {
  days: number;
  events?: Array<{ eventType?: string; type?: string; count?: number | string; _count?: number | { _all?: number } }>;
  activeUsers?: number;
  topProducts?: any[];
  funnel?: Record<string, number>;
  volatileProducts?: any[];
  promotions?: any[];
};

function countOf(row: any) {
  if (typeof row?.count === 'number') return row.count;
  if (typeof row?.count === 'string') return Number(row.count);
  if (typeof row?._count === 'number') return row._count;
  if (typeof row?._count?._all === 'number') return row._count._all;
  return 0;
}

export default function AdminAnalyticsPage() {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await request<AnalyticsData>(`/admin/analytics?days=${days}`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [days, request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const events = data?.events ?? [];
  const totalEvents = useMemo(() => events.reduce((sum, row) => sum + countOf(row), 0), [events]);
  const topEvent = useMemo(() => [...events].sort((a, b) => countOf(b) - countOf(a))[0], [events]);
  const funnelRows = useMemo(() => Object.entries(data?.funnel ?? {}).map(([step, value]) => ({ step, value })), [data]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Indicadores de uso, monitoramento e comportamento de preco sem carregar graficos pesados no admin."
        actions={(
          <>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-10 rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm">
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
            <Button onClick={load} disabled={loading}><i className="ti ti-refresh" />Atualizar</Button>
          </>
        )}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Usuarios ativos" value={data?.activeUsers ?? '-'} hint={`${data?.days ?? days} dias`} />
        <MetricCard label="Eventos" value={totalEvents || '-'} hint={topEvent ? `${topEvent.eventType ?? topEvent.type ?? 'evento'} lidera` : 'sem eventos'} />
        <MetricCard label="Produtos monitorados" value={data?.topProducts?.length ?? '-'} hint="top produtos no periodo" />
        <MetricCard label="Promocoes recentes" value={data?.promotions?.length ?? '-'} tone={(data?.promotions?.length ?? 0) ? 'info' : 'default'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Produtos mais monitorados" subtitle="Ranking por interesse dos usuarios">
          <DataTable
            rows={data?.topProducts ?? []}
            columns={[
              { key: 'product', label: 'Produto', render: (row) => row.product?.title ?? row.title ?? row.productTitle ?? '-' },
              { key: 'count', label: 'Sinais', render: (row) => countOf(row) || row.alerts || row.watchlists || '-' },
            ]}
            empty={loading ? 'Carregando...' : 'Sem dados de produtos.'}
          />
        </Panel>

        <Panel title="Funil" subtitle="Eventos principais do periodo">
          <DataTable
            rows={funnelRows}
            columns={[
              { key: 'step', label: 'Etapa', render: (row) => <span className="font-medium text-slate-100">{row.step}</span> },
              { key: 'value', label: 'Total' },
            ]}
            empty={loading ? 'Carregando...' : 'Sem dados de funil.'}
          />
        </Panel>
      </div>

      <Panel title="Produtos mais volateis" subtitle="Variacao recente de preco por produto">
        <DataTable
          rows={data?.volatileProducts ?? []}
          columns={[
            { key: 'product', label: 'Produto', render: (row) => row.product?.title ?? row.title ?? '-' },
            { key: 'priceVolatility30d', label: 'Volatilidade', render: (row) => row.priceVolatility30d !== undefined ? Number(row.priceVolatility30d).toFixed(2) : '-' },
            { key: 'patternType', label: 'Padrao', render: (row) => row.patternType ? <Badge tone="info">{row.patternType}</Badge> : '-' },
            { key: 'updatedAt', label: 'Atualizado', render: (row) => fmtDate(row.updatedAt ?? row.createdAt) },
          ]}
          empty={loading ? 'Carregando...' : 'Sem volatilidade registrada.'}
        />
      </Panel>

      <Panel title="Promocoes recentes" subtitle="Ultimas capturas que podem representar oportunidades">
        <DataTable
          rows={data?.promotions ?? []}
          columns={[
            { key: 'product', label: 'Produto', render: (row) => row.offer?.product?.title ?? row.product?.title ?? '-' },
            { key: 'marketplace', label: 'Marketplace', render: (row) => row.offer?.marketplace?.name ?? row.marketplace?.name ?? '-' },
            { key: 'price', label: 'Preco', render: (row) => row.price !== undefined ? <span className="font-medium text-emerald-300">R$ {Number(row.price).toFixed(2)}</span> : '-' },
            { key: 'capturedAt', label: 'Capturado', render: (row) => fmtDate(row.capturedAt ?? row.createdAt) },
          ]}
          empty={loading ? 'Carregando...' : 'Nenhuma promocao recente.'}
        />
      </Panel>
    </section>
  );
}
