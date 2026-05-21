import { redis } from './redis';

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }

    const fresh = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(fresh)).catch((err) => {
      console.error('Cache write failed:', err);
    });
    return fresh;
  } catch (error) {
    console.error('Cache error:', error);
    return fetcher();
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = typeof result[0] === 'string' ? parseInt(result[0], 10) : result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export async function deleteCacheKey(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export const CACHE_KEYS = {
  categories: 'categories:all',
  brands: 'brands:all',
  product: (id: string) => `product:${id}`,
  productList: (hash: string) => `products:list:${hash}`,
};

export const CACHE_TTL = {
  categories: 1800,
  brands: 1800,
  product: 900,
  productList: 300,
};
