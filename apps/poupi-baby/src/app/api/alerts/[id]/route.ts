import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${BACKEND}/alerts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token.backendToken as string}` },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const res = await fetch(`${BACKEND}/alerts/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token.backendToken as string}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Backend may not support PATCH yet — return 501 with clear message instead of crashing
  if (res.status === 404 || res.status === 405) {
    return NextResponse.json({ error: 'Edição de meta não suportada pelo servidor ainda.' }, { status: 501 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
