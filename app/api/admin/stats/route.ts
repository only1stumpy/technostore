import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppError } from '@/lib/errors';

export async function GET() {
  try {
    await requireAdmin();

    const [productsCount, ordersCount, usersCount, revenue, recentOrders] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { total: true } }),
      prisma.order.findMany({
        take: 5,
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
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        productsCount,
        ordersCount,
        usersCount,
        revenue: Number(revenue._sum.total || 0),
        recentOrders: recentOrders.map((order) => ({
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
        })),
      },
    });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get stats error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
