import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import { comparisonService } from '@/lib/services/comparison.service';

const addComparisonSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const { productId } = addComparisonSchema.parse(body);
    const comparison = await comparisonService.addComparisonItem(user.userId, productId);

    return NextResponse.json({ success: true, data: comparison });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Add comparison item error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
