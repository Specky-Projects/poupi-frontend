import { Card } from "@poupi-frontend/ui";

/**
 * Honest "not wired yet" card — used by the `[section]` catch-all placeholder
 * screen and by any composed screen (e.g. Operator Cockpit) that needs to show
 * a row for a domain with no live capability, without implying it works.
 */
export function PlaceholderCard({
  label,
  source,
  phase = "Fase 2",
}: {
  label: string;
  source?: string;
  phase?: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
          {phase}
        </span>
        <span className="text-sm text-zinc-500">Ainda não conectado a dados reais.</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-600">
        {label} consumirá dados existentes de{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">{source ?? "fonte a definir"}</code>{" "}
        via o BFF do Mission Control, sem duplicar lógica de negócio nem criar novos serviços.
      </p>
    </Card>
  );
}
