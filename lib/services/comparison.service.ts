import type { ComparisonResponse } from '@/types/api';
import { comparisonRepository } from '@/lib/repositories/comparison.repository';
import type { IComparisonRepository } from '@/lib/repositories/interfaces';
import type { IComparisonService } from './interfaces';

export class ComparisonService implements IComparisonService {
  constructor(private comparisonRepo: IComparisonRepository = comparisonRepository) {}

  async getComparison(userId: string): Promise<ComparisonResponse> {
    return this.comparisonRepo.findManyByUserId(userId);
  }

  async addComparisonItem(userId: string, productId: string): Promise<ComparisonResponse> {
    return this.comparisonRepo.add(userId, productId);
  }

  async removeComparisonItem(userId: string, productId: string): Promise<ComparisonResponse> {
    return this.comparisonRepo.remove(userId, productId);
  }

  async clearComparison(userId: string): Promise<void> {
    await this.comparisonRepo.clear(userId);
  }
}

export const comparisonService = new ComparisonService();

export function createComparisonService(comparisonRepo: IComparisonRepository = comparisonRepository): IComparisonService {
  return new ComparisonService(comparisonRepo);
}
