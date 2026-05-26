import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subscriptionId } = await req.json();
  const res = await fetch(`${BACKEND}/billing/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
    },
    body: JSON.stringify({ subscriptionId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return NextResponse.json({ error: (data as any)?.message || 'Erro ao cancelar' }, { status: res.status });
  return NextResponse.json(data);
}
