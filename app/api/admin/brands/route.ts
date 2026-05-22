import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { isAppError } from '@/lib/errors';
import { adminBrandSchema } from '@/lib/validation/admin';

function formatBrand(brand: Prisma.BrandGetPayload<{ include: { _count: { select: { products: true } } } }>) {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo,
    productCount: brand._count.products,
  };
}

async function invalidateBrandCache() {
  await deleteCacheKey(CACHE_KEYS.brands);
  await invalidateCache('products:list:*');
  await invalidateCache('products:filters:*');
}

export async function GET() {
  try {
    await requireAdmin();

    const brands = await prisma.brand.findMany({
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

    return NextResponse.json({ success: true, data: brands.map(formatBrand) });
  } catch (error: unknown) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin get brands error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const input = adminBrandSchema.parse(body);
    const brand = await prisma.brand.create({
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

    return NextResponse.json({ success: true, data: formatBrand(brand) }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Бренд с таким slug уже существует' }, { status: 400 });
    }

    if (isAppError(error)) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode });
    }

    console.error('Admin create brand error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
