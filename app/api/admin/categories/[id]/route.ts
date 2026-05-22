import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { NotFoundError, isAppError } from '@/lib/errors';
import { adminCategorySchema } from '@/lib/validation/admin';

async function invalidateCategoryCache() {
  await deleteCacheKey(CACHE_KEYS.categories);
  await invalidateCache('products:list:*');
  await invalidateCache('products:filters:*');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const input = adminCategorySchema.parse(body);

    if (input.parentId === id) {
      return NextResponse.json({ error: 'Категория не может быть родителем самой себя' }, { status: 400 });
    }

    const existingCategory = await prisma.category.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    const category = await prisma.category.update({
      where: { id: existingCategory.id },
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

    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
        productCount: category._count.products,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Категория с таким slug уже существует' }, { status: 400 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
      }
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update category error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const category = await prisma.category.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const activeProductsCount = await prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (activeProductsCount > 0) {
      return NextResponse.json(
        { error: 'Сначала переместите или удалите товары этой категории' },
        { status: 400 }
      );
    }

    await prisma.category.update({
      where: { id: category.id },
      data: { deletedAt: new Date() },
    });
    await invalidateCategoryCache();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Категория не найдена' }, { status: 404 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin delete category error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
