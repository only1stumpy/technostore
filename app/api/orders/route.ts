import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import { orderService } from '@/lib/services/order.service';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { applyPromoCodeSchema } from '@/lib/validation/admin';

const createOrderSchema = z.object({
  recipientName: z.string().trim().min(2, 'Укажите ФИО получателя').max(100, 'ФИО слишком длинное'),
  address: z.string().trim().min(5, 'Укажите адрес доставки'),
  phone: z.string().trim().min(5, 'Укажите телефон').transform(normalizePhone).refine(validatePhone, 'Укажите корректный телефон'),
  comment: z.string().trim().max(500, 'Комментарий слишком длинный').optional().nullable(),
  promoCode: applyPromoCodeSchema.shape.code.optional().nullable(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const orders = await orderService.getOrders(user.userId);

    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const order = await orderService.createOrder(user.userId, input);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
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

    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
