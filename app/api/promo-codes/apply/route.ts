import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { applyPromoCodeSchema } from '@/lib/validation/admin';
import { promoCodeService } from '@/lib/services/promo-code.service';

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await parseJson<unknown>(request);
    const { code } = applyPromoCodeSchema.parse(body);
    const promoCode = await promoCodeService.applyForUserCart(user.userId, code);

    return NextResponse.json({ success: true, data: promoCode });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
