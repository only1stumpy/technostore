import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { isAppError, ValidationError, RateLimitError, type AppError } from '@/lib/errors';
import type { ApiErrorResponse } from './types';

export async function parseJson<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError('Invalid JSON format', {
      json: ['Request body must be valid JSON'],
    });
  }
}

export async function parseParams<T extends z.ZodType>(
  params: Promise<Record<string, string>>,
  schema: T
): Promise<z.infer<T>> {
  const resolved = await params;
  const result = schema.safeParse(resolved);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    throw new ValidationError('Invalid path parameters', fieldErrors as Record<string, string[]>);
  }

  return result.data;
}

export function parseQuery<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    throw new ValidationError('Invalid query parameters', fieldErrors as Record<string, string[]>);
  }

  return result.data;
}

function extractRetryAfterSeconds(message: string): number | null {
  const match = message.match(/(\d+)\s+minutes?/);
  return match ? parseInt(match[1], 10) * 60 : null;
}

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case 'P2002':
      return { message: 'Duplicate entry', code: 'DUPLICATE_ENTRY', status: 409 };
    case 'P2025':
      return { message: 'Record not found', code: 'NOT_FOUND', status: 404 };
    default:
      return { message: 'Database error', code: 'DATABASE_ERROR', status: 500 };
  }
}

export function errorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof z.ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    return NextResponse.json(
      {
        error: error.issues[0]?.message || 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: fieldErrors as Record<string, string[]>,
      },
      { status: 400 }
    );
  }

  if (isAppError(error)) {
    const appError = error as AppError;
    const response: ApiErrorResponse = {
      error: appError.message,
      code: appError.code,
    };

    if (error instanceof ValidationError && (error as ValidationError).details) {
      response.details = (error as ValidationError).details;
    }

    if (error instanceof RateLimitError) {
      const retryAfter = extractRetryAfterSeconds(appError.message);
      return NextResponse.json(response, {
        status: appError.statusCode,
        headers: retryAfter ? { 'Retry-After': String(retryAfter) } : {},
      });
    }

    return NextResponse.json(response, { status: appError.statusCode });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(error);
    return NextResponse.json(
      { error: mapped.message, code: mapped.code },
      { status: mapped.status }
    );
  }

  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: 'Внутренняя ошибка сервера', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
