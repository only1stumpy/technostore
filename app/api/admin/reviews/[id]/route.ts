import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
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
    validateOrigin(request);

    const admin = await requireAdmin();
    const { id } = await parseParams(params, adminReviewParamsSchema);
    const body = await parseJson<unknown>(request);
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
    return errorResponse(error);
  }
}
