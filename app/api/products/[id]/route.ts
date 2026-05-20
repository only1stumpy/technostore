import { NextRequest, NextResponse } from 'next/server';
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { ProductDetail } from '@/types/api';
import { productRepository } from '@/lib/repositories/product.repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getCached<ProductDetail | null>(
      CACHE_KEYS.product(id),
      async () => productRepository.findById(id),
      CACHE_TTL.product
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
