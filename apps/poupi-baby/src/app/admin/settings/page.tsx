'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel } from '../components/AdminUi';

export default function AdminSettingsPage() {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await request('/admin/settings'));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const scraping = data?.scraping ?? {};
  const alerts = data?.alerts ?? {};
  const flags = data?.featureFlags ?? {};

  return (
    <section className="space-y-5">
      <PageHeader
        title="Settings"
        description="Configuração operacional efetiva do ambiente. Valores editáveis devem virar settings persistidos antes de produção."
        actions={<Button onClick={load}><i className="ti ti-refresh" />Atualizar</Button>}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Browser mode" value={scraping.browserMode ? 'ON' : 'OFF'} tone={scraping.browserMode ? 'good' : 'warn'} hint="SCRAPER_BROWSER_MODE" />
        <MetricCard label="Calibração" value={scraping.calibrationMode ? 'ON' : 'OFF'} tone={scraping.calibrationMode ? 'good' : 'default'} hint="SCRAPER_CALIBRATION_MODE" />
        <MetricCard label="Max/domínio" value={scraping.calibrationMaxPerDomain ?? 5} hint="modo calibração" />
        <MetricCard label="Proxies" value={flags.proxiesEnabled ? 'ON' : 'OFF'} tone={flags.proxiesEnabled ? 'good' : 'default'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Scraping" subtitle="Frequências, diretórios e modo de execução">
          <div className="grid gap-3 p-4 text-sm">
            <Row label="Frequência padrão" value={`${scraping.defaultFrequencyHours ?? 6}h`} />
            <Row label="Frequência com alertas" value={`${scraping.alertFrequencyHours ?? 2}h`} />
            <Row label="Snapshots" value={scraping.snapshotDir ?? '-'} mono />
            <Row label="Sessões" value={scraping.sessionDir ?? '-'} mono />
          </div>
        </Panel>

        <Panel title="Alertas" subtitle="Thresholds inteligentes">
          <div className="grid gap-3 p-4 text-sm">
            <Row label="Queda mínima" value={`${alerts.priceDropPercent ?? 5}%`} />
            <Row label="Cooldown" value={`${alerts.cooldownHours ?? 24}h`} />
            <Row label="IA" value={<Badge tone={flags.aiEnabled ? 'good' : 'default'}>{flags.aiEnabled ? 'ativa' : 'desligada'}</Badge>} />
          </div>
        </Panel>
      </div>

      <Panel title="Marketplaces" subtitle="Fontes configuradas para operação">
        <DataTable
          rows={data?.marketplaces ?? []}
          columns={[
            { key: 'name', label: 'Nome', render: (row) => <span className="font-medium text-slate-100">{row.name}</span> },
            { key: 'slug', label: 'Slug' },
            { key: 'baseUrl', label: 'Base URL', className: 'max-w-[360px] truncate' },
            { key: 'active', label: 'Status', render: (row) => row.active ? <Badge tone="good">ativo</Badge> : <Badge tone="bad">inativo</Badge> },
          ]}
        />
      </Panel>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 rounded-md border border-slate-800 bg-[#080b12] px-3">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right text-slate-200 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
