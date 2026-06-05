import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { orderService } from '@/lib/services/order.service';

const orderParamsSchema = z.object({
  id: z.string().trim().min(1, 'Order id is required'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = await parseParams(params, orderParamsSchema);
    const order = await orderService.cancelOrder(user.userId, id);

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
