'use client';

import React from 'react';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-800 bg-[#0d1324]">
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-medium text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const color = tone === 'good' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : tone === 'bad' ? 'text-red-300' : tone === 'info' ? 'text-sky-300' : 'text-slate-100';
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0d1324] p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${color}`}>{value}</div>
      {hint && <div className="mt-1 truncate text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'good' | 'warn' | 'bad' | 'info';
}) {
  const cls = {
    default: 'border-slate-700 bg-slate-900 text-slate-300',
    good: 'border-emerald-900 bg-emerald-950/50 text-emerald-300',
    warn: 'border-amber-900 bg-amber-950/50 text-amber-300',
    bad: 'border-red-900 bg-red-950/50 text-red-300',
    info: 'border-sky-900 bg-sky-950/50 text-sky-300',
  }[tone];
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  disabled,
  tone = 'default',
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  tone?: 'default' | 'primary' | 'danger';
}) {
  const cls = tone === 'primary'
    ? 'border-violet-600 bg-violet-600 text-white hover:bg-violet-500'
    : tone === 'danger'
      ? 'border-red-900 bg-red-950/40 text-red-200 hover:bg-red-950'
      : 'border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900';
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}

export function DataTable({
  columns,
  rows,
  rowKey,
  empty = 'Nenhum registro encontrado.',
}: {
  columns: Array<{ key: string; label: string; render?: (row: any) => React.ReactNode; className?: string }>;
  rows: any[];
  rowKey?: (row: any, index: number) => string;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
          <tr>{columns.map((col) => <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>{col.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={rowKey ? rowKey(row, index) : row.id ?? index} className="border-b border-slate-900/80 hover:bg-slate-900/40">
              {columns.map((col) => <td key={col.key} className={`px-4 py-3 text-slate-300 ${col.className ?? ''}`}>{col.render ? col.render(row) : String(row[col.key] ?? '-')}</td>)}
            </tr>
          )) : (
            <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">{message}</div>;
}

export function fmtDate(value?: string | number | Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

export function pct(value: number | undefined | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return `${Math.round(value * 10) / 10}%`;
}
