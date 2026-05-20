import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { createToken, setAuthCookie } from '@/lib/auth';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { USER_ROLE } from '@/lib/constants';
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

  async sendVerificationCode(phone: string): Promise<void> {
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

    await this.redisClient.set(`sms:${normalizedPhone}`, code, { ex: 600 });

    const result = await this.sms.sendVerificationCode(normalizedPhone, code);

    if (!result.success) {
      throw new ConfigurationError('Failed to send SMS');
    }
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

    const savedCode = await this.redisClient.get<string>(`sms:${normalizedPhone}`);

    if (!savedCode) {
      throw new InvalidCodeError('Code expired or not found');
    }

    const savedBuffer = Buffer.from(String(savedCode));
    const codeBuffer = Buffer.from(String(code));
    if (savedBuffer.length !== codeBuffer.length || !timingSafeEqual(savedBuffer, codeBuffer)) {
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
