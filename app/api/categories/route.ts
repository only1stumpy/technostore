import { NextResponse } from 'next/server';
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { CategoryTree } from '@/types/api';
import { categoryRepository } from '@/lib/repositories/category.repository';

export async function GET() {
  try {
    const categories = await getCached<CategoryTree[]>(
      CACHE_KEYS.categories,
      async () => categoryRepository.findAllAsTree(),
      CACHE_TTL.categories
    );

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
