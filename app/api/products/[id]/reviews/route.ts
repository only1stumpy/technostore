import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
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
    const { id } = await parseParams(params, productReviewParamsSchema);
    const reviews = await reviewService.getProductReviews(id);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = await parseParams(params, productReviewParamsSchema);
    const body = await parseJson<unknown>(request);

    const input = createReviewSchema.parse({ ...body as object, productId: id });
    const review = await reviewService.createReview(user.userId, input.productId, input.rating, input.text);

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
