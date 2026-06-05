import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteCacheKey, invalidateCache, CACHE_KEYS } from '@/lib/cache';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { parseJson, parseParams, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';
import { adminProductSchema } from '@/lib/validation/admin';
import { logAdminAction } from '@/lib/admin-action-log';

const adminProductParamsSchema = z.object({
  id: z.string().trim().min(1, 'Product id is required'),
});

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
  await invalidateCache('products:filters:*');
  await Promise.all([...new Set(keys)].map((key) => deleteCacheKey(CACHE_KEYS.product(key))));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await parseParams(params, adminProductParamsSchema);
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
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    validateOrigin(request);

    const admin = await requireAdmin();

    const { id } = await parseParams(params, adminProductParamsSchema);
    const body = await parseJson<unknown>(request);
    const input = adminProductSchema.parse(body);
    const existingProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });

    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    const [category, brand] = await Promise.all([
      prisma.category.findFirst({ where: { id: input.categoryId, deletedAt: null }, select: { id: true } }),
      prisma.brand.findFirst({ where: { id: input.brandId, deletedAt: null }, select: { id: true } }),
    ]);

    if (!category) {
      throw new ValidationError('Категория не найдена');
    }

    if (!brand) {
      throw new ValidationError('Бренд не найден');
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
    await logAdminAction({
      adminId: admin.userId,
      action: 'product.update',
      entityType: 'product',
      entityId: product.id,
      metadata: {
        from: {
          name: existingProduct.name,
          slug: existingProduct.slug,
        },
        to: {
          name: product.name,
          slug: product.slug,
        },
      },
    });

    return NextResponse.json({ success: true, data: formatProduct(product) });
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

    const { id } = await parseParams(params, adminProductParamsSchema);
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { deletedAt: new Date() },
    });
    await invalidateProductCache(product.id, product.slug);
    await logAdminAction({
      adminId: admin.userId,
      action: 'product.delete',
      entityType: 'product',
      entityId: product.id,
      metadata: {
        name: product.name,
        slug: product.slug,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
