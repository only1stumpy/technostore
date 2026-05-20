import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

if (!REDIS_URL || !REDIS_TOKEN) {
  console.warn('⚠️  Redis credentials not configured. Caching will be disabled.');
}

export const redis = REDIS_URL && REDIS_TOKEN
  ? new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN,
    })
  : null;

