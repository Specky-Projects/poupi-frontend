import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND = getBackendUrl();
const SECRET  = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const token = await getToken({ req, secret: SECRET });

  const res = await fetch(`${BACKEND}/deal-score/product/${productId}`, {
    headers: token?.backendToken ? { Authorization: `Bearer ${token.backendToken as string}` } : undefined,
    next: { revalidate: 120 },
  });

  if (!res.ok) return NextResponse.json({ error: 'Erro ao calcular score' }, { status: res.status });
  return NextResponse.json(await res.json());
}
