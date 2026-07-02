import { Card } from "@poupi-frontend/ui";

import type { AlertItem, AlertsContract, AlertsStatus } from "@/lib/contracts";

const STATUS_STYLE: Record<AlertsStatus, { bg: string; text: string; dot: string; label: string }> = {
  ok: { bg: "bg-red-50 ring-red-200", text: "text-red-700", dot: "bg-red-500", label: "Alertas ativos" },
  empty: { bg: "bg-emerald-50 ring-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Sem alertas" },
  unavailable: { bg: "bg-zinc-100 ring-zinc-200", text: "text-zinc-600", dot: "bg-zinc-400", label: "Indisponível" },
};

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  WARNING: "bg-amber-100 text-amber-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-zinc-100 text-zinc-600",
  INFO: "bg-zinc-100 text-zinc-600",
};

function StatusChip({ status }: { status: AlertsStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function AlertRow({ alert }: { alert: AlertItem }) {
  const sevClass = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.INFO;
  return (
    <div className="rounded border border-zinc-100 p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-700">{alert.title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sevClass}`}>{alert.severity}</span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{alert.rootCause}</p>
      <p className="mt-1 text-xs text-zinc-600">→ {alert.recommendedAction}</p>
      <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-zinc-400">
        <span>confiança: {(alert.confidence * 100).toFixed(0)}%</span>
        {alert.createdAt ? <span>criado: {new Date(alert.createdAt).toLocaleString("pt-BR")}</span> : null}
      </div>
    </div>
  );
}

export type AlertsWidgetProps = {
  data: AlertsContract | null;
  loading?: boolean;
  error?: string | null;
  latencyMs?: number | null;
};

/**
 * Reusable widget for the universal-platform.alerts capability. Purely
 * presentational — receives the BFF contract via props so it can be composed
 * on any screen. Renders each alert's severity/root-cause/recommended-action
 * verbatim from UnifiedAlertEngine; never invents a message.
 */
export function AlertsWidget({ data, loading, error, latencyMs }: AlertsWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando alerts…</p>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Critical Alerts</h3>
          <StatusChip status="unavailable" />
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const isUnavailable = data.status === "unavailable";

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Critical Alerts</h3>
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{data.count}</code>
        </div>
        <StatusChip status={data.status} />
      </div>

      {isUnavailable ? (
        <p className="mt-3 text-sm text-red-600">
          {data.error ?? "data-core indisponível"}. Exibindo estado seguro; nenhuma ação disponível.
        </p>
      ) : data.alerts.length === 0 ? (
        <p className="mt-3 text-sm text-emerald-700">Nenhum alerta correlacionado no momento.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {data.alerts.map((a) => (
            <AlertRow key={a.alertId} alert={a} />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-400">
        <span>source: data-core /universal-platform/alerts</span>
        {typeof latencyMs === "number" ? <span>latência: {latencyMs}ms</span> : null}
        <span>atualizado: {new Date(data.fetchedAt).toLocaleTimeString("pt-BR")}</span>
      </div>
    </Card>
  );
}

export default AlertsWidget;
