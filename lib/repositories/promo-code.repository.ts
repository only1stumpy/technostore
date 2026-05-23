import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import type { AdminPromoCode, AppliedPromoCode } from '@/types/api';
import type { AdminPromoCodeFilters, IPromoCodeRepository, PromoCodeInput } from './interfaces';

type PromoCodeEntity = Prisma.PromoCodeGetPayload<object>;

function formatAdminPromoCode(promoCode: PromoCodeEntity): AdminPromoCode {
  return {
    id: promoCode.id,
    code: promoCode.code,
    type: promoCode.type,
    value: Number(promoCode.value),
    minOrderTotal: Number(promoCode.minOrderTotal),
    usageLimit: promoCode.usageLimit,
    usedCount: promoCode.usedCount,
    startsAt: promoCode.startsAt?.toISOString() ?? null,
    expiresAt: promoCode.expiresAt?.toISOString() ?? null,
    isActive: promoCode.isActive,
    createdAt: promoCode.createdAt.toISOString(),
    updatedAt: promoCode.updatedAt.toISOString(),
  };
}

export class PromoCodeRepository implements IPromoCodeRepository {
  constructor(private prismaClient: PrismaClient = prisma) {}

  async applyForUserCart(userId: string, code: string): Promise<AppliedPromoCode> {
    const cart = await this.prismaClient.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Корзина пуста', 400, 'EMPTY_CART');
    }

    for (const item of cart.items) {
      if (item.product.deletedAt || item.product.stock < item.quantity) {
        throw new AppError(`Недостаточно товара "${item.product.name}" на складе`, 400, 'INSUFFICIENT_STOCK');
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const applied = await this.calculate(code, subtotal);

    return {
      code: applied.code,
      type: applied.type,
      value: applied.value,
      discountAmount: applied.discountAmount,
      subtotal: applied.subtotal,
      total: applied.total,
    };
  }

  async calculate(code: string, subtotal: number): Promise<AppliedPromoCode & { promoCodeId: string }> {
    const promoCode = await this.prismaClient.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      throw new ValidationError('Промокод не найден');
    }

    this.validatePromoCode(promoCode, subtotal);

    const value = Number(promoCode.value);
    const discountAmount = promoCode.type === 'PERCENT'
      ? Math.min(subtotal, Math.round((subtotal * value / 100) * 100) / 100)
      : Math.min(subtotal, value);
    const total = Math.max(0, subtotal - discountAmount);

    return {
      promoCodeId: promoCode.id,
      code: promoCode.code,
      type: promoCode.type,
      value,
      discountAmount,
      subtotal,
      total,
    };
  }

  async findManyForAdmin(filters: AdminPromoCodeFilters) {
    const [promoCodes, total] = await Promise.all([
      this.prismaClient.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prismaClient.promoCode.count(),
    ]);

    return {
      items: promoCodes.map(formatAdminPromoCode),
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async create(input: PromoCodeInput): Promise<AdminPromoCode> {
    try {
      const promoCode = await this.prismaClient.promoCode.create({
        data: this.toPrismaInput(input),
      });

      return formatAdminPromoCode(promoCode);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ValidationError('Промокод с таким кодом уже существует');
      }

      throw error;
    }
  }

  async update(id: string, input: PromoCodeInput): Promise<AdminPromoCode> {
    try {
      const promoCode = await this.prismaClient.promoCode.update({
        where: { id },
        data: this.toPrismaInput(input),
      });

      return formatAdminPromoCode(promoCode);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Промокод не найден');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ValidationError('Промокод с таким кодом уже существует');
      }

      throw error;
    }
  }

  async deactivate(id: string): Promise<AdminPromoCode> {
    try {
      const promoCode = await this.prismaClient.promoCode.update({
        where: { id },
        data: { isActive: false },
      });

      return formatAdminPromoCode(promoCode);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundError('Промокод не найден');
      }

      throw error;
    }
  }

  private validatePromoCode(promoCode: PromoCodeEntity, subtotal: number) {
    const now = new Date();
    const minOrderTotal = Number(promoCode.minOrderTotal);

    if (!promoCode.isActive) {
      throw new ValidationError('Промокод неактивен');
    }

    if (promoCode.startsAt && promoCode.startsAt > now) {
      throw new ValidationError('Промокод еще не действует');
    }

    if (promoCode.expiresAt && promoCode.expiresAt < now) {
      throw new ValidationError('Промокод истёк');
    }

    if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
      throw new ValidationError('Лимит использования промокода исчерпан');
    }

    if (subtotal < minOrderTotal) {
      throw new ValidationError(`Минимальная сумма для промокода — ${minOrderTotal}`);
    }
  }

  private toPrismaInput(input: PromoCodeInput) {
    return {
      code: input.code,
      type: input.type,
      value: input.value,
      minOrderTotal: input.minOrderTotal,
      usageLimit: input.usageLimit ?? null,
      startsAt: input.startsAt ?? null,
      expiresAt: input.expiresAt ?? null,
      isActive: input.isActive,
    };
  }
}

export const promoCodeRepository = new PromoCodeRepository();

export function createPromoCodeRepository(prismaClient: PrismaClient = prisma): IPromoCodeRepository {
  return new PromoCodeRepository(prismaClient);
}
