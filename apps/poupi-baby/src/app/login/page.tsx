'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';


const products = [
  {
    name: 'iPhone 15',
    price: '4.299',
    change: '-12%',
    image: '/images/iphone15.jpg',
  },
  {
    name: 'Galaxy S24',
    price: '3.199',
    change: '-18%',
    image: '/images/galaxys24.jpg',
  },
  {
    name: 'MacBook Air M2',
    price: '8.499',
    change: '-5%',
    image: '/images/macbook.jpg',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  function callbackUrl() {
    if (typeof window === 'undefined') return '/admin/dashboard';
    const value = new URLSearchParams(window.location.search).get('callbackUrl');
    return value?.startsWith('/') && !value.startsWith('//') ? value : '/admin/dashboard';
  }

  // BUG-32: handler real para o botão de login
  async function handleEmailLogin() {
    if (!email || !password) {
      setLoginError('Preencha email e senha.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl(),
    });

    setLoginLoading(false);

    if (result?.error) {
      setLoginError('Email ou senha inválidos.');
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <main className="flex min-h-screen overflow-hidden bg-[#f5f5f7]">

      {/* LEFT SIDE */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f2b3a] via-[#35006e] to-[#7b2cff] lg:flex lg:w-[42%] xl:w-[45%]">

        {/* GLOW 1 */}
        <div className="absolute left-[-100px] top-[-100px] h-[320px] w-[320px] rounded-full bg-[#67ff9a]/20 blur-3xl" />

        {/* GLOW 2 */}
        <div className="absolute bottom-[-120px] right-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" />

        {/* CONTENT */}
        <div className="relative z-10 flex w-full flex-col justify-between px-8 py-8 xl:px-12 xl:py-12">

          {/* TOP */}
          <div>

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black tracking-tight text-white xl:text-6xl">
                Poupi
              </h1>
              <div className="mt-2 h-3 w-3 rounded-full bg-[#2cff72] xl:h-4 xl:w-4" />
            </div>

            {/* TAGLINE */}
            <div className="mt-5 space-y-1 xl:mt-6">
              <p className="text-2xl font-light text-white/90 xl:text-3xl">
                Poupe hoje.
              </p>
              <p className="max-w-[300px] text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                Viva melhor amanhã.
              </p>
            </div>

            {/* BADGES */}
            <div className="mt-6 flex flex-col gap-2 xl:mt-8 xl:gap-3">
              {['Preços em tempo real', 'Alertas inteligentes', '12+ marketplaces'].map((item) => (
                <div
                  key={item}
                  className="flex w-fit items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md xl:px-5 xl:py-2"
                >
                  <div className="h-2 w-2 rounded-full bg-[#2cff72]" />
                  <span className="text-sm font-medium text-white xl:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PHONE — menor: h-[360px] w-[180px], xl: h-[400px] w-[200px] */}
          <div className="relative mt-8 flex justify-center xl:mt-10">
            <div className="relative h-[360px] w-[180px] overflow-hidden rounded-[38px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl xl:h-[400px] xl:w-[200px]">

              {/* DYNAMIC ISLAND */}
              <div className="absolute left-1/2 top-0 z-20 h-[20px] w-[90px] -translate-x-1/2 rounded-b-3xl bg-black" />

              {/* INNER CONTENT */}
              <div className="p-3 pt-8">

                {/* HERO CARD */}
                <div className="rounded-2xl border border-white/10 bg-white/15 p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/60">
                    Menor preço hoje
                  </p>
                  <h2 className="mt-1.5 whitespace-nowrap text-2xl font-black leading-none text-white xl:text-3xl">
                    R$ 3.199
                  </h2>
                  <p className="mt-1 text-[10px] font-semibold text-[#2cff72]">
                    ↓ 18% vs semana passada
                  </p>
                </div>

                {/* PRODUCT LIST */}
                <div className="mt-3 space-y-2">
                  {products.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-2.5 py-2 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 overflow-hidden rounded-lg flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[9px] leading-none text-white/70">
                            {item.name}
                          </p>
                          <p className="mt-1 whitespace-nowrap text-sm font-bold leading-none text-white">
                            R$ {item.price}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-full bg-[#2cff72]/20 px-2 py-0.5 text-[9px] font-bold text-[#2cff72]">
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RIGHT SIDE */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#f7f7f9] px-4 py-8 sm:px-6">

        {/* GRID BG */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(#dcdcdc 1px, transparent 1px), linear-gradient(90deg, #dcdcdc 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* CARD */}
        <div className="relative z-10 w-full max-w-[480px] rounded-[32px] bg-white px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:px-10 sm:py-10 xl:px-12 xl:py-12">

          <p className="text-center text-[10px] font-bold tracking-[4px] text-[#6f36ff] sm:text-xs sm:tracking-[5px]">
            POUPI.COM.BR
          </p>

          <h1 className="mt-3 text-center text-4xl font-black text-[#0f172a] sm:text-5xl xl:text-6xl">
            Entrar
          </h1>

          <p className="mt-3 text-center text-base leading-7 text-[#6b7280] sm:text-lg xl:text-xl xl:leading-8">
            Acesse sua conta e monitore seus produtos
          </p>

          <div className="mt-8 xl:mt-10">

            {/* EMAIL */}
            <div>
              <label className="text-sm font-semibold text-[#111827] sm:text-base">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2.5 h-[56px] w-full rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-5 text-base outline-none transition focus:border-[#6f36ff] sm:h-[64px] sm:px-6"
              />
            </div>

            {/* PASSWORD */}
            <div className="mt-5 sm:mt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#111827] sm:text-base">
                  Senha
                </label>
                <button className="text-xs font-semibold text-[#6f36ff] sm:text-sm">
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2.5 h-[56px] w-full rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-5 text-base outline-none transition focus:border-[#6f36ff] sm:h-[64px] sm:px-6"
              />
            </div>

            {/* ERRO */}
            {loginError && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
                {loginError}
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={handleEmailLogin}
              disabled={loginLoading}
              className="mt-7 h-[60px] w-full rounded-2xl bg-gradient-to-r from-[#6f36ff] to-[#8b3dff] text-lg font-bold text-white shadow-[0_10px_30px_rgba(111,54,255,0.35)] transition hover:scale-[1.01] disabled:opacity-60 sm:h-[68px] sm:text-xl"
            >
              {loginLoading ? 'Entrando...' : 'Entrar →'}
            </button>

            {/* DIVIDER */}
            <div className="my-7 flex items-center gap-4 sm:my-8">
              <div className="h-[1px] flex-1 bg-[#e5e7eb]" />
              <span className="text-xs text-[#9ca3af] sm:text-sm">OU</span>
              <div className="h-[1px] flex-1 bg-[#e5e7eb]" />
            </div>

            {/* GOOGLE */}
<button
  onClick={() => signIn('google', { callbackUrl: callbackUrl() })}
  className="flex h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white text-base font-semibold text-[#111827] transition hover:bg-[#fafafa] sm:h-[64px] sm:text-lg"
>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 sm:h-6 sm:w-6">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7.1l6.2 5.2C39.7 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
              </svg>
              Continuar com Google
            </button>

            {/* FOOTER */}
            <p className="mt-7 text-center text-sm text-[#6b7280] sm:mt-8 sm:text-base">
              Não tem conta?{' '}
              <span className="font-bold text-[#6f36ff]">Criar conta grátis</span>
            </p>

          </div>
        </div>
      </section>
    </main>
  );
}
