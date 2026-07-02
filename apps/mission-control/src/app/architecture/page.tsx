"use client";

import { PageShell } from "@poupi-frontend/ui";

import { CapabilityRegistryWidget } from "@/components/widgets/CapabilityRegistryWidget";
import { InfrastructureHealthWidget } from "@/components/widgets/InfrastructureHealthWidget";
import { PlatformStatusWidget } from "@/components/widgets/PlatformStatusWidget";
import { CAPABILITY_CATALOG } from "@/lib/capability-catalog";
import { useCapabilities } from "@/lib/useCapabilities";
import { useInfrastructureHealth } from "@/lib/useInfrastructureHealth";
import { usePlatformStatus } from "@/lib/usePlatformStatus";

export default function ArchitecturePage() {
  const capabilities = useCapabilities();
  const infrastructure = useInfrastructureHealth();
  const platform = usePlatformStatus();

  return (
    <PageShell
      title="Architecture Explorer"
      subtitle="Derivado automaticamente do Capability Registry (data-core). Nenhum catalogo manual: o codigo e a fonte de verdade."
    >
      <section>
        <PlatformStatusWidget
          data={platform.data}
          loading={platform.loading}
          error={platform.error}
          latencyMs={platform.latencyMs}
        />
      </section>

      <section>
        <InfrastructureHealthWidget
          data={infrastructure.data}
          loading={infrastructure.loading}
          error={infrastructure.error}
        />
      </section>

      <CapabilityRegistryWidget
        data={capabilities.data}
        catalogEntries={CAPABILITY_CATALOG}
        loading={capabilities.loading}
        error={capabilities.error}
      />
    </PageShell>
  );
}
