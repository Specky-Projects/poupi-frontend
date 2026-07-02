import { Card } from "@poupi-frontend/ui";

import type { DailyBriefContract, DailyBriefStatus } from "@/lib/contracts";

const STATUS_STYLE: Record<DailyBriefStatus, { bg: string; text: string; dot: string; label: string }> = {
  ok: { bg: "bg-emerald-50 ring-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "Com atividade" },
  empty: { bg: "bg-zinc-100 ring-zinc-200", text: "text-zinc-600", dot: "bg-zinc-400", label: "Sem atividade" },
  unavailable: { bg: "bg-red-50 ring-red-200", text: "text-red-700", dot: "bg-red-500", label: "Indisponível" },
};

function StatusChip({ status }: { status: DailyBriefStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export type DailyBriefWidgetProps = {
  data: DailyBriefContract | null;
  loading?: boolean;
  error?: string | null;
  latencyMs?: number | null;
};

/**
 * Reusable widget for the universal-platform.daily-brief capability. Purely
 * presentational — receives the BFF contract via props so it can be composed
 * on any screen. Renders each section's headline/lines verbatim; never
 * invents copy the backend didn't produce.
 */
export function DailyBriefWidget({ data, loading, error, latencyMs }: DailyBriefWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando daily brief…</p>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Daily Brief</h3>
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
          <h3 className="text-sm font-semibold">Daily Brief</h3>
          {typeof data.scientificHealth === "number" ? (
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
              health {(data.scientificHealth * 100).toFixed(0)}%
            </code>
          ) : null}
        </div>
        <StatusChip status={data.status} />
      </div>

      {isUnavailable ? (
        <p className="mt-3 text-sm text-red-600">
          {data.error ?? "data-core indisponível"}. Exibindo estado seguro; nenhuma ação disponível.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {data.sections.map((s) => (
            <div key={s.title} className="rounded border border-zinc-100 p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">{s.title}</span>
              </div>
              <p className="text-xs text-zinc-500">{s.headline}</p>
              {s.lines.length > 0 ? (
                <ul className="mt-1 list-inside list-disc text-xs text-zinc-600">
                  {s.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-400">
        <span>source: data-core /universal-platform/daily-brief</span>
        {typeof latencyMs === "number" ? <span>latência: {latencyMs}ms</span> : null}
        <span>atualizado: {new Date(data.fetchedAt).toLocaleTimeString("pt-BR")}</span>
      </div>
    </Card>
  );
}

export default DailyBriefWidget;
