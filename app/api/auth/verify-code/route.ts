import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { isAppError } from '@/lib/errors';

const verifyCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
  code: z.coerce.string().length(6, 'Код должен содержать 6 цифр'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, name } = verifyCodeSchema.parse(body);

    const result = await authService.verifyCodeAndLogin(phone, code, name);

    return NextResponse.json({
      success: true,
      user: result.user,
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

    console.error('Verify code error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
