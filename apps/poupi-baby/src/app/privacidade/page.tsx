import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#090A3D]">
      <article className="mx-auto max-w-3xl rounded-lg border border-[#E4E7F2] bg-white p-8 shadow-sm">
        <Link href="/dashboard" className="text-sm font-medium text-[#5B4CF0]">Voltar</Link>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">PolÃ­tica de Privacidade</h1>
        <p className="mt-4 text-[#5B607C]">O Radar do Berço usa seus dados para manter sua conta, monitorar produtos e enviar alertas de preÃ§o.</p>
        {[
          ['Dados coletados', 'Coletamos nome, e-mail, telefone opcional, produtos monitorados, alertas criados e informaÃ§Ãµes tÃ©cnicas necessÃ¡rias para seguranÃ§a e funcionamento da plataforma.'],
          ['Uso das informaÃ§Ãµes', 'Usamos esses dados para autenticaÃ§Ã£o, personalizaÃ§Ã£o da experiÃªncia, confirmaÃ§Ã£o de e-mail, envio de notificaÃ§Ãµes e melhoria do serviÃ§o.'],
          ['Compartilhamento', 'NÃ£o vendemos dados pessoais. Podemos compartilhar informaÃ§Ãµes somente com provedores essenciais de infraestrutura, pagamento e envio de notificaÃ§Ãµes.'],
          ['SeguranÃ§a', 'Mantemos controles de acesso, senhas criptografadas e monitoramento operacional para reduzir riscos.'],
          ['Seus direitos', 'VocÃª pode atualizar seus dados na pÃ¡gina Minha conta e solicitar suporte para exclusÃ£o ou revisÃ£o de informaÃ§Ãµes.'],
        ].map(([title, text]) => (
          <section key={title} className="mt-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5B607C]">{text}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
