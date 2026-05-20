import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { cartService } from '@/lib/services/cart.service';
import { isAppError, UnauthorizedError, NotFoundError } from '@/lib/errors';

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id: productId } = params;
    const body = await request.json();
    const { quantity } = updateItemSchema.parse(body);

    const updatedCart = await cartService.updateItemQuantity(user.userId, productId, quantity);

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

    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id: productId } = params;

    const updatedCart = await cartService.removeItem(user.userId, productId);

    return NextResponse.json({ success: true, data: updatedCart });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
