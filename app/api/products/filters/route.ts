import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { ProductFilterMetadata } from '@/types/api';
import { brandRepository } from '@/lib/repositories/brand.repository';
import { productRepository } from '@/lib/repositories/product.repository';
import { categoryRepository } from '@/lib/repositories/category.repository';

const ProductFilterMetadataSchema = z.object({
  categoryId: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = ProductFilterMetadataSchema.parse({
      categoryId: searchParams.get('categoryId') || undefined,
    });

    const metadata = await getCached<ProductFilterMetadata>(
      CACHE_KEYS.productFilters(filters.categoryId),
      async () => {
        const categoryIds = filters.categoryId
          ? await categoryRepository.findSelfAndDescendantIds(filters.categoryId)
          : undefined;
        const [brands, priceRange, specs] = await Promise.all([
          brandRepository.findByCategoryIds(categoryIds),
          productRepository.getPriceRange(categoryIds),
          productRepository.getSpecFacets(categoryIds),
        ]);

        return { brands, priceRange, specs };
      },
      CACHE_TTL.productList
    );

    return NextResponse.json(metadata);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Get product filter metadata error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
