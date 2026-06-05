import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { adminCategorySchema } from '@/lib/validation/admin';
import { logAdminAction } from '@/lib/admin-action-log';

function formatCategory(category: Prisma.CategoryGetPayload<{ include: { _count: { select: { products: true } } } }>) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    productCount: category._count.products,
  };
}

async function invalidateCategoryCache() {
  await deleteCacheKey(CACHE_KEYS.categories);
  await invalidateCache('products:list:*');
  await invalidateCache('products:filters:*');
}

export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: categories.map(formatCategory) });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const body = await parseJson<unknown>(request);
    const input = adminCategorySchema.parse(body);
    const category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        parentId: input.parentId || null,
      },
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    await invalidateCategoryCache();
    await logAdminAction({
      adminId: admin.userId,
      action: 'category.create',
      entityType: 'category',
      entityId: category.id,
      metadata: {
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      },
    });

    return NextResponse.json({ success: true, data: formatCategory(category) }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
