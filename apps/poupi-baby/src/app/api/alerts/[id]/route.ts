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
