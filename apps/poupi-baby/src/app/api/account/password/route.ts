import { getBackendUrl } from '@/lib/backend-url';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasSessionCookie, unauthorized } from '@/lib/auth-fast-fail';

const BACKEND = getBackendUrl();
const SECRET = process.env.NEXTAUTH_SECRET;

export async function PATCH(req: NextRequest) {
  if (!hasSessionCookie(req)) return unauthorized();
  const token = await getToken({ req, secret: SECRET });
  if (!token?.backendToken) return unauthorized();

  const body = await req.json();
  const res = await fetch(`${BACKEND}/auth/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.backendToken as string}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
