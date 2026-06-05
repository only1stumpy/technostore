import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { comparisonService } from '@/lib/services/comparison.service';

const comparisonParamsSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { productId } = await parseParams(params, comparisonParamsSchema);
    const comparison = await comparisonService.removeComparisonItem(user.userId, productId);

    return NextResponse.json({ success: true, data: comparison });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
