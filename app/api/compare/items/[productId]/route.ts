import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import { comparisonService } from '@/lib/services/comparison.service';

const comparisonParamsSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { productId } = comparisonParamsSchema.parse(await params);
    const comparison = await comparisonService.removeComparisonItem(user.userId, productId);

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

    console.error('Remove comparison item error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
