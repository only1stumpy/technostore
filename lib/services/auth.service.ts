import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { createHash, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { createToken, setAuthCookie } from '@/lib/auth';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { SMS_CODE_TTL, USER_ROLE } from '@/lib/constants';
import { RateLimiter, rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter';
import { SmsService, smsService } from '@/services/sms';
import { InvalidCodeError, ValidationError, ConfigurationError } from '@/lib/errors';
import type { IAuthService } from './interfaces';

export class AuthService implements IAuthService {
  constructor(
    private prismaClient: PrismaClient = prisma,
    private redisClient: Redis | null = redis,
    private limiter: RateLimiter = rateLimiter,
    private sms: SmsService = smsService
  ) {}

  async sendVerificationCode(phone: string): Promise<{ code?: string }> {
    const normalizedPhone = normalizePhone(phone);

    if (!validatePhone(normalizedPhone)) {
      throw new ValidationError('Invalid phone format');
    }

    if (!this.redisClient) {
      throw new ConfigurationError('Redis not configured');
    }

    await this.limiter.checkLimit(
      `rate:send-code:${normalizedPhone}`,
      RATE_LIMITS.SMS_SEND
    );

    const { code } = this.sms.generateVerificationCode();

    const result = await this.sms.sendVerificationCode(normalizedPhone, code);

    if (!result.success) {
      throw new ConfigurationError('Failed to send SMS');
    }

    const codeHash = createHash('sha256').update(code).digest('hex');
    await this.redisClient.set(`sms:${normalizedPhone}`, codeHash, { ex: SMS_CODE_TTL });

    return (process.env.SMS_PROVIDER || 'mock') === 'mock' ? { code } : {};
  }

  async verifyCodeAndLogin(phone: string, code: string, name?: string): Promise<{
    user: {
      id: string;
      phone: string;
      name: string | null;
      role: string;
    };
  }> {
    const normalizedPhone = normalizePhone(phone);

    if (!validatePhone(normalizedPhone)) {
      throw new ValidationError('Invalid phone format');
    }

    if (!this.redisClient) {
      throw new ConfigurationError('Redis not configured');
    }

    await this.limiter.checkLimit(
      `rate:verify:${normalizedPhone}`,
      RATE_LIMITS.SMS_VERIFY
    );

    const savedCodeHash = await this.redisClient.get<string>(`sms:${normalizedPhone}`);

    if (!savedCodeHash) {
      throw new InvalidCodeError('Code expired or not found');
    }

    const savedHash = Buffer.from(savedCodeHash, 'hex');
    const codeHash = createHash('sha256').update(String(code)).digest();
    if (savedHash.length !== codeHash.length || !timingSafeEqual(savedHash, codeHash)) {
      throw new InvalidCodeError('Invalid code');
    }

    await this.redisClient.del(`sms:${normalizedPhone}`);

    let user = await this.prismaClient.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = await this.prismaClient.user.create({
        data: {
          phone: normalizedPhone,
          name: name || null,
          role: USER_ROLE.USER,
        },
      });
    } else if (name && !user.name) {
      user = await this.prismaClient.user.update({
        where: { phone: normalizedPhone },
        data: { name },
      });
    }

    const token = await createToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    await setAuthCookie(token);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();

export function createAuthService(
  prismaClient: PrismaClient = prisma,
  redisClient: Redis | null = redis,
  limiter: RateLimiter = rateLimiter,
  sms: SmsService = smsService
): IAuthService {
  return new AuthService(prismaClient, redisClient, limiter, sms);
}
