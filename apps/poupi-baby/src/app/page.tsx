'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { track } from '@vercel/analytics';
import { BrandLogo, NuviiIcon } from '../components/brand/BrandLogo';
import { ProductSearch } from '../components/ProductSearch';

const categories = [
  { name: 'Fraldas',  href: '/categoria/fraldas',           icon: 'ti-baby-carriage', tone: 'bg-[#EDE7FF]',  accent: 'text-[#7C5CFF]' },
  { name: 'Lenços',   href: '/categoria/lencos-umedecidos', icon: 'ti-wash-machine',  tone: 'bg-[#FFF2CE]',  accent: 'text-[#92720a]' },
  { name: 'Cuidados', href: '/categoria/cuidados-do-bebe',  icon: 'ti-heart',         tone: 'bg-[#FFEAF3]',  accent: 'text-[#b13a6a]' },
  { name: 'Todos',    href: '/produtos',                    icon: 'ti-packages',      tone: 'bg-[#EEF4FF]',  accent: 'text-[#2f5ab1]' },
];

const benefits = [
  { title: 'Eu aviso quando for a hora certa', description: 'Receba alertas por Telegram ou e-mail quando o preço atingir sua meta. Sem precisar ficar verificando.', icon: 'ti-bell-ringing' },
  { title: 'Histórico real de preços', description: 'Veja se a oferta é realmente boa — ou se o preço "cheio" é o preço normal do dia a dia.', icon: 'ti-chart-line' },
  { title: 'Deal Score inteligente', description: 'Cada produto recebe uma nota de 0–100. Você decide em segundos: comprar agora ou esperar.', icon: 'ti-sparkles' },
  { title: 'Compare preço por unidade', description: 'Embalagem maior nem sempre é mais barata. Calculo o custo real por fralda, lenço ou dose.', icon: 'ti-coin' },
  { title: 'Monitoramento diário', description: 'Preços em farmácias, marketplaces e lojas infantis atualizados automaticamente.', icon: 'ti-building-store' },
  { title: 'Comece grátis, agora', description: 'Busque, compare e crie alertas sem compromisso. Sem cartão de crédito.', icon: 'ti-circle-check' },
];

const socialProof = [
  { text: '"Estava pagando R$ 189 em fralda. O Nuvii me avisou quando caiu para R$ 134. Economizei R$ 55 numa compra só."', author: 'Camila, mãe de gêmeos' },
  { text: '"Nunca mais compro fórmula sem checar aqui primeiro. O histórico de preços mudou como eu faço compras."', author: 'Rodrigo, pai de primeira viagem' },
  { text: '"Criei alerta para Pampers G e esqueci. Três dias depois chegou a notificação. Produto no carrinho em 2 minutos."', author: 'Fernanda, mãe de dois' },
];

const monitoredStores = [
  { name: 'Amazon', logo: '/logos/amazon.svg' },
  { name: 'Magalu', logo: '/logos/magalu.svg' },
  { name: 'Mercado Livre', logo: '/logos/mercado-livre.svg' },
  { name: 'Drogasil', logo: '/logos/drogasil.svg' },
  { name: 'Raia', logo: '/logos/raia.svg' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F8FC] text-[#1A1D3B]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <BrandLogo compact />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#1A1D3B] md:flex">
            <a href="#como-funciona" className="hover:text-[#7C5CFF]">Como funciona</a>
            <Link href="/produtos" className="hover:text-[#7C5CFF]">Produtos</Link>
            <a href="#categorias" className="hover:text-[#7C5CFF]">Categorias</a>
            <Link href="/faq" className="hover:text-[#7C5CFF]">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/alertas" className="hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1A1D3B] shadow-sm ring-1 ring-[#E4E7F2] sm:inline-flex">
              <i className="ti ti-bell mr-2 text-[#7C5CFF]" />Alertas
            </Link>
            <button
              onClick={() => { track('login_cta_clicked', { source: 'home' }); signIn('google', { callbackUrl: '/dashboard' }); }}
              className="rounded-full bg-[#7C5CFF] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(124,92,255,0.3)] transition hover:bg-[#6B4DDE]"
            >
              Entrar / Cadastrar
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[linear-gradient(125deg,#F7F8FC_0%,#FFFFFF_40%,#EDE7FF_100%)]">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <BrandLogo href="/" className="justify-center" />
            <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Eu te aviso quando{' '}
              <span className="bg-gradient-to-r from-[#7C5CFF] to-[#22C55E] bg-clip-text text-transparent">
                for a hora certa
              </span>
              {' '}de comprar.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#3D4263]">
              Monitoro preços de fraldas, fórmulas, mamadeiras e tudo que o seu bebê precisa.
              Defina uma meta. Eu cuido do resto.
            </p>

            {/* Busca funcional */}
            <div className="mx-auto mt-8 max-w-2xl">
              <ProductSearch />
            </div>

            {/* Chips de prova rápida */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold text-[#1A1D3B]">
              {['100% gratuito para começar', 'Alertas por Telegram e e-mail', 'Deal Score em cada produto', 'Histórico real de preços'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[#E4E7F2]">
                  <i className="ti ti-check text-[#22C55E]" />{item}
                </span>
              ))}
            </div>
          </div>

          {/* Mock copiloto */}
          <div className="mx-auto mt-12 max-w-sm rounded-[2rem] border-[10px] border-[#1A1D3B] bg-white p-4 shadow-[0_30px_90px_rgba(26,29,59,0.22)]">
            <div className="mb-4 flex items-center justify-between">
              <BrandLogo compact href="/" />
              <i className="ti ti-bell text-xl text-[#7C5CFF]" />
            </div>
            <div className="rounded-2xl bg-[#EDE7FF] px-4 py-3 text-sm font-semibold text-[#7C5CFF]">
              <i className="ti ti-bell-ringing mr-2" />
              🔥 Fralda Pampers G — menor preço dos últimos 30 dias!
            </div>
            <div className="mt-4 rounded-2xl bg-[#F7F8FC] p-3">
              <div className="text-xs font-semibold text-[#5B607C]">Deal Score</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-black text-[#22C55E]">91</span>
                <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-xs font-bold text-[#2f8a51]">🔥 Oferta Forte</span>
              </div>
              <div className="mt-1 text-xs text-[#5B607C]">Eu aproveitaria essa oferta agora.</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-2xl bg-[#7C5CFF] px-3 py-2 text-xs font-bold text-white">Ver oferta →</button>
              <button className="rounded-2xl border border-[#E4E7F2] px-3 py-2 text-xs font-semibold text-[#5B607C]">Criar alerta</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Lojas monitoradas ── */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-center text-sm font-semibold text-[#8A8FB1]">Monitoramos preços em</p>
          <div className="mx-auto mt-4 grid max-w-2xl grid-cols-5 gap-3">
            {monitoredStores.map((store) => (
              <div key={store.name} className="flex h-14 items-center justify-center rounded-xl border border-[#EEF0F8] bg-white px-3">
                <img src={store.logo} alt={`Logo ${store.name}`} width={180} height={56} className="h-9 w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorias ── */}
      <section id="categorias" className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 max-w-xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7C5CFF]">Categorias</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">Por onde você quer começar?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} href={category.href} className={`rounded-[24px] ${category.tone} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
              <i className={`ti ${category.icon} text-3xl ${category.accent}`} />
              <h2 className="mt-5 text-lg font-black">{category.name}</h2>
              <p className="mt-2 text-sm font-semibold text-[#3D4263]">Ver melhores ofertas →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7C5CFF]">Como funciona</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Você busca uma vez. Eu monitoro pra sempre.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {([
              ['Busque o produto', 'Digite "fralda Pampers G" ou o nome do item que você precisa. Mostro preço em todas as lojas.'],
              ['Defina sua meta', 'Crie um alerta com o preço que faz sentido para você. Em 30 segundos.'],
              ['Eu aviso na hora certa', 'Quando o preço cair para sua meta, você recebe uma notificação por Telegram ou e-mail.'],
            ] as const).map(([title, description], index) => (
              <article key={title} className="rounded-[24px] border border-[#E4E7F2] bg-[#FBFCFF] p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C5CFF] text-lg font-black text-white">{index + 1}</span>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#3D4263]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map(({ title, description, icon }) => (
            <article key={title} className="rounded-[24px] border border-[#E4E7F2] bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE7FF] text-[#7C5CFF]">
                <i className={`ti ${icon} text-xl`} />
              </span>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#3D4263]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Prova social ── */}
      <section className="bg-[#1A1D3B] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7C5CFF]">O que as famílias dizem</p>
            <h2 className="mt-3 text-3xl font-black">Resultado real. Economia real.</h2>
            <p className="mt-2 text-xs text-white/40">Depoimentos ilustrativos — resultados individuais variam.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {socialProof.map(({ text, author }) => (
              <blockquote key={author} className="rounded-[24px] bg-white/8 p-6 ring-1 ring-white/10">
                <p className="text-sm leading-7 text-white/85">{text}</p>
                <footer className="mt-4 text-xs font-bold text-[#7C5CFF]">— {author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="overflow-hidden rounded-[2rem] bg-[#1A1D3B] text-white shadow-[0_24px_80px_rgba(26,29,59,0.24)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-8 sm:p-10">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/12 text-white">
              <NuviiIcon className="h-10 w-10" />
            </span>
            <h2 className="mt-6 text-3xl font-black tracking-tight">Pronto para ter um copiloto nas compras?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              Comece grátis. Sem cartão de crédito. Eu monitoro os preços enquanto você cuida do que importa.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 bg-[#7C5CFF] p-8 sm:p-10">
            <button
              onClick={() => { track('cta_hero_signup'); signIn('google', { callbackUrl: '/dashboard' }); }}
              className="rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-[#7C5CFF] hover:bg-[#F4F0FF]"
            >
              Criar conta grátis →
            </button>
            <Link href="/produtos" className="rounded-2xl border border-white/25 px-6 py-4 text-center text-sm font-black text-white hover:bg-white/10">
              Ver ofertas agora
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E4E7F2] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <BrandLogo compact />
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#3D4263]">
            <Link href="/privacidade" className="hover:text-[#7C5CFF]">Privacidade</Link>
            <Link href="/termos" className="hover:text-[#7C5CFF]">Termos</Link>
            <Link href="/faq" className="hover:text-[#7C5CFF]">FAQ</Link>
            <span className="text-[#8A8FB1]">© 2026 Nuvii Baby</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
