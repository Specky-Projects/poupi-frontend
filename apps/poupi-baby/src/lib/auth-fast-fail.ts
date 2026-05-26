import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export function hasSessionCookie(req: NextRequest) {
  return SESSION_COOKIES.some((name) => !!req.cookies.get(name)?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
