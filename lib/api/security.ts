import { NextRequest } from 'next/server';
import { ForbiddenError } from '@/lib/errors';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean) as string[];

export function validateOrigin(request: NextRequest): void {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    return;
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  const allowedOrigins = new Set([...ALLOWED_ORIGINS, request.nextUrl.origin]);

  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    throw new ForbiddenError('Invalid request origin');
  }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}
