import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BACKEND = getBackendUrl();
const SECRET = process.env.NEXTAUTH_SECRET;
const CACHE_TTL_MS = 5_000;

const getCache = new Map<string, { expiresAt: number; data: unknown; status: number }>();

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

function backendPath(path: string[] = [], search: string) {
  const suffix = path.map(encodeURIComponent).join('/');
  return `/admin/${suffix}${search}`;
}

async function proxyAdmin(req: NextRequest, context: RouteContext) {
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  if (String(token.role ?? '').toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Acesso admin requerido' }, { status: 403 });
  }

  const { path } = await context.params;
  const targetPath = backendPath(path, req.nextUrl.search);
  const method = req.method.toUpperCase();
  const cacheKey = `${method}:${targetPath}:${token.backendToken}`;

  if (method === 'GET') {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, { status: cached.status });
    }
  }

  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.text();
  const res = await fetch(`${BACKEND}${targetPath}`, {
    method,
    body,
    headers: {
      'Content-Type': req.headers.get('content-type') ?? 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
    },
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? safeJson(text) : {};

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message ?? data?.error ?? `Erro ${res.status} no backend admin` },
      { status: res.status },
    );
  }

  if (method === 'GET') {
    getCache.set(cacheKey, { data, status: res.status, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyAdmin(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyAdmin(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxyAdmin(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyAdmin(req, context);
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
