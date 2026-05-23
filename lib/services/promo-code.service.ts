import type { AdminPromoCode, AppliedPromoCode } from '@/types/api';
import { promoCodeRepository } from '@/lib/repositories/promo-code.repository';
import type { AdminPromoCodeFilters, IPromoCodeRepository, PromoCodeInput } from '@/lib/repositories/interfaces';
import type { IPromoCodeService } from './interfaces';

export class PromoCodeService implements IPromoCodeService {
  constructor(private promoCodeRepo: IPromoCodeRepository = promoCodeRepository) {}

  async applyForUserCart(userId: string, code: string): Promise<AppliedPromoCode> {
    return this.promoCodeRepo.applyForUserCart(userId, code);
  }

  async calculate(code: string, subtotal: number): Promise<AppliedPromoCode & { promoCodeId: string }> {
    return this.promoCodeRepo.calculate(code, subtotal);
  }

  async getAdminPromoCodes(filters: AdminPromoCodeFilters) {
    return this.promoCodeRepo.findManyForAdmin(filters);
  }

  async createPromoCode(input: PromoCodeInput): Promise<AdminPromoCode> {
    return this.promoCodeRepo.create(input);
  }

  async updatePromoCode(id: string, input: PromoCodeInput): Promise<AdminPromoCode> {
    return this.promoCodeRepo.update(id, input);
  }

  async deactivatePromoCode(id: string): Promise<AdminPromoCode> {
    return this.promoCodeRepo.deactivate(id);
  }
}

export const promoCodeService = new PromoCodeService();

export function createPromoCodeService(promoCodeRepo: IPromoCodeRepository = promoCodeRepository): IPromoCodeService {
  return new PromoCodeService(promoCodeRepo);
}
