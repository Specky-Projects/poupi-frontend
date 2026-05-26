'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel, fmtDate, pct } from '../components/AdminUi';

type ScrapingData = {
  queue?: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  failedJobs?: any[];
  health?: any[];
  incidents?: any[];
  proxies?: { global?: boolean; poolSize?: number; pool?: any[] };
  domainMetrics?: any[];
  runLogs?: any[];
  snapshotsDir?: string;
  sessionsDir?: string;
};

const DEFAULT_SOURCES = ['drogasil', 'drogaraia', 'paguemenos', 'amazon'];

function toneForRate(rate?: number) {
  if (typeof rate !== 'number') return 'default' as const;
  if (rate >= 80) return 'good' as const;
  if (rate >= 40) return 'warn' as const;
  return 'bad' as const;
}

function errorTone(type?: string | null) {
  if (!type) return 'default' as const;
  if (['CAPTCHA', 'BLOCKED', 'RATE_LIMIT', 'CIRCUIT_BREAKER_OPEN'].includes(type)) return 'bad' as const;
  if (['TIMEOUT', 'NETWORK_ERROR', 'PROXY_ERROR'].includes(type)) return 'warn' as const;
  return 'info' as const;
}

export default function AdminScrapingPage() {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<ScrapingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [circuitSource, setCircuitSource] = useState('drogasil');

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await request<ScrapingData>('/admin/scraping'));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  async function action(name: string, path: string, body?: Record<string, unknown>) {
    setBusy(name);
    setError(null);
    try {
      await request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const queue = data?.queue ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  const healthRows = useMemo(() => {
    if (data?.health?.length) return data.health;
    return DEFAULT_SOURCES.map((marketplace) => ({
      marketplace,
      successRate: undefined,
      avgLatencyMs: null,
      topError: null,
      disabled: false,
      emptyState: true,
    }));
  }, [data]);
  const unhealthy = useMemo(() => (data?.health ?? []).filter((h) => h.disabled || h.successRate < 80), [data]);
  const blockedDomains = useMemo(() => (data?.domainMetrics ?? []).filter((d) => (d.blocks ?? 0) > 0 || (d.rateLimits ?? 0) > 0), [data]);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Scraping"
        description="Centro operacional para filas, saúde dos scrapers, proxies, métricas adaptativas, snapshots e circuit breakers."
        actions={(
          <>
            <Button onClick={load}><i className="ti ti-refresh" />Atualizar</Button>
            <Button disabled={busy === 'retry'} onClick={() => action('retry', '/admin/scraping/retry-failed')} tone="primary"><i className="ti ti-rotate-clockwise" />Reprocessar falhos</Button>
            <Button disabled={busy === 'pause'} onClick={() => action('pause', '/admin/scraping/pause')}><i className="ti ti-player-pause" />Pausar fila</Button>
            <Button disabled={busy === 'resume'} onClick={() => action('resume', '/admin/scraping/resume')}><i className="ti ti-player-play" />Retomar</Button>
          </>
        )}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Ativos" value={queue.active} hint="jobs em execução" tone={queue.active ? 'info' : 'default'} />
        <MetricCard label="Aguardando" value={queue.waiting} hint="fila principal" />
        <MetricCard label="Delayed" value={queue.delayed} hint="backoff/retry" tone={queue.delayed ? 'warn' : 'default'} />
        <MetricCard label="Falhos" value={queue.failed} hint="DLQ virtual" tone={queue.failed ? 'bad' : 'good'} />
        <MetricCard label="Proxies" value={data?.proxies?.poolSize ?? 0} hint={data?.proxies?.global ? 'pool configurado' : 'sem pool global'} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Saúde por marketplace" subtitle="Ranking operacional com circuit breaker e erro dominante">
          <DataTable
            rows={healthRows}
            columns={[
              { key: 'marketplace', label: 'Marketplace', render: (row) => <span className="font-medium text-slate-100">{row.marketplace}</span> },
              { key: 'successRate', label: 'Sucesso', render: (row) => <Badge tone={toneForRate(row.successRate)}>{pct(row.successRate)}</Badge> },
              { key: 'avgLatencyMs', label: 'Latência', render: (row) => row.avgLatencyMs ? `${Math.round(row.avgLatencyMs)}ms` : '-' },
              { key: 'topError', label: 'Erro', render: (row) => row.topError ? <Badge tone={errorTone(row.topError)}>{row.topError}</Badge> : row.emptyState ? '-' : <Badge tone="good">OK</Badge> },
              { key: 'disabled', label: 'Status', render: (row) => row.emptyState ? <Badge tone="info">sem coletas</Badge> : row.disabled ? <Badge tone="bad">pausado</Badge> : <Badge tone="good">ativo</Badge> },
            ]}
          />
        </Panel>

        <Panel title="Controles de circuito" subtitle="Use para conter um marketplace problemático">
          <div className="space-y-3 p-4">
            <select value={circuitSource} onChange={(e) => setCircuitSource(e.target.value)} className="h-10 w-full rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm">
              {['drogasil', 'drogaraia', 'paguemenos', 'amazon', 'mercadolivre'].map((source) => <option key={source} value={source}>{source}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={busy === 'openCircuit'} onClick={() => action('openCircuit', `/admin/scraping/circuit/${circuitSource}/open`, { minutes: 30 })} tone="danger"><i className="ti ti-plug-off" />Abrir</Button>
              <Button disabled={busy === 'closeCircuit'} onClick={() => action('closeCircuit', `/admin/scraping/circuit/${circuitSource}/close`)}><i className="ti ti-plug-connected" />Fechar</Button>
            </div>
            <Button disabled={busy === 'resetProxy'} onClick={() => action('resetProxy', '/admin/scraping/proxies/reset')}><i className="ti ti-shield-check" />Resetar cooldowns</Button>
            <div className="rounded-md border border-slate-800 bg-[#080b12] p-3 text-xs leading-5 text-slate-500">
              Snapshots: <span className="text-slate-300">{data?.snapshotsDir ?? '-'}</span><br />
              Sessões: <span className="text-slate-300">{data?.sessionsDir ?? '-'}</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Métricas adaptativas por domínio" subtitle={`${blockedDomains.length} domínio(s) com bloqueio ou rate limit registrado`}>
        <DataTable
          rows={data?.domainMetrics ?? []}
          columns={[
            { key: 'domain', label: 'Domínio', render: (row) => <span className="font-medium text-slate-100">{row.domain}</span> },
            { key: 'successRate', label: 'Sucesso', render: (row) => <Badge tone={toneForRate(row.successRate * 100)}>{pct((row.successRate ?? 0) * 100)}</Badge> },
            { key: 'blocks', label: 'Bloqueios', render: (row) => <Badge tone={row.blocks ? 'bad' : 'good'}>{row.blocks ?? 0}</Badge> },
            { key: 'rateLimits', label: '429', render: (row) => row.rateLimits ?? 0 },
            { key: 'delay', label: 'Delay', render: (row) => `${row.minDelayMs ?? 3000}-${row.maxDelayMs ?? 12000}ms` },
            { key: 'lastSeenAt', label: 'Último evento', render: (row) => fmtDate(row.lastSeenAt) },
          ]}
        />
      </Panel>

      <Panel title="Pool de proxies" subtitle="Score, cooldown e uso por fonte">
        <DataTable
          rows={data?.proxies?.pool ?? []}
          columns={[
            { key: 'source', label: 'Fonte' },
            { key: 'label', label: 'Proxy' },
            { key: 'banScore', label: 'Ban score', render: (row) => <Badge tone={row.banScore >= 6 ? 'bad' : row.banScore >= 3 ? 'warn' : 'good'}>{row.banScore}</Badge> },
            { key: 'successes', label: 'Sucessos' },
            { key: 'failures', label: 'Falhas' },
            { key: 'cooldownUntil', label: 'Cooldown até', render: (row) => fmtDate(row.cooldownUntil) },
          ]}
          empty="Nenhum proxy configurado."
        />
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Falhas recentes" subtitle="Jobs que ainda precisam de reprocessamento">
          <DataTable
            rows={data?.failedJobs ?? []}
            columns={[
              { key: 'offerId', label: 'Oferta', render: (row) => <span className="font-mono text-xs">{row.offerId ?? '-'}</span> },
              { key: 'marketplace', label: 'Marketplace' },
              { key: 'attempts', label: 'Tentativas' },
              { key: 'failedReason', label: 'Motivo', className: 'max-w-[260px] truncate' },
            ]}
          />
        </Panel>

        <Panel title="Run logs" subtitle="Últimas execuções persistidas">
          <DataTable
            rows={data?.runLogs ?? []}
            columns={[
              { key: 'marketplace', label: 'Marketplace' },
              { key: 'success', label: 'Status', render: (row) => row.success ? <Badge tone="good">OK</Badge> : <Badge tone="bad">falha</Badge> },
              { key: 'errorType', label: 'Erro', render: (row) => row.errorType ? <Badge tone={errorTone(row.errorType)}>{row.errorType}</Badge> : '-' },
              { key: 'createdAt', label: 'Quando', render: (row) => fmtDate(row.createdAt) },
            ]}
          />
        </Panel>
      </div>
    </section>
  );
}
