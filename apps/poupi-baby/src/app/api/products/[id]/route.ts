import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await bFetch(`/products/${id}`, token.backendToken as string);
  if (!res.ok) return NextResponse.json({ error: 'Produto nao encontrado' }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await bFetch(`/products/${id}`, token.backendToken as string, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ error: (data as any)?.message || 'Erro ao deletar' }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}
