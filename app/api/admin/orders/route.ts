import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppError } from '@/lib/errors';
import { adminOrdersQuerySchema } from '@/lib/validation/admin';

function formatOrder(order: Awaited<ReturnType<typeof prisma.order.findMany>>[number] & {
  user: { id: string; name: string | null; phone: string };
  items: Array<{ quantity: number; product: { name: string } }>;
}) {
  return {
    id: order.id,
    status: order.status,
    total: Number(order.total),
    recipientName: order.recipientName,
    address: order.address,
    phone: order.phone,
    comment: order.comment,
    user: order.user,
    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    itemsPreview: order.items.slice(0, 3).map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const pagination = adminOrdersQuerySchema.parse({
      page: request.nextUrl.searchParams.get('page') || undefined,
      limit: request.nextUrl.searchParams.get('limit') || undefined,
      status: request.nextUrl.searchParams.get('status') || undefined,
      dateFrom: request.nextUrl.searchParams.get('dateFrom') || undefined,
      dateTo: request.nextUrl.searchParams.get('dateTo') || undefined,
    });
    const where: Prisma.OrderWhereInput = {};

    if (pagination.status) {
      where.status = pagination.status;
    }

    if (pagination.dateFrom || pagination.dateTo) {
      where.createdAt = {};
      if (pagination.dateFrom) {
        where.createdAt.gte = pagination.dateFrom;
      }
      if (pagination.dateTo) {
        const endOfDay = new Date(pagination.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: orders.map(formatOrder),
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get orders error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
