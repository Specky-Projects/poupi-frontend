import type { OperationalStatus } from "@/lib/contracts";

const STYLES: Record<OperationalStatus, { dot: string; text: string; bg: string; label: string }> = {
  READY: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 ring-emerald-200", label: "Ready" },
  READY_WITH_OBSERVATIONS: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50 ring-amber-200", label: "Observations" },
  NOT_READY: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50 ring-red-200", label: "Not Ready" },
  NOT_AVAILABLE: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-50 ring-zinc-200", label: "N/A" },
  NO_DATA: { dot: "bg-zinc-400", text: "text-zinc-600", bg: "bg-zinc-50 ring-zinc-200", label: "No Data" },
};

export function StatusChip({ status, label }: { status: OperationalStatus; label?: string }) {
  const s = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {label ?? s.label}
    </span>
  );
}
