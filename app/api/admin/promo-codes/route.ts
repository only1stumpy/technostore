import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-action-log';
import { parseJson, parseQuery, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { adminPaginationSchema, adminPromoCodeSchema } from '@/lib/validation/admin';
import { promoCodeService } from '@/lib/services/promo-code.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const filters = parseQuery(request.nextUrl.searchParams, adminPaginationSchema);
    const promoCodes = await promoCodeService.getAdminPromoCodes(filters);

    return NextResponse.json({ success: true, data: promoCodes });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();
    const body = await parseJson<unknown>(request);
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
    return errorResponse(error);
  }
}
