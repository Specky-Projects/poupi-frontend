"use client";

import { PageShell } from "@poupi-frontend/ui";

import { DomainStripWidget } from "@/components/widgets/DomainStripWidget";
import { OverviewStatusWidget } from "@/components/widgets/OverviewStatusWidget";
import { useOverview } from "@/lib/useOverview";

export default function OverviewPage() {
  const { data, error, loading } = useOverview();

  return (
    <PageShell
      title="Executive Dashboard"
      subtitle="Visao executiva do ecossistema Poupi: status por dominio, sem abrir terminal, logs ou banco."
    >
      <OverviewStatusWidget data={data} loading={loading} error={error} />
      <DomainStripWidget overview={data} loading={loading} />
    </PageShell>
  );
}
