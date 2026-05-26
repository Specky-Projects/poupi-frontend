'use client';

import { useEffect, useState } from 'react';
import { useAdminApi } from './admin-api';

export function AdminJsonPage({ title, description, endpoint, action }: { title: string; description: string; endpoint: string; action?: { label: string; path: string } }) {
  const { request, ready } = useAdminApi();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    request(endpoint).then(setData).catch((err) => setError(err.message));
  }

  useEffect(() => {
    if (ready) load();
  }, [ready, endpoint]);

  async function runAction() {
    if (!action) return;
    await request(action.path, { method: 'POST' });
    await load();
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex gap-2">
          {action && <button onClick={runAction} className="rounded-md bg-violet-600 px-3 py-2 text-sm text-white">{action.label}</button>}
          <button onClick={load} className="rounded-md border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Atualizar</button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-red-300">{error}</div>}
      <pre className="max-h-[75vh] overflow-auto rounded-lg border border-slate-800 bg-[#0d1324] p-5 text-xs leading-6 text-slate-300">{data ? JSON.stringify(data, null, 2) : 'Carregando...'}</pre>
    </section>
  );
}
