import { Card, MetricCard, PageShell } from "@poupi-frontend/ui";

const metrics = [{ label: "BTC", value: "--", detail: "Data Core API" }, { label: "Alertas", value: "0", detail: "pendentes" }, { label: "Historico", value: "--", detail: "snapshots" }];
const sections = [{ title: "Precos", body: "Visao consolidada de ativos, variacao e liquidez." }, { title: "Alertas", body: "Area preparada para regras de preco, volatilidade e carteira." }, { title: "Graficos", body: "Componentes de grafico reutilizaveis devem vir de packages/ui." }, { title: "Historico", body: "Todos os dados devem vir do Data Core via packages/api-client." }];

export default function Page() {
  return (
    <PageShell title="Crypto Dashboard" subtitle="Painel pessoal para precos, alertas, graficos e historico de cripto.">
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
