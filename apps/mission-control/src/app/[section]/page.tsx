import { notFound } from "next/navigation";

import { PageShell } from "@poupi-frontend/ui";

import { PlaceholderCard } from "@/components/PlaceholderCard";
import { findNavItem } from "@/lib/nav";

/**
 * Phase-2 placeholder for every non-live sidebar section. It renders the real
 * section title and its intended data source so navigation is honest: the user
 * sees exactly which backend will feed the screen, and that it is not yet wired.
 */
export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const item = findNavItem(section);

  if (!item) notFound();

  return (
    <PageShell title={item.label} subtitle="Seção planejada para uma fase seguinte do Mission Control.">
      <PlaceholderCard label="Esta tela" source={item.source} />
    </PageShell>
  );
}
