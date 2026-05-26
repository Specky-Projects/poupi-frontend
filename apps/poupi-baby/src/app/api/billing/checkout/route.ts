import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { planId } = await req.json();
  if (!planId) return NextResponse.json({ error: 'planId é obrigatório' }, { status: 400 });

  const res = await fetch(`${BACKEND}/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
    },
    body: JSON.stringify({ planId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: (data as any)?.message || 'Erro ao criar checkout' }, { status: res.status });
  return NextResponse.json(data);
}
