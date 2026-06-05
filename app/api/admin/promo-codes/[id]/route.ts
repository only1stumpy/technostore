import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-action-log';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
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
    validateOrigin(request);

    const admin = await requireAdmin();
    const { id } = await parseParams(params, adminPromoCodeParamsSchema);
    const body = await parseJson<unknown>(request);
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
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();
    const { id } = await parseParams(params, adminPromoCodeParamsSchema);
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
    return errorResponse(error);
  }
}
