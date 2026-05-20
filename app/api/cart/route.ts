import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { cartService } from '@/lib/services/cart.service';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import type { Cart } from '@/types/api';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const cart = await cartService.getCart(user.userId);

    if (!cart) {
      const emptyCart: Cart = {
        id: '',
        userId: user.userId,
        items: [],
        totalAmount: 0,
      };
      return NextResponse.json({ success: true, data: emptyCart });
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    await cartService.clearCart(user.userId);

    return NextResponse.json({ success: true, message: 'Корзина очищена' });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
