import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAppError } from '@/lib/errors';
import { adminActionLogsQuerySchema } from '@/lib/validation/admin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const query = adminActionLogsQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      adminId: searchParams.get('adminId') || undefined,
      action: searchParams.get('action') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
    });

    const where = {
      ...(query.adminId ? { adminId: query.adminId } : {}),
      ...(query.action ? { action: { contains: query.action, mode: 'insensitive' as const } } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.dateFrom || query.dateTo ? {
        createdAt: {
          ...(query.dateFrom ? { gte: query.dateFrom } : {}),
          ...(query.dateTo ? { lte: query.dateTo } : {}),
        },
      } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where,
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.adminActionLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: logs.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          metadata: log.metadata as Record<string, unknown> | null,
          createdAt: log.createdAt.toISOString(),
          admin: log.admin,
        })),
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin action logs error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
