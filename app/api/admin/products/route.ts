import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { adminPaginationSchema, adminProductSchema } from '@/lib/validation/admin';
import { isAppError } from '@/lib/errors';

function formatProduct(product: Prisma.ProductGetPayload<{ include: { category: true; brand: true } }>) {
  return {
    ...product,
    price: Number(product.price),
    specs: product.specs as Record<string, unknown> | null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

async function invalidateProductCache(id?: string) {
  await invalidateCache('products:list:*');
  await invalidateCache('products:filters:*');
  if (id) {
    await deleteCacheKey(CACHE_KEYS.product(id));
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const pagination = adminPaginationSchema.parse({
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    });
    const where = {
      deletedAt: null,
      category: { deletedAt: null },
      brand: { deletedAt: null },
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: products.map(formatProduct),
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

    console.error('Admin get products error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const input = adminProductSchema.parse(body);
    const product = await prisma.product.create({
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

    await invalidateProductCache(product.id);

    return NextResponse.json({ success: true, data: formatProduct(product) }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin create product error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
