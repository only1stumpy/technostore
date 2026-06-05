import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { getClientIp } from '@/lib/api/security';

const sendCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson<unknown>(request);
    const { phone } = sendCodeSchema.parse(body);
    const ip = getClientIp(request);

    const result = await authService.sendVerificationCode(phone, ip);

    return NextResponse.json({
      success: true,
      message: 'Код отправлен',
      ...result,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
