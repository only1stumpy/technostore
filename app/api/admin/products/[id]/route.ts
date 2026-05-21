import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { NotFoundError, isAppError } from '@/lib/errors';
import { adminProductSchema } from '@/lib/validation/admin';

function formatProduct(product: Prisma.ProductGetPayload<{ include: { category: true; brand: true } }>) {
  return {
    ...product,
    price: Number(product.price),
    specs: product.specs as Record<string, unknown> | null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

async function invalidateProductCache(...keys: string[]) {
  await invalidateCache('products:list:*');
  await Promise.all([...new Set(keys)].map((key) => deleteCacheKey(CACHE_KEYS.product(key))));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return NextResponse.json({ success: true, data: formatProduct(product) });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get product error:', error);
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
    const input = adminProductSchema.parse(body);
    const existingProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        price: input.price,
        stock: input.stock,
        images: input.images,
        specs: input.specs ? input.specs as Prisma.InputJsonValue : Prisma.JsonNull,
        categoryId: input.categoryId,
        brandId: input.brandId,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    await invalidateProductCache(existingProduct.id, existingProduct.slug, product.slug);

    return NextResponse.json({ success: true, data: formatProduct(product) });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 });
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
      }
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin update product error:', error);
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
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, slug: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date() },
    });
    await invalidateProductCache(product.id, product.slug);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin delete product error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
