import { Card, MetricCard, PageShell } from "@poupi-frontend/ui";

const metrics = [{ label: "Mercados", value: "0", detail: "ativos" }, { label: "EV medio", value: "--", detail: "estimado" }, { label: "CLV", value: "--", detail: "tracking" }];
const sections = [{ title: "Odds", body: "Comparacao de linhas e precos por bookmaker." }, { title: "CLV", body: "Tracking de fechamento por selecao e mercado." }, { title: "EV", body: "Calculo futuro baseado em probabilidade propria." }, { title: "Historico", body: "Snapshots persistidos pelo Data Core." }];

export default function Page() {
  return (
    <PageShell title="Sports Dashboard" subtitle="Lab de odds esportivas para odds, CLV, EV, historico e tracking.">
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
