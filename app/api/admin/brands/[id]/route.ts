import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { NotFoundError, isAppError } from '@/lib/errors';
import { adminBrandSchema } from '@/lib/validation/admin';

async function invalidateBrandCache() {
  await deleteCacheKey(CACHE_KEYS.brands);
  await invalidateCache('products:list:*');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const input = adminBrandSchema.parse(body);
    const existingBrand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existingBrand) {
      throw new NotFoundError('Brand not found');
    }

    const brand = await prisma.brand.update({
      where: { id: existingBrand.id },
      data: {
        name: input.name,
        slug: input.slug,
        logo: input.logo || null,
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

    await invalidateBrandCache();

    return NextResponse.json({
      success: true,
      data: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
        productCount: brand._count.products,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Бренд с таким slug уже существует' }, { status: 400 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Бренд не найден' }, { status: 404 });
      }
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update brand error:', error);
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
    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    const activeProductsCount = await prisma.product.count({
      where: { brandId: id, deletedAt: null },
    });

    if (activeProductsCount > 0) {
      return NextResponse.json(
        { error: 'Сначала переместите или удалите товары этого бренда' },
        { status: 400 }
      );
    }

    await prisma.brand.update({
      where: { id: brand.id },
      data: { deletedAt: new Date() },
    });
    await invalidateBrandCache();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Бренд не найден' }, { status: 404 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin delete brand error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
