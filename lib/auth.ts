import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload } from '@/types/api';
import { UnauthorizedError, ForbiddenError } from './errors';

const JWT_SECRET_STRING = process.env.JWT_SECRET;
if (!JWT_SECRET_STRING) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const JWT_COOKIE_NAME = 'auth-token';

export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME);
  return token?.value || null;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(JWT_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;

  return verifyToken(token);
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  return user;
}
