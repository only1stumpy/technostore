import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-action-log';
import { isAppError } from '@/lib/errors';
import { adminPaginationSchema, adminPromoCodeSchema } from '@/lib/validation/admin';
import { promoCodeService } from '@/lib/services/promo-code.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const filters = adminPaginationSchema.parse({
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
    });
    const promoCodes = await promoCodeService.getAdminPromoCodes(filters);

    return NextResponse.json({ success: true, data: promoCodes });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get promo codes error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const input = adminPromoCodeSchema.parse(body);
    const promoCode = await promoCodeService.createPromoCode(input);

    await logAdminAction({
      adminId: admin.userId,
      action: 'promo-code.create',
      entityType: 'promo-code',
      entityId: promoCode.id,
      metadata: {
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
      },
    });

    return NextResponse.json({ success: true, data: promoCode }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin create promo code error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
