import { getBackendUrl } from '@/lib/backend-url';
import { NextResponse } from 'next/server';

const BACKEND = getBackendUrl("3001");

export async function GET() {
  const res = await fetch(`${BACKEND}/seo/marketplaces`, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: 'Erro ao buscar farmácias' }, { status: res.status });
  return NextResponse.json(await res.json());
}
