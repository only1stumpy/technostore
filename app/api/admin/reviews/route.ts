import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { isAppError } from '@/lib/errors';
import { adminReviewQuerySchema } from '@/lib/validation/admin';
import { reviewService } from '@/lib/services/review.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const filters = adminReviewQuerySchema.parse({
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
      status: request.nextUrl.searchParams.get('status') || undefined,
      productId: request.nextUrl.searchParams.get('productId') || undefined,
      rating: request.nextUrl.searchParams.get('rating') || undefined,
    });
    const reviews = await reviewService.getAdminReviews(filters);

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get reviews error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
