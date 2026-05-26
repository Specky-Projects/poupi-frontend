import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const token = await getToken({ req, secret: SECRET });

  return NextResponse.json({
    token: token
      ? { userId: token.userId, userEmail: token.userEmail, role: token.role, hasBackendToken: !!token.backendToken }
      : null,
    env: {
      NEXTAUTH_SECRET: SECRET ? '✓ definido' : '✗ AUSENTE',
      BACKEND_URL: process.env.BACKEND_URL ? 'defined' : 'development default',
    },
  });
}
