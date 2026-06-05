import { describe, expect, test } from 'bun:test';
import { decodeCursor, encodeCursor } from './pagination';

describe('cursor pagination', () => {
  test.each([
    ['2026-06-05T12:34:56.000Z', 'product-date'],
    ['19999.95', 'product-price'],
    ['Ноутбук игровой', 'product-name'],
  ])('round trips %s', (sortField, id) => {
    expect(decodeCursor(encodeCursor(sortField, id))).toEqual({ sortField, id });
  });

  test('decodes legacy cursor format using the last colon', () => {
    const cursor = Buffer.from('2026-06-05T12:34:56.000Z:product-id').toString('base64url');
    expect(decodeCursor(cursor)).toEqual({
      sortField: '2026-06-05T12:34:56.000Z',
      id: 'product-id',
    });
  });

  test.each(['', 'not-base64-json', Buffer.from('{}').toString('base64url')])(
    'returns null for invalid cursor %s',
    (cursor) => {
      expect(decodeCursor(cursor)).toBeNull();
    }
  );
});
