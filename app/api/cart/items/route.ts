import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { cartService } from '@/lib/services/cart.service';
import { isAppError, UnauthorizedError } from '@/lib/errors';

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await request.json();
    const { productId, quantity } = addItemSchema.parse(body);

    const updatedCart = await cartService.addItem(user.userId, productId, quantity);

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Add item to cart error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
