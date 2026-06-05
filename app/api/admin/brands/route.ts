import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { adminBrandSchema } from '@/lib/validation/admin';
import { logAdminAction } from '@/lib/admin-action-log';

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
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const body = await parseJson<unknown>(request);
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
    await logAdminAction({
      adminId: admin.userId,
      action: 'brand.create',
      entityType: 'brand',
      entityId: brand.id,
      metadata: {
        name: brand.name,
        slug: brand.slug,
      },
    });

    return NextResponse.json({ success: true, data: formatBrand(brand) }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
