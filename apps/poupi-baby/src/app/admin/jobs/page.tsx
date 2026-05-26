'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, MetricCard, PageHeader, Panel, fmtDate } from '../components/AdminUi';

type JobsData = {
  queue?: { waiting: number; active: number; completed: number; failed: number; delayed: number };
  failedJobs?: any[];
  runLogs?: any[];
};

export default function AdminJobsPage() {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<JobsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await request<JobsData>('/admin/jobs'));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [request]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  async function action(name: string, path: string) {
    setBusy(name);
    setError(null);
    try {
      await request(path, { method: 'POST' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const queue = data?.queue ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Jobs"
        description="Operação da fila BullMQ de scraping, com estado atual, falhas e ações de contenção."
        actions={(
          <>
            <Button onClick={load}><i className="ti ti-refresh" />Atualizar</Button>
            <Button disabled={busy === 'retry'} onClick={() => action('retry', '/admin/scraping/retry-failed')} tone="primary"><i className="ti ti-rotate-clockwise" />Retry falhos</Button>
            <Button disabled={busy === 'pause'} onClick={() => action('pause', '/admin/scraping/pause')}><i className="ti ti-player-pause" />Pausar</Button>
            <Button disabled={busy === 'resume'} onClick={() => action('resume', '/admin/scraping/resume')}><i className="ti ti-player-play" />Retomar</Button>
          </>
        )}
      />

      <ErrorNotice message={error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Waiting" value={queue.waiting} />
        <MetricCard label="Active" value={queue.active} tone={queue.active ? 'info' : 'default'} />
        <MetricCard label="Delayed" value={queue.delayed} tone={queue.delayed ? 'warn' : 'default'} />
        <MetricCard label="Failed" value={queue.failed} tone={queue.failed ? 'bad' : 'good'} />
        <MetricCard label="Completed" value={queue.completed} />
      </div>

      <Panel title="Jobs falhos" subtitle="Itens que podem ser reprocessados manualmente">
        <DataTable
          rows={data?.failedJobs ?? []}
          columns={[
            { key: 'id', label: 'Job', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
            { key: 'offerId', label: 'Oferta', render: (row) => <span className="font-mono text-xs">{row.offerId ?? '-'}</span> },
            { key: 'marketplace', label: 'Marketplace' },
            { key: 'attempts', label: 'Tentativas' },
            { key: 'failedReason', label: 'Motivo', className: 'max-w-[360px] truncate' },
            { key: 'timestamp', label: 'Criado', render: (row) => fmtDate(row.timestamp) },
          ]}
        />
      </Panel>

      <Panel title="Últimas execuções" subtitle="Log persistido do scraper">
        <DataTable
          rows={data?.runLogs ?? []}
          columns={[
            { key: 'marketplace', label: 'Marketplace' },
            { key: 'success', label: 'Status', render: (row) => row.success ? <Badge tone="good">OK</Badge> : <Badge tone="bad">falha</Badge> },
            { key: 'statusCode', label: 'HTTP' },
            { key: 'errorType', label: 'Erro', render: (row) => row.errorType ? <Badge tone="warn">{row.errorType}</Badge> : '-' },
            { key: 'latencyMs', label: 'Latência', render: (row) => row.latencyMs ? `${row.latencyMs}ms` : '-' },
            { key: 'createdAt', label: 'Quando', render: (row) => fmtDate(row.createdAt) },
          ]}
        />
      </Panel>
    </section>
  );
}
