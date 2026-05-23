import type { FavoritesResponse } from '@/types/api';
import { favoriteRepository } from '@/lib/repositories/favorite.repository';
import type { IFavoriteRepository } from '@/lib/repositories/interfaces';
import type { IFavoriteService } from './interfaces';

export class FavoriteService implements IFavoriteService {
  constructor(private favoriteRepo: IFavoriteRepository = favoriteRepository) {}

  async getFavorites(userId: string): Promise<FavoritesResponse> {
    return this.favoriteRepo.findManyByUserId(userId);
  }

  async addFavorite(userId: string, productId: string): Promise<FavoritesResponse> {
    return this.favoriteRepo.add(userId, productId);
  }

  async removeFavorite(userId: string, productId: string): Promise<FavoritesResponse> {
    return this.favoriteRepo.remove(userId, productId);
  }
}

export const favoriteService = new FavoriteService();

export function createFavoriteService(favoriteRepo: IFavoriteRepository = favoriteRepository): IFavoriteService {
  return new FavoriteService(favoriteRepo);
}
