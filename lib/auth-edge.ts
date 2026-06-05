import { jwtVerify } from 'jose';
import type { JWTPayload } from '@/types/api';

const JWT_SECRET_STRING = process.env.JWT_SECRET;
if (!JWT_SECRET_STRING) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}
