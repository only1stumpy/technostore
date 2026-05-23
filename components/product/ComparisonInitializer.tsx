'use client';

import { useEffect } from 'react';
import { useComparisonStore } from '@/store/comparisonStore';

export function ComparisonInitializer() {
  const hasFetched = useComparisonStore((state) => state.hasFetched);
  const fetchComparison = useComparisonStore((state) => state.fetchComparison);

  useEffect(() => {
    if (!hasFetched) {
      void fetchComparison({ silentAuth: true });
    }
  }, [fetchComparison, hasFetched]);

  return null;
}
