import { describe, expect, test } from 'bun:test';
import { getSafeCallbackUrl } from './utils';

describe('getSafeCallbackUrl', () => {
  test.each([
    '/',
    '/catalog',
    '/orders/123?tab=items#summary',
    '/поиск?q=ноутбук',
  ])('allows internal path %s', (value) => {
    expect(getSafeCallbackUrl(value)).toBe(value);
  });

  test.each([
    undefined,
    null,
    '',
    'https://example.com',
    'http://example.com',
    '//example.com',
    'javascript:alert(1)',
  ])('returns fallback for unsafe value %s', (value) => {
    expect(getSafeCallbackUrl(value)).toBe('/');
  });

  test('uses custom fallback', () => {
    expect(getSafeCallbackUrl('https://example.com', '/catalog')).toBe('/catalog');
  });
});
