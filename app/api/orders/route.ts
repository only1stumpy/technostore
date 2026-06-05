import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { orderService } from '@/lib/services/order.service';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { applyPromoCodeSchema } from '@/lib/validation/admin';

const createOrderSchema = z.object({
  recipientName: z.string().trim().min(2, 'Укажите ФИО получателя').max(100, 'ФИО слишком длинное'),
  address: z.string().trim().min(5, 'Укажите адрес доставки'),
  phone: z.string().trim().min(5, 'Укажите телефон').transform(normalizePhone).refine(validatePhone, 'Укажите корректный телефон'),
  comment: z.string().trim().max(500, 'Комментарий слишком длинный').optional().nullable(),
  promoCode: applyPromoCodeSchema.shape.code.optional().nullable(),
  idempotencyKey: z.string().uuid().optional(),
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
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await parseJson<Record<string, unknown>>(request);
    const headerKey = request.headers.get('Idempotency-Key');

    const inputWithKey = {
      ...body,
      idempotencyKey: body.idempotencyKey || headerKey || undefined,
    };

    const input = createOrderSchema.parse(inputWithKey);
    const order = await orderService.createOrder(user.userId, input);

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
