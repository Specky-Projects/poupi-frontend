import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-[#201335]">
      <article className="mx-auto max-w-3xl rounded-lg border border-[#eadff7] bg-white p-8 shadow-sm">
        <Link href="/dashboard" className="text-sm font-medium text-[#6c2bd9]">Voltar</Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Política de Privacidade</h1>
        <p className="mt-4 text-[#675b77]">A Poupi Baby usa seus dados para manter sua conta, monitorar produtos e enviar alertas de preço.</p>
        {[
          ['Dados coletados', 'Coletamos nome, e-mail, telefone opcional, produtos monitorados, alertas criados e informações técnicas necessárias para segurança e funcionamento da plataforma.'],
          ['Uso das informações', 'Usamos esses dados para autenticação, personalização da experiência, confirmação de e-mail, envio de notificações e melhoria do serviço.'],
          ['Compartilhamento', 'Não vendemos dados pessoais. Podemos compartilhar informações somente com provedores essenciais de infraestrutura, pagamento e envio de notificações.'],
          ['Segurança', 'Mantemos controles de acesso, senhas criptografadas e monitoramento operacional para reduzir riscos.'],
          ['Seus direitos', 'Você pode atualizar seus dados na página Minha conta e solicitar suporte para exclusão ou revisão de informações.'],
        ].map(([title, text]) => (
          <section key={title} className="mt-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#675b77]">{text}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
