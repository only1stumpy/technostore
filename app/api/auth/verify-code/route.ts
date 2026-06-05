import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { smsCodeSchema } from '@/lib/validation/auth';

const verifyCodeSchema = z.object({
  phone: z.string().min(1, 'Телефон обязателен'),
  code: smsCodeSchema.shape.code,
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson<unknown>(request);
    const { phone, code, name } = verifyCodeSchema.parse(body);

    const result = await authService.verifyCodeAndLogin(phone, code, name);

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
