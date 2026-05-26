export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    service: 'poupi-frontend-baby',
    timestamp: new Date().toISOString(),
  });
}
