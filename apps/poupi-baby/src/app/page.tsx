'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const examples = [
  {
    name: 'Pampers Confort Sec XG',
    price: 'R$ 151,99',
    detail: 'R$ 1,65 por unidade',
    image: '/images/pampers.jpg',
  },
  {
    name: 'Nan Supreme 800g',
    price: 'R$ 64,50',
    detail: 'alerta quando baixar',
    image: '/images/nan.jpg',
  },
  {
    name: 'Huggies Rosto e Corpo',
    price: 'R$ 18,90',
    detail: 'comparacao por farmacia',
    image: '/images/huggies.jpg',
  },
];

const benefits = [
  'Compare ofertas de farmacias em um so lugar',
  'Veja preco por unidade para nao cair em falsa promocao',
  'Receba alerta quando um produto chegar no preco desejado',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#201335]">
      <header className="border-b border-[#eadff7] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-2xl font-semibold text-[#6c2bd9]">
            Poupi <span className="text-[#58bd7a]">baby</span>
          </div>
          <Link href="/login" className="text-sm font-semibold text-[#6c2bd9] hover:underline">
            Entrar
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6c2bd9]">
            Beta fechado
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Economize em fraldas, formulas e produtos baby sem ficar garimpando preco.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#675b77]">
            O Poupi Baby monitora produtos essenciais, compara farmacias e avisa quando o preco
            chega na sua meta. Feito para compras recorrentes de familia, nao para cupom aleatorio.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="rounded-lg bg-[#6c2bd9] px-5 py-3 text-sm font-bold text-white hover:bg-[#5a21c0]"
            >
              Criar conta com Google
            </button>
            <Link
              href="/login"
              className="rounded-lg border border-[#d9c8ef] bg-white px-5 py-3 text-center text-sm font-semibold text-[#6c2bd9] hover:bg-[#f7f2ee]"
            >
              Ja tenho conta
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[#eadff7] bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-[#f5efff] p-4">
            <p className="text-sm font-semibold text-[#6c2bd9]">Exemplos monitorados</p>
            <p className="mt-1 text-xs text-[#675b77]">Amostra do que o beta ja acompanha.</p>
          </div>
          <div className="mt-4 grid gap-3">
            {examples.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-lg border border-[#f1e9fb] p-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f8f3ff]">
                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-[#675b77]">{item.detail}</p>
                </div>
                <p className="text-sm font-bold text-[#6c2bd9]">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadff7] bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3">
          {benefits.map((item) => (
            <div key={item} className="rounded-lg border border-[#eadff7] p-4">
              <div className="mb-3 h-2 w-10 rounded-full bg-[#58bd7a]" />
              <p className="text-sm font-medium leading-6">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-lg bg-[#201335] p-6 text-white">
          <h2 className="text-xl font-semibold">Preparado para o beta fechado</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Entre com Google, adicione produtos pelo painel, crie alertas e conecte o Telegram pela
            pagina da conta para receber notificacoes.
          </p>
        </div>
      </section>
    </main>
  );
}
