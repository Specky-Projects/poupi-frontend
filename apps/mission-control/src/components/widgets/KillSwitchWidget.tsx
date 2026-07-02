import { Card, MetricCard } from "@poupi-frontend/ui";

import { displayValue, EMPTY_FIELD, NOT_AUDITED } from "@/lib/architecture-explorer";
import type {
  KillSwitchBffStatus,
  KillSwitchContract,
  KillSwitchEdgeStatus,
  KillSwitchRecoveryClassification,
} from "@/lib/contracts";

const STATUS: Record<KillSwitchBffStatus, { label: string; className: string }> = {
  ok: { label: "Operacional", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  degraded: { label: "Degradado", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  unavailable: { label: "Indisponível", className: "bg-red-50 text-red-700 ring-red-200" },
};

const EDGE_STYLE: Record<KillSwitchEdgeStatus, { label: string; className: string }> = {
  NORMAL: { label: "Normal", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  ATTENTION: { label: "Atenção", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  WARNING: { label: "Alerta", className: "bg-orange-50 text-orange-700 ring-orange-200" },
  CRITICAL: { label: "Crítico", className: "bg-red-50 text-red-700 ring-red-200" },
  UNKNOWN: { label: NOT_AUDITED, className: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
};

const RECOVERY_STYLE: Record<KillSwitchRecoveryClassification, { label: string; className: string }> = {
  FAVORÁVEL: { label: "Favorável", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  NEUTRA: { label: "Neutra", className: "bg-zinc-100 text-zinc-600 ring-zinc-200" },
  DESFAVORÁVEL: { label: "Desfavorável", className: "bg-red-50 text-red-700 ring-red-200" },
  UNKNOWN: { label: NOT_AUDITED, className: "bg-zinc-100 text-zinc-500 ring-zinc-200" },
};

function StatusPill({ status }: { status: KillSwitchBffStatus }) {
  const s = STATUS[status];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ring-1 ${s.className}`}>{s.label}</span>;
}

function EdgeStatusPill({ status }: { status: KillSwitchEdgeStatus }) {
  const s = EDGE_STYLE[status];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ring-1 ${s.className}`}>{s.label}</span>;
}

function RecoveryPill({ classification }: { classification: KillSwitchRecoveryClassification }) {
  const s = RECOVERY_STYLE[classification];
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ring-1 ${s.className}`}>{s.label}</span>;
}

function pct(value: number | null): string {
  return value === null ? EMPTY_FIELD : `${value}%`;
}

export type KillSwitchWidgetProps = {
  data: KillSwitchContract | null;
  loading?: boolean;
  error?: string | null;
};

/**
 * Reusable widget for the kill-switch.state capability. Purely
 * presentational — receives the BFF contract via props so it can be composed
 * on any screen. This endpoint does not expose a live triggered/not-triggered
 * boolean, so the widget always surfaces that explicitly instead of guessing.
 */
export function KillSwitchWidget({ data, loading, error }: KillSwitchWidgetProps) {
  if (loading && !data) {
    return (
      <Card>
        <p className="text-sm text-zinc-500">Carregando kill switch…</p>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Kill Switch</h3>
          <StatusPill status="unavailable" />
        </div>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const isUnavailable = data.status === "unavailable";
  const topLoser = data.rootCause.topLoser;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Kill Switch — Observability</div>
          <p className="mt-1 text-sm text-zinc-500">
            Source: poupi-crypto GET /api/v1/crypto/analytics/kill-switch/report
          </p>
        </div>
        <StatusPill status={data.status} />
      </div>

      {isUnavailable ? (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
          {data.error ?? "poupi-crypto indisponível"}
        </p>
      ) : null}

      <div className="mt-4 rounded bg-zinc-50 px-3 py-2 text-xs text-zinc-500 ring-1 ring-zinc-100">
        Estado do kill switch (acionado / não acionado): <strong>{NOT_AUDITED}</strong> — este endpoint não expõe
        telemetria ao vivo de acionamento. Os campos de DD abaixo são ecoados do request (default 0), não estado
        real.
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <MetricCard label="DD Diário (informado)" value={pct(data.ddDailyPct)} />
        <MetricCard label="DD Semanal (informado)" value={pct(data.ddWeeklyPct)} />
        <MetricCard label="DD Mensal (informado)" value={pct(data.ddMonthlyPct)} />
        <MetricCard
          label="Perdas Consecutivas (informado)"
          value={data.consecutiveLosses === null ? EMPTY_FIELD : String(data.consecutiveLosses)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Edge (pior sinal):</span>
          <EdgeStatusPill status={data.worstEdgeStatus} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Recuperação:</span>
          <RecoveryPill classification={data.recovery.classification} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-zinc-200 px-3 py-2 text-sm">
          <div className="font-medium">Causa raiz principal</div>
          {topLoser ? (
            <p className="mt-1 text-xs text-zinc-600">
              {topLoser.symbol} {topLoser.side} ({topLoser.strategy}) — PnL {displayValue(
                topLoser.pnlUsdt === null ? null : String(topLoser.pnlUsdt),
              )}{" "}
              USDT, {displayValue(topLoser.contributionPct === null ? null : `${topLoser.contributionPct}%`)} da
              perda
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">{NOT_AUDITED}</p>
          )}
          <p className="mt-1 text-xs text-zinc-400">
            {data.rootCause.contributorsCount} contribuidor(es) negativo(s) no período
          </p>
        </div>

        <div className="rounded border border-zinc-200 px-3 py-2 text-sm">
          <div className="font-medium">Recovery Intelligence</div>
          <p className="mt-1 text-xs text-zinc-600">
            {data.recovery.similarEventsFound} evento(s) histórico(s) similar(es) — probabilidade{" "}
            {pct(data.recovery.recoveryProbabilityPct)}
          </p>
        </div>
      </div>

      {data.edgeDeterioration.length > 0 ? (
        <div className="mt-4">
          <div className="text-xs font-medium text-zinc-500">Deterioração de edge (7d vs 30d)</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {data.edgeDeterioration.slice(0, 5).map((entry) => (
              <div
                key={`${entry.strategy}-${entry.side}`}
                className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-xs"
              >
                <span>
                  {entry.strategy} · {entry.side}
                </span>
                <EdgeStatusPill status={entry.status} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-100 pt-2 text-xs text-zinc-400">
        <span>gerado (backend): {data.generatedAt ? new Date(data.generatedAt).toLocaleString("pt-BR") : EMPTY_FIELD}</span>
        <span>atualizado (BFF): {new Date(data.fetchedAt).toLocaleTimeString("pt-BR")}</span>
      </div>

      {data.notes.length > 0 ? (
        <div className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100">
          {data.notes.join(" | ")}
        </div>
      ) : null}
    </Card>
  );
}

export default KillSwitchWidget;
