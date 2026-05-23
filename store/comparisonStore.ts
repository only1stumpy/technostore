'use client';

import { create } from 'zustand';
import type { ComparisonItem, ComparisonResponse, ProductCard } from '@/types/api';

type ComparisonRequestError = Error & {
  code?: string;
};

type ComparisonState = ComparisonResponse & {
  isLoading: boolean;
  hasFetched: boolean;
  pendingProductIds: string[];
  error: string | null;
  errorCode: string | null;
  fetchComparison: (options?: { silentAuth?: boolean }) => Promise<void>;
  setComparison: (comparison: ComparisonResponse) => void;
  addItem: (product: ProductCard) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearComparison: () => Promise<boolean>;
  isCompared: (productId: string) => boolean;
  resetComparison: () => void;
};

const initialComparison: ComparisonResponse = {
  items: [],
  count: 0,
};

async function parseComparisonResponse(response: Response): Promise<ComparisonResponse> {
  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.error || 'Ошибка сравнения') as ComparisonRequestError;
    error.code = json.code;
    throw error;
  }

  return json.data ?? initialComparison;
}

function getComparisonError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as ComparisonRequestError).code ?? null,
    };
  }

  return {
    message: fallback,
    code: null,
  };
}

function applyComparison(comparison: ComparisonResponse) {
  return {
    items: comparison.items,
    count: comparison.count,
    isLoading: false,
    hasFetched: true,
    error: null,
    errorCode: null,
  };
}

function toComparisonItem(product: ProductCard): ComparisonItem {
  return {
    ...product,
    specs: null,
    isCompared: true,
    addedAt: new Date().toISOString(),
  };
}

function addPendingProductId(pendingProductIds: string[], productId: string) {
  return pendingProductIds.includes(productId) ? pendingProductIds : [...pendingProductIds, productId];
}

function removePendingProductId(pendingProductIds: string[], productId: string) {
  return pendingProductIds.filter((id) => id !== productId);
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  ...initialComparison,
  isLoading: false,
  hasFetched: false,
  pendingProductIds: [],
  error: null,
  errorCode: null,

  setComparison: (comparison) => set(applyComparison(comparison)),
  resetComparison: () => set({ ...initialComparison, isLoading: false, hasFetched: false, pendingProductIds: [], error: null, errorCode: null }),

  fetchComparison: async (options) => {
    if (get().hasFetched) return;

    set({ isLoading: true, error: null, errorCode: null });

    try {
      const response = await fetch('/api/compare');
      const comparison = await parseComparisonResponse(response);
      set(applyComparison(comparison));
    } catch (error) {
      const comparisonError = getComparisonError(error, 'Ошибка загрузки сравнения');
      const isUnauthorized = comparisonError.code === 'UNAUTHORIZED';
      set({
        ...initialComparison,
        isLoading: false,
        hasFetched: true,
        pendingProductIds: [],
        error: options?.silentAuth && isUnauthorized ? null : comparisonError.message,
        errorCode: options?.silentAuth && isUnauthorized ? null : comparisonError.code,
      });
    }
  },

  addItem: async (product) => {
    const previous = get();

    if (previous.items.some((item) => item.id === product.id)) return true;

    const optimisticItems = [...previous.items, toComparisonItem(product)];
    set({
      items: optimisticItems,
      count: optimisticItems.length,
      pendingProductIds: addPendingProductId(previous.pendingProductIds, product.id),
      error: null,
      errorCode: null,
    });

    try {
      const response = await fetch('/api/compare/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      const comparison = await parseComparisonResponse(response);
      set({
        ...applyComparison(comparison),
        pendingProductIds: removePendingProductId(get().pendingProductIds, product.id),
      });
      return true;
    } catch (error) {
      const comparisonError = getComparisonError(error, 'Не удалось добавить товар в сравнение');
      set({
        items: previous.items,
        count: previous.count,
        isLoading: false,
        hasFetched: previous.hasFetched,
        pendingProductIds: removePendingProductId(get().pendingProductIds, product.id),
        error: comparisonError.message,
        errorCode: comparisonError.code,
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
      const response = await fetch(`/api/compare/items/${productId}`, {
        method: 'DELETE',
      });
      const comparison = await parseComparisonResponse(response);
      set({
        ...applyComparison(comparison),
        pendingProductIds: removePendingProductId(get().pendingProductIds, productId),
      });
      return true;
    } catch (error) {
      const comparisonError = getComparisonError(error, 'Не удалось удалить товар из сравнения');
      set({
        items: previous.items,
        count: previous.count,
        isLoading: false,
        hasFetched: previous.hasFetched,
        pendingProductIds: removePendingProductId(get().pendingProductIds, productId),
        error: comparisonError.message,
        errorCode: comparisonError.code,
      });
      return false;
    }
  },

  clearComparison: async () => {
    const previous = get();

    set({ ...initialComparison, hasFetched: previous.hasFetched, isLoading: true, pendingProductIds: [], error: null, errorCode: null });

    try {
      const response = await fetch('/api/compare', {
        method: 'DELETE',
      });

      if (!response.ok) {
        await parseComparisonResponse(response);
      }

      set({ ...initialComparison, isLoading: false, hasFetched: true, pendingProductIds: [], error: null, errorCode: null });
      return true;
    } catch (error) {
      const comparisonError = getComparisonError(error, 'Не удалось очистить сравнение');
      set({
        items: previous.items,
        count: previous.count,
        isLoading: false,
        hasFetched: previous.hasFetched,
        pendingProductIds: [],
        error: comparisonError.message,
        errorCode: comparisonError.code,
      });
      return false;
    }
  },

  isCompared: (productId) => get().items.some((item) => item.id === productId),
}));
