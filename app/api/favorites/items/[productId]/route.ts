import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { favoriteService } from '@/lib/services/favorite.service';

const favoriteParamsSchema = z.object({
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

    const { productId } = await parseParams(params, favoriteParamsSchema);
    const favorites = await favoriteService.removeFavorite(user.userId, productId);

    return NextResponse.json({ success: true, data: favorites });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
