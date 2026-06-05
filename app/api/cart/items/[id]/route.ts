import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { cartService } from '@/lib/services/cart.service';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';

const cartItemParamsSchema = z.object({
  id: z.string().trim().min(1, 'Product id is required'),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id: productId } = await parseParams(params, cartItemParamsSchema);
    const body = await parseJson<unknown>(request);
    const { quantity } = updateItemSchema.parse(body);

    const updatedCart = await cartService.updateItemQuantity(user.userId, productId, quantity);

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id: productId } = await parseParams(params, cartItemParamsSchema);

    const updatedCart = await cartService.removeItem(user.userId, productId);

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
