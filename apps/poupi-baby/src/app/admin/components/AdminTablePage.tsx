'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAdminApi } from './admin-api';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  columns: Array<{ key: string; label: string; render?: (row: any) => React.ReactNode }>;
  filters?: Array<{ key: string; label: string; options: string[] }>;
};

function valueOf(row: any, key: string) {
  return key.split('.').reduce((acc, part) => acc?.[part], row);
}

export function AdminTablePage({ title, description, endpoint, columns, filters = [] }: Props) {
  const { request, ready } = useAdminApi();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [data, setData] = useState<any>({ items: [], pagination: { total: 0, page: 1, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (q) params.set('q', q);
    Object.entries(filterValues).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [page, q, filterValues]);

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    request(`${endpoint}?${query}`).then(setData).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [ready, endpoint, query]);

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <button onClick={() => setPage(1)} className="rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"><i className="ti ti-refresh mr-2" />Atualizar</button>
      </div>
      <div className="flex gap-3 rounded-lg border border-slate-800 bg-[#0d1324] p-3">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Buscar..." className="h-10 min-w-80 rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm outline-none focus:border-violet-500" />
        {filters.map((filter) => (
          <select key={filter.key} value={filterValues[filter.key] ?? ''} onChange={(e) => { setFilterValues((prev) => ({ ...prev, [filter.key]: e.target.value })); setPage(1); }} className="h-10 rounded-md border border-slate-800 bg-[#080b12] px-3 text-sm">
            <option value="">{filter.label}</option>
            {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-[#0d1324]">
        {error && <div className="border-b border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>}
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
            <tr>{columns.map((col) => <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>Carregando...</td></tr>
            ) : data.items?.length ? data.items.map((row: any) => (
              <tr key={row.id} className="border-b border-slate-900/80 hover:bg-slate-900/40">
                {columns.map((col) => <td key={col.key} className="truncate px-4 py-3 text-slate-300">{col.render ? col.render(row) : String(valueOf(row, col.key) ?? '-')}</td>)}
              </tr>
            )) : (
              <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>Nenhum registro encontrado.</td></tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3 text-sm text-slate-500">
          <span>{data.pagination?.total ?? 0} registros</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-slate-800 px-3 py-1 disabled:opacity-40">Anterior</button>
            <span>Página {page} de {data.pagination?.pages ?? 1}</span>
            <button disabled={page >= (data.pagination?.pages ?? 1)} onClick={() => setPage((p) => p + 1)} className="rounded border border-slate-800 px-3 py-1 disabled:opacity-40">Próxima</button>
          </div>
        </div>
      </div>
    </section>
  );
}
