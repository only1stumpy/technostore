import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-action-log';
import { isAppError } from '@/lib/errors';
import { adminPromoCodeSchema } from '@/lib/validation/admin';
import { promoCodeService } from '@/lib/services/promo-code.service';

const adminPromoCodeParamsSchema = z.object({
  id: z.string().trim().min(1),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = adminPromoCodeParamsSchema.parse(await params);
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 });
    }

    const input = adminPromoCodeSchema.parse(body);
    const promoCode = await promoCodeService.updatePromoCode(id, input);

    await logAdminAction({
      adminId: admin.userId,
      action: 'promo-code.update',
      entityType: 'promo-code',
      entityId: id,
      metadata: {
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        isActive: promoCode.isActive,
      },
    });

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update promo code error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = adminPromoCodeParamsSchema.parse(await params);
    const promoCode = await promoCodeService.deactivatePromoCode(id);

    await logAdminAction({
      adminId: admin.userId,
      action: 'promo-code.deactivate',
      entityType: 'promo-code',
      entityId: id,
      metadata: {
        code: promoCode.code,
      },
    });

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin deactivate promo code error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
