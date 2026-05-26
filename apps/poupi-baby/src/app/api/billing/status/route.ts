import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasSessionCookie, unauthorized } from '@/lib/auth-fast-fail';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const res = await fetch(`${BACKEND}/billing/status`, {
    headers: { Authorization: `Bearer ${token.backendToken as string}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar status' }, { status: res.status });
  return NextResponse.json(await res.json());
}
