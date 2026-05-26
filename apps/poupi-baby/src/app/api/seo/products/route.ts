import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = getBackendUrl("3001");

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const url = `${BACKEND}/seo/products${search ? `?${search}` : ''}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: res.status });
  return NextResponse.json(await res.json());
}
