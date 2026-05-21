import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotFoundError, isAppError } from '@/lib/errors';
import { adminOrderStatusSchema } from '@/lib/validation/admin';

function formatOrder(order: Prisma.OrderGetPayload<{
  include: {
    user: { select: { id: true; name: true; phone: true } };
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
    total: Number(order.total),
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

    const { id } = await params;
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
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get order error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const input = adminOrderStatusSchema.parse(body);
    const order = await prisma.order.update({
      where: { id },
      data: { status: input.status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
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

    return NextResponse.json({ success: true, data: formatOrder(order) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
