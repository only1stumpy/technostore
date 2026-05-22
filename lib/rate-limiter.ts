import { redis } from './redis';
import { RateLimitError } from './errors';
import type { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  maxAttempts: number;
  windowSeconds: number;
}

export const RATE_LIMITS = {
  SMS_SEND: { maxAttempts: 3, windowSeconds: 3600 },
  SMS_VERIFY: { maxAttempts: 5, windowSeconds: 600 },
} as const;

export class RateLimiter {
  constructor(private redisClient: Redis | null = redis) {}

  async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    const [attempts] = await this.redisClient
      .multi()
      .incr(key)
      .expire(key, config.windowSeconds, 'NX')
      .exec<[number, 0 | 1]>();

    if (attempts > config.maxAttempts) {
      const timeRemaining = await this.redisClient.ttl(key);
      throw new RateLimitError(
        `Too many attempts. Try again in ${Math.ceil(timeRemaining / 60)} minutes`
      );
    }
  }

  async getRemainingAttempts(
    key: string,
    config: RateLimitConfig
  ): Promise<number> {
    if (!this.redisClient) {
      return config.maxAttempts;
    }

    const attempts = await this.redisClient.get<number>(key);
    if (!attempts) {
      return config.maxAttempts;
    }

    return Math.max(0, config.maxAttempts - attempts);
  }

  async reset(key: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    await this.redisClient.del(key);
  }
}

export const rateLimiter = new RateLimiter();

export function createRateLimiter(redisClient: Redis | null = redis): RateLimiter {
  return new RateLimiter(redisClient);
}
