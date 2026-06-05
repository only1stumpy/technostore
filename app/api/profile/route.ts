import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError } from '@/lib/errors';
import { parseJson, errorResponse } from '@/lib/api/handlers';
import { validateOrigin } from '@/lib/api/security';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(100, 'Имя слишком длинное').nullable(),
  address: z.string().trim().min(5, 'Укажите адрес доставки').max(500, 'Адрес слишком длинный').nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    validateOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const body = await parseJson<unknown>(request);
    const input = updateProfileSchema.parse(body);
    const profile = await prisma.user.update({
      where: { id: user.userId },
      data: {
        name: input.name || null,
        address: input.address || null,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        address: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
