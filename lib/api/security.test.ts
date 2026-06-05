import { beforeEach, describe, expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { validateOrigin } from './security';

function request(headers?: HeadersInit) {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    headers,
  });
}

describe('validateOrigin', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://technostore.example';
  });

  test('allows configured local origin', () => {
    expect(() => validateOrigin(request({ origin: 'http://localhost:3000' }))).not.toThrow();
  });

  test('allows configured local referer', () => {
    expect(() => validateOrigin(request({ referer: 'http://localhost:3000/checkout' }))).not.toThrow();
  });

  test('rejects foreign origin', () => {
    expect(() => validateOrigin(request({ origin: 'https://example.com' }))).toThrow('Invalid request origin');
  });

  test('allows request without origin and referer', () => {
    expect(() => validateOrigin(request())).not.toThrow();
  });
});
