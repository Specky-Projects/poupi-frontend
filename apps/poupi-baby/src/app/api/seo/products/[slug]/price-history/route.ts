import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = getBackendUrl("3001");

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const days = req.nextUrl.searchParams.get('days') ?? '90';

  const res = await fetch(
    `${BACKEND}/seo/products/${encodeURIComponent(slug)}/price-history?days=${days}`,
    { next: { revalidate: 1800 } },
  );
  if (!res.ok) return NextResponse.json({ error: 'Histórico não encontrado' }, { status: res.status });
  return NextResponse.json(await res.json());
}
