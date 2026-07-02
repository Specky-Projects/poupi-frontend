import { Card, MetricCard } from "@poupi-frontend/ui";

import { HealthBadge } from "@/components/HealthBadge";
import { StatusChip } from "@/components/StatusChip";
import type { OverviewPayload } from "@/lib/contracts";

export type OverviewStatusWidgetProps = {
  data: OverviewPayload | null;
  loading?: boolean;
  error?: string | null;
};

export function OverviewStatusWidget({ data, loading, error }: OverviewStatusWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando status executivo...</p>
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

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-sm text-zinc-500">Health Score global</div>
          <div className="mt-2">
            <HealthBadge score={data.healthScore} />
          </div>
          <div className="mt-3">
            <StatusChip status={data.overall} />
          </div>
        </Card>
        <MetricCard
          label="Dominios monitorados"
          value={String(data.domains.length)}
          detail="via certificacao de producao"
        />
        <MetricCard
          label="Ultima certificacao"
          value={data.generatedAt ? new Date(data.generatedAt).toLocaleString("pt-BR") : "-"}
          detail={data.generatedAt ? "snapshot mais recente" : "nenhuma execucao ainda"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Status por dominio</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.domains.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-500">Sem dados de dominio.</p>
            </Card>
          ) : (
            data.domains.map((d) => (
              <Card key={d.domain} className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.domain}</span>
                <StatusChip status={d.status} />
              </Card>
            ))
          )}
        </div>
      </section>

      {data.notes.length > 0 ? (
        <section>
          <Card>
            <h2 className="text-sm font-semibold">Notas</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600">
              {data.notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}
    </>
  );
}
