import Link from 'next/link';

const items = [
  ['Como funcionam os alertas?', 'Você adiciona um produto e define uma meta. A Poupi Baby acompanha as ofertas e avisa quando o preço chega ao valor desejado.'],
  ['O que muda no Premium?', 'O Premium aumenta limites, libera mais histórico e melhora a prioridade de acompanhamento, conforme o plano escolhido.'],
  ['Como recebo notificações?', 'As notificações dependem do e-mail confirmado. Por isso recomendamos confirmar seu e-mail na página Minha conta.'],
  ['Quais pagamentos são aceitos?', 'Os pagamentos dependem do gateway configurado na plataforma. Em desenvolvimento, o sistema pode usar um gateway de teste.'],
  ['Posso cancelar?', 'Sim. O cancelamento pode ser feito na página de planos. O acesso permanece até o fim do período já pago quando houver assinatura ativa.'],
  ['Quais lojas são monitoradas?', 'A quantidade real de lojas aparece na home com base nas ofertas cadastradas. A plataforma não exibe lojas fictícias.'],
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-[#201335]">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-medium text-[#6c2bd9]">Voltar</Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Perguntas frequentes</h1>
        <p className="mt-2 text-sm text-[#675b77]">Respostas diretas sobre alertas, planos, notificações e lojas monitoradas.</p>
        <div className="mt-6 divide-y divide-[#f1e9fb] rounded-lg border border-[#eadff7] bg-white shadow-sm">
          {items.map(([question, answer]) => (
            <section key={question} className="p-5">
              <h2 className="font-semibold">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-[#675b77]">{answer}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
