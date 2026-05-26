'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '../components/admin-api';
import { Badge, Button, DataTable, ErrorNotice, PageHeader, Panel, fmtDate } from '../components/AdminUi';

type Mode = 'system' | 'scraping';

export default function AdminLogsPage() {
  const { request, ready } = useAdminApi();
  const [mode, setMode] = useState<Mode>('scraping');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = mode === 'scraping' ? '/admin/scraping/logs' : '/admin/logs';
  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    return params.toString();
  }, [page, q, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await request(`${endpoint}?${query}`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [request, endpoint, query]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  function switchMode(next: Mode) {
    setMode(next);
    setPage(1);
    setStatus('');
    setQ('');
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Logs"
        description="Auditoria admin, eventos do sistema e execuções estruturadas do scraping."
        actions={<Button onClick={load}><i className="ti ti-refresh" />Atualizar</Button>}
      />

      <ErrorNotice message={error} />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-800 bg-[#0d1324] p-3">
        <div className="inline-flex rounded-md border border-slate-800 bg-[#080b12] p-1">
          <button onClick={() => switchMode('scraping')} className={`h-8 rounded px-3 text-sm ${mode === 'scraping' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>Scraping</button>
          <button onClick={() => switchMode('system')} className={`h-8 rounded px-3 text-sm ${mode === 'system' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>Sistema</button>
        </div>
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar por URL, erro ou evento..." className="h-10 min-w-80 rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm outline-none focus:border-violet-500" />
        {mode === 'scraping' && (
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-10 rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm">
            <option value="">Todos</option>
            <option value="failed">Falhas</option>
            <option value="success">Sucessos</option>
          </select>
        )}
      </div>

      <Panel title={mode === 'scraping' ? 'Scraping run logs' : 'Eventos do sistema'} subtitle={loading ? 'Carregando...' : `${data.pagination?.total ?? 0} registros`}>
        {mode === 'scraping' ? (
          <DataTable
            rows={data.items ?? []}
            columns={[
              { key: 'marketplace', label: 'Marketplace' },
              { key: 'success', label: 'Status', render: (row) => row.success ? <Badge tone="good">OK</Badge> : <Badge tone="bad">falha</Badge> },
              { key: 'statusCode', label: 'HTTP' },
              { key: 'errorType', label: 'Erro', render: (row) => row.errorType ? <Badge tone="warn">{row.errorType}</Badge> : '-' },
              { key: 'url', label: 'URL', className: 'max-w-[320px] truncate' },
              { key: 'proxyLabel', label: 'Proxy' },
              { key: 'latencyMs', label: 'Latência', render: (row) => row.latencyMs ? `${row.latencyMs}ms` : '-' },
              { key: 'createdAt', label: 'Quando', render: (row) => fmtDate(row.createdAt) },
            ]}
          />
        ) : (
          <DataTable
            rows={data.items ?? []}
            columns={[
              { key: 'eventType', label: 'Evento' },
              { key: 'userId', label: 'Usuário', render: (row) => <span className="font-mono text-xs">{row.userId ?? '-'}</span> },
              { key: 'payload', label: 'Payload', className: 'max-w-[460px] truncate' },
              { key: 'occurredAt', label: 'Quando', render: (row) => fmtDate(row.occurredAt) },
            ]}
          />
        )}
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-sm text-slate-500">
          <span>{data.pagination?.total ?? 0} registros</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-slate-800 px-3 py-1 disabled:opacity-40">Anterior</button>
            <span>Página {page} de {data.pagination?.pages ?? 1}</span>
            <button disabled={page >= (data.pagination?.pages ?? 1)} onClick={() => setPage((p) => p + 1)} className="rounded border border-slate-800 px-3 py-1 disabled:opacity-40">Próxima</button>
          </div>
        </div>
      </Panel>
    </section>
  );
}
