import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { comparisonService } from '@/lib/services/comparison.service';

const addComparisonSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await parseJson<unknown>(request);
    const { productId } = addComparisonSchema.parse(body);
    const comparison = await comparisonService.addComparisonItem(user.userId, productId);

    return NextResponse.json({ success: true, data: comparison });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
