import { Card, MetricCard, PageShell } from "@poupi-frontend/ui";

const metrics = [{ label: "Sinais", value: "0", detail: "ativos" }, { label: "PnL", value: "--", detail: "simulado" }, { label: "Risco", value: "--", detail: "portfolio" }];
const sections = [{ title: "Sinais", body: "Area para modelos e estrategias quantitativas." }, { title: "Backtests", body: "Comparacao de cenarios usando dados do Data Core." }, { title: "Risco", body: "Exposicao, drawdown e concentracao." }, { title: "Performance", body: "Metricas compartilhadas e graficos reutilizaveis." }];

export default function Page() {
  return (
    <PageShell title="Quant Dashboard" subtitle="Lab quantitativo para sinais, simulacoes, risco e performance futura.">
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <h2 className="text-base font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{section.body}</p>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
