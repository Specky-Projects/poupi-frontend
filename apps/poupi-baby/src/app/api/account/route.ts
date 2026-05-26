import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasSessionCookie, unauthorized } from '@/lib/auth-fast-fail';

const BACKEND = getBackendUrl();
const SECRET = process.env.NEXTAUTH_SECRET;

async function backend(req: NextRequest, path: string, options?: RequestInit) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  return backend(req, '/auth/profile');
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return backend(req, '/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
