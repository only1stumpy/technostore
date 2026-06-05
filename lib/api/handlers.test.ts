import { describe, expect, test } from 'bun:test';
import { Prisma } from '@prisma/client';
import { ValidationError } from '@/lib/errors';
import { errorResponse } from './handlers';

describe('errorResponse', () => {
  test('maps validation error with details', async () => {
    const response = errorResponse(new ValidationError('Invalid input', { phone: ['Required'] }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid input',
      code: 'VALIDATION_ERROR',
      details: { phone: ['Required'] },
    });
  });

  test('maps Prisma unique constraint error', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.8.0',
      meta: { target: ['slug'] },
    });
    const response = errorResponse(error);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: 'Duplicate entry', code: 'DUPLICATE_ENTRY' });
  });

  test('maps unknown error', async () => {
    const originalConsoleError = console.error;
    console.error = () => undefined;
    try {
      const response = errorResponse(new Error('Unexpected'));
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: 'Внутренняя ошибка сервера',
        code: 'INTERNAL_ERROR',
      });
    } finally {
      console.error = originalConsoleError;
    }
  });
});
