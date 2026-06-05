import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { NotFoundError, UnauthorizedError } from '@/lib/errors';
import { parseParams, errorResponse } from '@/lib/api/handlers';
import { orderService } from '@/lib/services/order.service';

const orderParamsSchema = z.object({
  id: z.string().trim().min(1, 'Order id is required'),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { id } = await parseParams(params, orderParamsSchema);
    const order = await orderService.getOrder(user.userId, id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
