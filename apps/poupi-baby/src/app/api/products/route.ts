import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasSessionCookie, unauthorized } from '@/lib/auth-fast-fail';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

function bFetch(path: string, token: string, options?: RequestInit) {
  return fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

export async function GET(req: NextRequest) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const res = await bFetch('/products', token.backendToken as string);
  if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });

  const res = await bFetch('/products/by-url', token.backendToken as string, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: (data as any)?.message || 'Erro ao adicionar' }, { status: res.status });
  return NextResponse.json(data, { status: 201 });
}
