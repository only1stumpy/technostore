import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizePhone, validatePhone } from '@/lib/utils';
import { redis } from '@/lib/redis';
import { createToken, setAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { USER_ROLE } from '@/lib/constants';

const verifyCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
  code: z.string().length(6, 'Код должен содержать 6 цифр'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, name } = verifyCodeSchema.parse(body);

    const normalizedPhone = normalizePhone(phone);

    if (!validatePhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Неверный формат телефона' },
        { status: 400 }
      );
    }

    // Get code from Redis
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis не настроен' },
        { status: 500 }
      );
    }
    const savedCode = await redis.get<string>(`sms:${normalizedPhone}`);

    if (!savedCode) {
      return NextResponse.json(
        { error: 'Код истек или не найден' },
        { status: 400 }
      );
    }

    if (savedCode !== code) {
      return NextResponse.json(
        { error: 'Неверный код' },
        { status: 400 }
      );
    }

    // Delete code from Redis
    await redis.del(`sms:${normalizedPhone}`);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: name || null,
          role: USER_ROLE.USER,
        },
      });
    } else if (name && !user.name) {
      // Update name if provided and not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // Set HTTP-only cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
