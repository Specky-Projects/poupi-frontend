/** Large numeric health score (0..100) with a color band. */
export function HealthBadge({ score }: { score: number }) {
  const band =
    score >= 90 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : score > 0 ? "text-red-600" : "text-zinc-400";
  return (
    <div className="flex items-baseline gap-1">
      <span className={`text-4xl font-semibold tabular-nums ${band}`}>{score}</span>
      <span className="text-sm text-zinc-500">/ 100</span>
    </div>
  );
}
