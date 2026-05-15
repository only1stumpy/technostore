import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { redis } from '@/lib/redis';
import { smsService } from '@/services/sms';

const sendCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = sendCodeSchema.parse(body);

    const normalizedPhone = normalizePhone(phone);

    if (!validatePhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Неверный формат телефона' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const { code } = smsService.generateVerificationCode();

    // Save code to Redis with 10 minute TTL
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis не настроен' },
        { status: 500 }
      );
    }
    await redis.set(`sms:${normalizedPhone}`, code, { ex: 600 });

    // Send SMS
    const result = await smsService.sendVerificationCode(normalizedPhone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Ошибка отправки SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Код отправлен',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
