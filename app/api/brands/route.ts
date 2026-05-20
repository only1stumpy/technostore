import { NextResponse } from 'next/server';
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { Brand } from '@/types/api';
import { brandRepository } from '@/lib/repositories/brand.repository';

export async function GET() {
  try {
    const brands = await getCached<Brand[]>(
      CACHE_KEYS.brands,
      async () => brandRepository.findAll(),
      CACHE_TTL.brands
    );

    return NextResponse.json(brands);
  } catch (error: unknown) {
    console.error('Get brands error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
