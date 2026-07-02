import Link from "next/link";

import { Card } from "@poupi-frontend/ui";

import { StatusChip } from "@/components/StatusChip";
import { buildDomainStrip, type DomainStripStatus } from "@/lib/domain-strip";
import type { OperationalStatus, OverviewPayload } from "@/lib/contracts";

export type DomainStripWidgetProps = {
  overview: OverviewPayload | null;
  loading?: boolean;
};

/** Reuses StatusChip's existing color bands; only the label changes. */
const CHIP: Record<DomainStripStatus, { status: OperationalStatus; label: string }> = {
  LIVE: { status: "READY", label: "LIVE" },
  BLOCKED: { status: "READY_WITH_OBSERVATIONS", label: "BLOCKED" },
  PLANNED: { status: "NOT_AVAILABLE", label: "PLANNED" },
  NO_DATA: { status: "NO_DATA", label: "NO_DATA" },
};

export function DomainStripWidget({ overview, loading }: DomainStripWidgetProps) {
  const tiles = buildDomainStrip(overview);

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Status por domínio operacional</h2>
      {loading && !overview ? (
        <Card>
          <p className="text-sm text-zinc-500">Carregando status por domínio...</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map(({ item, status, capabilityCount }) => {
            const chip = CHIP[status];
            return (
              <Link key={item.key} href={item.href}>
                <Card className="flex flex-col gap-2 transition hover:border-zinc-300 hover:shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <StatusChip status={chip.status} label={chip.label} />
                  </div>
                  <span className="text-xs text-zinc-400">
                    {capabilityCount > 0
                      ? `${capabilityCount} capabilit${capabilityCount === 1 ? "y" : "ies"} catalogada${capabilityCount === 1 ? "" : "s"}`
                      : "sem capability catalogada"}
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
