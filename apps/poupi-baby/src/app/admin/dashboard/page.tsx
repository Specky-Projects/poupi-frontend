'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel, fmtDate, pct } from '../components/AdminUi';

export default function AdminDashboardPage() {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await request('/admin/overview'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const health = data?.scraping?.health ?? [];
  const queue = data?.scraping?.queue ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  const avgSuccess = useMemo(() => {
    if (!health.length) return null;
    return health.reduce((sum: number, item: any) => sum + (item.successRate ?? 0), 0) / health.length;
  }, [health]);
  const disabled = health.filter((item: any) => item.disabled).length;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Dashboard"
        description="Resumo administrativo leve da operação, sem polling agressivo e usando apenas endpoints protegidos de admin."
        actions={<Button onClick={load} disabled={loading}><i className="ti ti-refresh" />Atualizar</Button>}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Produtos" value={data?.metrics?.totalProducts ?? '-'} hint="SKUs curados" />
        <MetricCard label="Ofertas" value={data?.metrics?.totalOffers ?? '-'} hint="URLs monitoradas" />
        <MetricCard label="Usuários" value={data?.metrics?.totalUsers ?? '-'} />
        <MetricCard label="Alertas ativos" value={data?.metrics?.activeAlerts ?? '-'} tone={(data?.metrics?.activeAlerts ?? 0) > 0 ? 'info' : 'default'} />
        <MetricCard label="Marketplaces" value={data?.metrics?.marketplaces ?? '-'} hint="ativos" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Fila ativa" value={queue.active} tone={queue.active ? 'info' : 'default'} />
        <MetricCard label="Aguardando" value={queue.waiting} />
        <MetricCard label="Delayed" value={queue.delayed} tone={queue.delayed ? 'warn' : 'default'} />
        <MetricCard label="Falhos" value={queue.failed} tone={queue.failed ? 'bad' : 'good'} />
        <MetricCard label="Saúde média" value={avgSuccess === null ? '-' : pct(avgSuccess)} tone={avgSuccess === null ? 'default' : avgSuccess >= 80 ? 'good' : avgSuccess >= 40 ? 'warn' : 'bad'} hint={disabled ? `${disabled} desativado(s)` : 'scrapers ativos'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Produtos monitorados" subtitle="Mais relevantes por watchlist/alerta">
          <DataTable
            rows={data?.monitoredProducts ?? []}
            columns={[
              { key: 'title', label: 'Produto', render: (row) => <span className="font-medium text-slate-100">{row.title}</span>, className: 'max-w-[420px] truncate' },
              { key: 'alerts', label: 'Alertas', render: (row) => row._count?.alerts ?? 0 },
            ]}
            empty={loading ? 'Carregando...' : 'Nenhum produto monitorado.'}
          />
        </Panel>

        <Panel title="Menores preços" subtitle="Ofertas com menor preço detectado">
          <DataTable
            rows={data?.lowestPrices ?? []}
            columns={[
              { key: 'product', label: 'Produto', render: (row) => row.product?.title ?? '-', className: 'max-w-[360px] truncate' },
              { key: 'marketplace', label: 'Marketplace', render: (row) => row.marketplace?.name ?? '-' },
              { key: 'price', label: 'Preço', render: (row) => <span className="font-medium text-emerald-300">R$ {Number(row.price ?? 0).toFixed(2)}</span> },
            ]}
            empty={loading ? 'Carregando...' : 'Nenhum preço disponível.'}
          />
        </Panel>
      </div>

      <Panel title="Saúde do scraping" subtitle="Ranking operacional por marketplace">
        <DataTable
          rows={health}
          columns={[
            { key: 'marketplace', label: 'Marketplace', render: (row) => <span className="font-medium text-slate-100">{row.marketplace}</span> },
            { key: 'successRate', label: 'Sucesso', render: (row) => <Badge tone={row.successRate >= 80 ? 'good' : row.successRate >= 40 ? 'warn' : 'bad'}>{pct(row.successRate)}</Badge> },
            { key: 'avgLatencyMs', label: 'Latência', render: (row) => row.avgLatencyMs ? `${Math.round(row.avgLatencyMs)}ms` : '-' },
            { key: 'topError', label: 'Erro', render: (row) => row.topError ? <Badge tone="warn">{row.topError}</Badge> : <Badge tone="good">OK</Badge> },
            { key: 'disabled', label: 'Status', render: (row) => row.disabled ? <Badge tone="bad">desativado</Badge> : <Badge tone="good">ativo</Badge> },
          ]}
          empty={loading ? 'Carregando...' : 'Nenhuma métrica registrada.'}
        />
      </Panel>

      <Panel title="Erros recentes" subtitle={`Gerado em ${data?.generatedAt ? fmtDate(data.generatedAt) : '-'}`}>
        <DataTable
          rows={data?.recentErrors ?? []}
          columns={[
            { key: 'marketplace', label: 'Marketplace' },
            { key: 'errorType', label: 'Erro', render: (row) => row.errorType ? <Badge tone="warn">{row.errorType}</Badge> : '-' },
            { key: 'latencyMs', label: 'Latência', render: (row) => row.latencyMs ? `${row.latencyMs}ms` : '-' },
            { key: 'capturedAt', label: 'Quando', render: (row) => fmtDate(row.capturedAt) },
          ]}
          empty={loading ? 'Carregando...' : 'Sem erros recentes.'}
        />
      </Panel>
    </section>
  );
}
