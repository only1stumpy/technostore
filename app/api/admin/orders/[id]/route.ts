import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { orderService } from '@/lib/services/order.service';
import { adminOrderStatusSchema } from '@/lib/validation/admin';
import { logAdminAction } from '@/lib/admin-action-log';

const adminOrderParamsSchema = z.object({
  id: z.string().trim().min(1, 'Order id is required'),
});

function formatOrder(order: Prisma.OrderGetPayload<{
  include: {
    user: { select: { id: true; name: true; phone: true } };
    promoCode: true;
    items: { include: { product: { select: { id: true; name: true; images: true } } } };
  };
}>) {
  const items = order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    imageUrl: item.product.images[0] || null,
    price: Number(item.price),
    quantity: item.quantity,
  }));

  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    promoCode: order.promoCode?.code ?? null,
    recipientName: order.recipientName,
    address: order.address,
    phone: order.phone,
    comment: order.comment,
    user: order.user,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    itemsPreview: items.slice(0, 3).map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await parseParams(params, adminOrderParamsSchema);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        promoCode: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return NextResponse.json({ success: true, data: formatOrder(order) });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const { id } = await parseParams(params, adminOrderParamsSchema);
    const body = await parseJson<unknown>(request);
    const input = adminOrderStatusSchema.parse(body);
    const { order, previousStatus } = await orderService.updateOrderStatus(id, input.status);
    const orderOwner = await prisma.order.findUnique({
      where: { id },
      select: {
        user: { select: { id: true, name: true, phone: true } },
      },
    });
    const user = orderOwner?.user;

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await logAdminAction({
      adminId: admin.userId,
      action: 'order.status.update',
      entityType: 'order',
      entityId: id,
      metadata: {
        from: previousStatus,
        to: input.status,
      },
    });

    return NextResponse.json({ success: true, data: { ...order, user } });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
