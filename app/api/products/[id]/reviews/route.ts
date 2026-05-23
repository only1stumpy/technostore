import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import { createReviewSchema } from '@/lib/validation/admin';
import { reviewService } from '@/lib/services/review.service';

const productReviewParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = productReviewParamsSchema.parse(await params);
    const reviews = await reviewService.getProductReviews(id);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Get product reviews error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = productReviewParamsSchema.parse(await params);
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const input = createReviewSchema.parse({ ...body as object, productId: id });
    const review = await reviewService.createReview(user.userId, input.productId, input.rating, input.text);

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Create product review error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
