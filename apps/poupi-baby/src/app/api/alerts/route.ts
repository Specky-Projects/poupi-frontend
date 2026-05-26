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

  const res = await bFetch('/alerts/my-alerts', token.backendToken as string);
  const data = await res.json().catch(() => []);
  if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: res.status });
  return NextResponse.json(Array.isArray(data) ? data : [], { status: res.status });
}

export async function POST(req: NextRequest) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const body = await req.json();
  const res = await bFetch('/alerts', token.backendToken as string, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.ok ? 201 : res.status });
}
