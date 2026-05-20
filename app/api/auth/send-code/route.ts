import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { isAppError } from '@/lib/errors';

const sendCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = sendCodeSchema.parse(body);

    await authService.sendVerificationCode(phone);

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

    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Send code error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
