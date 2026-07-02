import { Card, MetricCard } from "@poupi-frontend/ui";

import type { HealthContract, InfrastructureHealthStatus } from "@/lib/contracts";

const STATUS: Record<InfrastructureHealthStatus, { label: string; className: string }> = {
  ok: {
    label: "Operacional",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  degraded: {
    label: "Degradado",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  unavailable: {
    label: "Indisponivel",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

export type InfrastructureHealthWidgetProps = {
  data: HealthContract | null;
  loading?: boolean;
  error?: string | null;
};

function StatusPill({ status }: { status: InfrastructureHealthStatus }) {
  const s = STATUS[status];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ring-1 ${s.className}`}>{s.label}</span>;
}

export function InfrastructureHealthWidget({ data, loading, error }: InfrastructureHealthWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando health/readiness...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const items = [...data.dependencies, ...data.checks];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Infrastructure Health</div>
          <p className="mt-1 text-sm text-zinc-500">Source: data-core /health + /ready</p>
        </div>
        <StatusPill status={data.status} />
      </div>

      {data.status === "unavailable" ? (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          {data.error ?? "data-core indisponivel"}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <MetricCard label="Health" value={data.healthStatus ?? "-"} detail={data.environment ?? "environment n/a"} />
        <MetricCard label="Ready" value={data.ready === null ? "-" : data.ready ? "true" : "false"} detail={data.decision ?? "decision n/a"} />
        <MetricCard label="Checks" value={String(items.length)} detail={data.operationalStatus ?? "operational n/a"} />
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={`${item.name}-${item.status}`} className="rounded border border-zinc-200 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-zinc-500">{item.status}</span>
              </div>
              {item.detail ? <p className="mt-1 text-xs text-zinc-500">{item.detail}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {data.blockers.length > 0 || data.notes.length > 0 ? (
        <div className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-100">
          {[...data.blockers, ...data.notes].join(" | ")}
        </div>
      ) : null}
    </Card>
  );
}
