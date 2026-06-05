import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { adminBrandSchema } from '@/lib/validation/admin';
import { logAdminAction } from '@/lib/admin-action-log';

const adminBrandParamsSchema = z.object({
  id: z.string().trim().min(1, 'Brand id is required'),
});

async function invalidateBrandCache() {
  await deleteCacheKey(CACHE_KEYS.brands);
  await invalidateCache('products:list:*');
  await invalidateCache('products:filters:*');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const { id } = await parseParams(params, adminBrandParamsSchema);
    const body = await parseJson<unknown>(request);
    const input = adminBrandSchema.parse(body);
    const existingBrand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true, logo: true },
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
    await logAdminAction({
      adminId: admin.userId,
      action: 'brand.update',
      entityType: 'brand',
      entityId: brand.id,
      metadata: {
        from: {
          name: existingBrand.name,
          slug: existingBrand.slug,
          logo: existingBrand.logo,
        },
        to: {
          name: brand.name,
          slug: brand.slug,
          logo: brand.logo,
        },
      },
    });

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
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const { id } = await parseParams(params, adminBrandParamsSchema);
    const brand = await prisma.brand.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });

    if (!brand) {
      throw new NotFoundError('Brand not found');
    }

    const activeProductsCount = await prisma.product.count({
      where: { brandId: id, deletedAt: null },
    });

    if (activeProductsCount > 0) {
      throw new ValidationError('Сначала переместите или удалите товары этого бренда');
    }

    await prisma.brand.update({
      where: { id: brand.id },
      data: { deletedAt: new Date() },
    });
    await invalidateBrandCache();
    await logAdminAction({
      adminId: admin.userId,
      action: 'brand.delete',
      entityType: 'brand',
      entityId: brand.id,
      metadata: {
        name: brand.name,
        slug: brand.slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
