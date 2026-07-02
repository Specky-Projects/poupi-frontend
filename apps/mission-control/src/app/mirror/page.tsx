"use client";

import { PageShell } from "@poupi-frontend/ui";

import { PlaceholderCard } from "@/components/PlaceholderCard";
import { KillSwitchWidget } from "@/components/widgets/KillSwitchWidget";
import { useKillSwitch } from "@/lib/useKillSwitch";

export default function MirrorPage() {
  const killSwitch = useKillSwitch();

  return (
    <PageShell
      title="Mirror"
      subtitle="Fase 1: Kill Switch Observability ligado a dados reais (poupi-crypto). Mirror core, Committee e Portfolio seguem Fase 0 (audit pending)."
    >
      <section>
        <KillSwitchWidget data={killSwitch.data} loading={killSwitch.loading} error={killSwitch.error} />
      </section>

      <section>
        <PlaceholderCard
          label="Mirror — Rankings, Stakes, Committee decisions"
          source="poupi-crypto mirror_v2_routes /rankings, /stakes, /committee, /dashboard"
        />
      </section>

      <section>
        <PlaceholderCard
          label="Committee — Readiness"
          source="poupi-crypto meta_committee_routes /dashboard"
        />
      </section>

      <section>
        <PlaceholderCard label="Portfolio — Ranking" source="poupi-crypto portfolio_routes /dashboard" />
      </section>
    </PageShell>
  );
}
