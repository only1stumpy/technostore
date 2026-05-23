import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { isAppError } from '@/lib/errors';
import { logAdminAction } from '@/lib/admin-action-log';
import { adminReviewStatusSchema } from '@/lib/validation/admin';
import { reviewService } from '@/lib/services/review.service';

const adminReviewParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = adminReviewParamsSchema.parse(await params);
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const input = adminReviewStatusSchema.parse(body);
    const review = await reviewService.updateReviewStatus(id, input.status);

    await logAdminAction({
      adminId: admin.userId,
      action: 'review.status.update',
      entityType: 'review',
      entityId: id,
      metadata: {
        status: input.status,
        productId: review.product.id,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update review error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
