import { Card, MetricCard, PageShell } from "@poupi-frontend/ui";

const metrics = [{ label: "Anuncios", value: "0", detail: "monitorados" }, { label: "Score medio", value: "--", detail: "oportunidade" }, { label: "Cidades", value: "0", detail: "ativas" }];
const sections = [{ title: "Anuncios", body: "Lista e comparacao de listings coletados pelo Data Core." }, { title: "Historico de preco", body: "Evolucao por imovel, bairro e cidade." }, { title: "Score", body: "Modelo futuro para oportunidade, liquidez e preco relativo." }, { title: "Mapa", body: "Espaco reservado para visualizacao geografica." }];

export default function Page() {
  return (
    <PageShell title="Real Estate Dashboard" subtitle="Lab de imoveis para anuncios, historico, score de oportunidade e mapa futuro.">
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
