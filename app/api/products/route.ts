import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProductFiltersSchema } from '@/lib/validation/catalog';
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { hashFilters } from '@/lib/pagination';
import type { ProductCard, CursorPaginatedResponse } from '@/types/api';
import { productRepository } from '@/lib/repositories/product.repository';
import { InvalidCursorError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = ProductFiltersSchema.parse({
      cursor: searchParams.get('cursor') || undefined,
      limit: searchParams.get('limit') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      brandId: searchParams.get('brandId') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    const cacheKey = CACHE_KEYS.productList(hashFilters(filters));

    const result = await getCached<CursorPaginatedResponse<ProductCard>>(
      cacheKey,
      async () => {
        const data = await productRepository.findMany(filters);
        if (!data) {
          throw new InvalidCursorError();
        }
        return data;
      },
      CACHE_TTL.productList
    );

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof InvalidCursorError) {
      return NextResponse.json(
        { error: 'Неверный курсор пагинации' },
        { status: 400 }
      );
    }

    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
