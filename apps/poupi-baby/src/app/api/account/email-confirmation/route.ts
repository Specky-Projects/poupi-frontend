import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasSessionCookie, unauthorized } from '@/lib/auth-fast-fail';

const BACKEND = getBackendUrl();
const SECRET = process.env.NEXTAUTH_SECRET;

async function post(req: NextRequest, path: string, body?: unknown) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const res = await fetch(`${BACKEND}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body?.code) {
    return post(req, '/auth/email-confirmation/confirm', body);
  }
  return post(req, '/auth/email-confirmation/request');
}
