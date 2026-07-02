"use client";

import { Card, PageShell } from "@poupi-frontend/ui";

import { PlaceholderCard } from "@/components/PlaceholderCard";
import { StatusChip } from "@/components/StatusChip";
import { AlertsWidget } from "@/components/widgets/AlertsWidget";
import { DailyBriefWidget } from "@/components/widgets/DailyBriefWidget";
import { InfrastructureHealthWidget } from "@/components/widgets/InfrastructureHealthWidget";
import { OverviewStatusWidget } from "@/components/widgets/OverviewStatusWidget";
import { CAPABILITY_CATALOG } from "@/lib/capability-catalog";
import { DELIVERY_STATUS_CHIP, certifiedCapabilities, incidentDomains, pendingCapabilities } from "@/lib/cockpit";
import { useAlerts } from "@/lib/useAlerts";
import { useDailyBrief } from "@/lib/useDailyBrief";
import { useInfrastructureHealth } from "@/lib/useInfrastructureHealth";
import { useOverview } from "@/lib/useOverview";

function findCapability(id: string) {
  return CAPABILITY_CATALOG.find((c) => c.id === id);
}

export default function CockpitPage() {
  const overview = useOverview();
  const infrastructure = useInfrastructureHealth();
  const dailyBriefData = useDailyBrief();
  const alertsData = useAlerts();

  const certified = certifiedCapabilities();
  const pending = pendingCapabilities();
  const incidents = incidentDomains(overview.data);

  const opportunities = findCapability("business-os.opportunities");

  return (
    <PageShell
      title="Operator Cockpit"
      subtitle="O que um operador precisa ver às 8h: composição de dados já reais + placeholders honestos onde nada existe ainda."
    >
      <section>
        <h2 className="mb-3 text-base font-semibold">1. Mission Summary</h2>
        <OverviewStatusWidget data={overview.data} loading={overview.loading} error={overview.error} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">2. Infrastructure Health</h2>
        <InfrastructureHealthWidget
          data={infrastructure.data}
          loading={infrastructure.loading}
          error={infrastructure.error}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">3. Production Certification</h2>
        <p className="mb-2 text-xs text-zinc-400">
          Derivado localmente de capability-catalog.ts (Fase ≥ 6) — sem nova chamada de backend.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certified.map((entry) => {
            const chip = DELIVERY_STATUS_CHIP[entry.status];
            return (
              <Card key={entry.id} className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{entry.name}</div>
                  <div className="text-xs text-zinc-400">
                    Fase {entry.phase} · produção: {entry.production}
                  </div>
                </div>
                <StatusChip status={chip.status} label={chip.label} />
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">4. Daily Brief</h2>
        <DailyBriefWidget
          data={dailyBriefData.data}
          loading={dailyBriefData.loading}
          error={dailyBriefData.error}
          latencyMs={dailyBriefData.latencyMs}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">5. Critical Alerts</h2>
        <AlertsWidget
          data={alertsData.data}
          loading={alertsData.loading}
          error={alertsData.error}
          latencyMs={alertsData.latencyMs}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">6. Current Incident</h2>
        {incidents === null ? (
          <Card>
            <p className="text-sm text-zinc-500">
              Sem sinal de incidente disponível — overview sem snapshot real no momento.
            </p>
          </Card>
        ) : incidents.length === 0 ? (
          <Card>
            <p className="text-sm text-emerald-700">Nenhum domínio reportando NOT_READY no snapshot atual.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incidents.map((d) => (
              <Card key={d.domain} className="flex items-center justify-between">
                <span className="text-sm font-medium">{d.domain}</span>
                <StatusChip status={d.status} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">7. Pending Actions</h2>
        <p className="mb-2 text-xs text-zinc-400">
          Derivado localmente de capability-catalog.ts (status blocked | planned).
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pending.map((entry) => {
            const chip = DELIVERY_STATUS_CHIP[entry.status];
            return (
              <Card key={entry.id} className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{entry.name}</div>
                  <div className="text-xs text-zinc-400">{entry.domain}</div>
                </div>
                <StatusChip status={chip.status} label={chip.label} />
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">8. Mirror</h2>
        <PlaceholderCard label="Mirror" source="poupi-crypto mirror_v2 (+ committee, kill-switch, portfolio)" phase="Fase 0 · planned" />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">9. Research</h2>
        <PlaceholderCard label="Research" source="poupi-crypto research/omega (não catalogado)" phase="Fase 0" />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">10. Business OS</h2>
        <PlaceholderCard
          label="Business OS"
          source={opportunities?.endpoint ?? "data-core business_os"}
          phase={`Fase ${opportunities?.phase ?? 1} · ${opportunities?.status ?? "audited"} — ${opportunities?.notes ?? ""}`}
        />
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">11. Poupi Baby</h2>
        <PlaceholderCard label="Poupi Baby" source="poupi-baby (runtime em standby)" phase="Fase 0" />
      </section>
    </PageShell>
  );
}
