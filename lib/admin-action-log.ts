import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type LogAdminActionInput = {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId = null,
  metadata = null,
}: LogAdminActionInput): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        metadata: metadata ? metadata as Prisma.InputJsonValue : undefined,
      },
    });
  } catch (error) {
    console.error('Admin action log error:', {
      adminId,
      action,
      entityType,
      entityId,
      error,
    });
  }
}
