import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { isAppError, UnauthorizedError } from '@/lib/errors';
import { applyPromoCodeSchema } from '@/lib/validation/admin';
import { promoCodeService } from '@/lib/services/promo-code.service';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const { code } = applyPromoCodeSchema.parse(body);
    const promoCode = await promoCodeService.applyForUserCart(user.userId, code);

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Apply promo code error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
