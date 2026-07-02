import { Card } from "@poupi-frontend/ui";

import type { PlatformHealth, PlatformStatusContract } from "@/lib/contracts";

const HEALTH_STYLE: Record<PlatformHealth, { bg: string; text: string; dot: string; label: string }> = {
  ok: { bg: "bg-emerald-50 ring-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Operacional" },
  degraded: { bg: "bg-amber-50 ring-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "Degradado" },
  unavailable: { bg: "bg-red-50 ring-red-200", text: "text-red-700", dot: "bg-red-500", label: "Indisponível" },
};

function HealthChip({ health }: { health: PlatformHealth }) {
  const s = HEALTH_STYLE[health];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function Flag({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs ${
        on ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-400"
      }`}
    >
      {label}
    </span>
  );
}

export type PlatformStatusWidgetProps = {
  data: PlatformStatusContract | null;
  loading?: boolean;
  error?: string | null;
  latencyMs?: number | null;
};

/**
 * Reusable widget for the universal-platform.status capability. Purely
 * presentational — receives the BFF contract via props so it can be composed on
 * any screen. Renders observability (latency, last update) and a friendly
 * message when the platform is unavailable.
 */
export function PlatformStatusWidget({ data, loading, error, latencyMs }: PlatformStatusWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando universal platform…</p>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Universal Platform</h3>
          <HealthChip health="unavailable" />
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
          <h3 className="text-sm font-semibold">Universal Platform</h3>
          {data.version ? (
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{data.version}</code>
          ) : null}
        </div>
        <HealthChip health={data.status} />
      </div>

      {isUnavailable ? (
        <p className="mt-3 text-sm text-red-600">
          {data.error ?? "data-core indisponível"}. Exibindo estado seguro; nenhuma ação disponível.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-zinc-500">Capabilities</div>
              <div className="text-lg font-semibold">{data.capabilityCount}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Adapters</div>
              <div className="text-lg font-semibold">{data.adapters.length}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Inicializado</div>
              <div className="text-lg font-semibold">{data.initialized ? "sim" : "não"}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Flag label="advisory-only" on={data.advisoryOnly} />
            <Flag label="shadow-mode" on={data.shadowMode} />
            <Flag label="read-only" on={data.readOnly} />
          </div>

          {data.adapters.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.adapters.map((a) => (
                <span
                  key={a.project}
                  className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600"
                  title={a.domain}
                >
                  {a.project}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-400">
        <span>source: data-core /universal-platform/status</span>
        {typeof latencyMs === "number" ? <span>latência: {latencyMs}ms</span> : null}
        <span>atualizado: {new Date(data.fetchedAt).toLocaleTimeString("pt-BR")}</span>
      </div>
    </Card>
  );
}

export default PlatformStatusWidget;
