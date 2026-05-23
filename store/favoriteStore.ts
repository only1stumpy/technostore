'use client';

import { create } from 'zustand';
import type { FavoriteItem, FavoritesResponse, ProductCard } from '@/types/api';

type FavoriteRequestError = Error & {
  code?: string;
};

type FavoriteState = FavoritesResponse & {
  isLoading: boolean;
  hasFetched: boolean;
  pendingProductIds: string[];
  error: string | null;
  errorCode: string | null;
  fetchFavorites: (options?: { silentAuth?: boolean }) => Promise<void>;
  setFavorites: (favorites: FavoritesResponse) => void;
  addItem: (product: ProductCard) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  resetFavorites: () => void;
};

const initialFavorites: FavoritesResponse = {
  items: [],
  count: 0,
};

async function parseFavoritesResponse(response: Response): Promise<FavoritesResponse> {
  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.error || 'Ошибка избранного') as FavoriteRequestError;
    error.code = json.code;
    throw error;
  }

  return json.data ?? initialFavorites;
}

function getFavoriteError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as FavoriteRequestError).code ?? null,
    };
  }

  return {
    message: fallback,
    code: null,
  };
}

function applyFavorites(favorites: FavoritesResponse) {
  return {
    items: favorites.items,
    count: favorites.count,
    isLoading: false,
    hasFetched: true,
    error: null,
    errorCode: null,
  };
}

function toFavoriteItem(product: ProductCard): FavoriteItem {
  return {
    ...product,
    isFavorite: true,
    addedAt: new Date().toISOString(),
  };
}

function addPendingProductId(pendingProductIds: string[], productId: string) {
  return pendingProductIds.includes(productId) ? pendingProductIds : [...pendingProductIds, productId];
}

function removePendingProductId(pendingProductIds: string[], productId: string) {
  return pendingProductIds.filter((id) => id !== productId);
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  ...initialFavorites,
  isLoading: false,
  hasFetched: false,
  pendingProductIds: [],
  error: null,
  errorCode: null,

  setFavorites: (favorites) => set(applyFavorites(favorites)),
  resetFavorites: () => set({ ...initialFavorites, isLoading: false, hasFetched: false, pendingProductIds: [], error: null, errorCode: null }),

  fetchFavorites: async (options) => {
    if (get().hasFetched) return;

    set({ isLoading: true, error: null, errorCode: null });

    try {
      const response = await fetch('/api/favorites');
      const favorites = await parseFavoritesResponse(response);
      set(applyFavorites(favorites));
    } catch (error) {
      const favoriteError = getFavoriteError(error, 'Ошибка загрузки избранного');
      const isUnauthorized = favoriteError.code === 'UNAUTHORIZED';
      set({
        ...initialFavorites,
        isLoading: false,
        hasFetched: true,
        pendingProductIds: [],
        error: options?.silentAuth && isUnauthorized ? null : favoriteError.message,
        errorCode: options?.silentAuth && isUnauthorized ? null : favoriteError.code,
      });
    }
  },

  addItem: async (product) => {
    const previous = get();

    if (previous.items.some((item) => item.id === product.id)) return true;

    const optimisticItems = [...previous.items, toFavoriteItem(product)];
    set({
      items: optimisticItems,
      count: optimisticItems.length,
      pendingProductIds: addPendingProductId(previous.pendingProductIds, product.id),
      error: null,
      errorCode: null,
    });

    try {
      const response = await fetch('/api/favorites/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const favorites = await parseFavoritesResponse(response);
      set({
        ...applyFavorites(favorites),
        pendingProductIds: removePendingProductId(get().pendingProductIds, product.id),
      });
      return true;
    } catch (error) {
      const favoriteError = getFavoriteError(error, 'Не удалось добавить товар в избранное');
      set({
        items: previous.items,
        count: previous.count,
        isLoading: false,
        hasFetched: previous.hasFetched,
        pendingProductIds: removePendingProductId(get().pendingProductIds, product.id),
        error: favoriteError.message,
        errorCode: favoriteError.code,
      });
      return false;
    }
  },

  removeItem: async (productId) => {
    const previous = get();
    const optimisticItems = previous.items.filter((item) => item.id !== productId);

    set({
      items: optimisticItems,
      count: optimisticItems.length,
      pendingProductIds: addPendingProductId(previous.pendingProductIds, productId),
      error: null,
      errorCode: null,
    });

    try {
      const response = await fetch(`/api/favorites/items/${productId}`, {
        method: 'DELETE',
      });
      const favorites = await parseFavoritesResponse(response);
      set({
        ...applyFavorites(favorites),
        pendingProductIds: removePendingProductId(get().pendingProductIds, productId),
      });
      return true;
    } catch (error) {
      const favoriteError = getFavoriteError(error, 'Не удалось удалить товар из избранного');
      set({
        items: previous.items,
        count: previous.count,
        isLoading: false,
        hasFetched: previous.hasFetched,
        pendingProductIds: removePendingProductId(get().pendingProductIds, productId),
        error: favoriteError.message,
        errorCode: favoriteError.code,
      });
      return false;
    }
  },

  isFavorite: (productId) => get().items.some((item) => item.id === productId),
}));
