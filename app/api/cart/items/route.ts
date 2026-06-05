import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { cartService } from '@/lib/services/cart.service';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await parseJson<unknown>(request);
    const { productId, quantity } = addItemSchema.parse(body);

    const updatedCart = await cartService.addItem(user.userId, productId, quantity);

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
