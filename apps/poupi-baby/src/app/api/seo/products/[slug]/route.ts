import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND = getBackendUrl("3001");

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const res = await fetch(`${BACKEND}/seo/products/${encodeURIComponent(slug)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return NextResponse.json({ error: 'Produto não encontrado' }, { status: res.status });
  return NextResponse.json(await res.json());
}
