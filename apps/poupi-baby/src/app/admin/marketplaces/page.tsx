'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel, fmtDate, pct } from '../components/AdminUi';

type MarketplaceRow = {
  id: string;
  name: string;
  baseUrl?: string | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: { offers?: number };
  health?: {
    marketplace: string;
    successRate?: number;
    avgLatencyMs?: number;
    topError?: string | null;
    disabled?: boolean;
    lastCheckedAt?: string;
  } | null;
};

function healthTone(rate?: number, disabled?: boolean) {
  if (disabled) return 'bad' as const;
  if (typeof rate !== 'number') return 'default' as const;
  if (rate >= 80) return 'good' as const;
  if (rate >= 40) return 'warn' as const;
  return 'bad' as const;
}

export default function AdminMarketplacesPage() {
  const { request, ready } = useAdminApi();
  const [items, setItems] = useState<MarketplaceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await request<MarketplaceRow[]>('/admin/marketplaces'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const metrics = useMemo(() => {
    const active = items.filter((item) => item.active !== false).length;
    const disabledScrapers = items.filter((item) => item.health?.disabled).length;
    const totalOffers = items.reduce((sum, item) => sum + (item._count?.offers ?? 0), 0);
    const withHealth = items.filter((item) => typeof item.health?.successRate === 'number');
    const avgSuccess = withHealth.length
      ? withHealth.reduce((sum, item) => sum + (item.health?.successRate ?? 0), 0) / withHealth.length
      : null;
    return { active, disabledScrapers, totalOffers, avgSuccess };
  }, [items]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Marketplaces"
        description="Visao operacional dos canais monitorados, com volume de ofertas, status de scraping e sinais de falha."
        actions={<Button onClick={load} disabled={loading}><i className="ti ti-refresh" />Atualizar</Button>}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Marketplaces" value={items.length} hint={`${metrics.active} ativos`} />
        <MetricCard label="Ofertas vinculadas" value={metrics.totalOffers} hint="URLs monitoradas" />
        <MetricCard label="Saude media" value={metrics.avgSuccess === null ? '-' : pct(metrics.avgSuccess)} tone={healthTone(metrics.avgSuccess ?? undefined)} />
        <MetricCard label="Scrapers pausados" value={metrics.disabledScrapers} tone={metrics.disabledScrapers ? 'bad' : 'good'} />
      </div>

      <Panel title="Canais" subtitle="Estado atual por marketplace">
        <DataTable
          rows={items}
          columns={[
            { key: 'name', label: 'Marketplace', render: (row: MarketplaceRow) => <span className="font-medium text-slate-100">{row.name}</span> },
            { key: 'active', label: 'Cadastro', render: (row: MarketplaceRow) => row.active === false ? <Badge tone="bad">inativo</Badge> : <Badge tone="good">ativo</Badge> },
            { key: 'offers', label: 'Ofertas', render: (row: MarketplaceRow) => row._count?.offers ?? 0 },
            { key: 'successRate', label: 'Sucesso', render: (row: MarketplaceRow) => <Badge tone={healthTone(row.health?.successRate, row.health?.disabled)}>{row.health?.successRate === undefined ? '-' : pct(row.health.successRate)}</Badge> },
            { key: 'avgLatencyMs', label: 'Latencia', render: (row: MarketplaceRow) => row.health?.avgLatencyMs ? `${Math.round(row.health.avgLatencyMs)}ms` : '-' },
            { key: 'topError', label: 'Erro dominante', render: (row: MarketplaceRow) => row.health?.topError ? <Badge tone="warn">{row.health.topError}</Badge> : <Badge tone="good">OK</Badge> },
            { key: 'lastCheckedAt', label: 'Ultimo check', render: (row: MarketplaceRow) => fmtDate(row.health?.lastCheckedAt ?? row.updatedAt) },
          ]}
          empty={loading ? 'Carregando...' : 'Nenhum marketplace cadastrado.'}
        />
      </Panel>
    </section>
  );
}
