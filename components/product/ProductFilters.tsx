'use client';

import { useState, useEffect, useRef } from 'react';
import type { Brand, PriceRange, ProductFilterMetadata, SpecFacet } from '@/types/api';

interface ProductFiltersProps {
  filters?: FilterState;
  categoryId?: string;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  specs?: Record<string, string[]>;
  sortBy: 'price' | 'createdAt' | 'name' | 'popular';
  sortOrder: 'asc' | 'desc';
}

export function ProductFilters({ filters, categoryId, onFilterChange }: ProductFiltersProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  const [specFacets, setSpecFacets] = useState<SpecFacet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true,
    price: true,
    stock: true,
    sort: true,
  });
  const filtersRef = useRef(filters);
  const localFiltersRef = useRef(localFilters);
  const onFilterChangeRef = useRef(onFilterChange);

  const currentFilters = filters ?? localFilters;

  useEffect(() => {
    filtersRef.current = filters;
    localFiltersRef.current = localFilters;
    onFilterChangeRef.current = onFilterChange;
  }, [filters, localFilters, onFilterChange]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);

    fetch(`/api/products/filters${params.toString() ? `?${params}` : ''}`).then((r) => {
      if (!r.ok) throw new Error('Не удалось загрузить фильтры');
      return r.json();
    }).then((metadata: ProductFilterMetadata) => {
      const nextBrands = Array.isArray(metadata.brands) ? metadata.brands : [];
      const nextPriceRange = metadata.priceRange ?? { min: null, max: null };
      const nextSpecFacets = Array.isArray(metadata.specs) ? metadata.specs : [];
      const activeFilters = filtersRef.current ?? localFiltersRef.current;
      const nextFilters = { ...activeFilters };
      setBrands(nextBrands);
      setPriceRange(nextPriceRange);
      setSpecFacets(nextSpecFacets);
      setExpandedSections((currentSections) => nextSpecFacets.reduce((sections, facet) => ({ ...sections, [`spec:${facet.key}`]: currentSections[`spec:${facet.key}`] ?? true }), currentSections));
      setError(null);

      if (nextFilters.brandId && !nextBrands.some((brand) => brand.id === nextFilters.brandId)) {
        nextFilters.brandId = undefined;
      }
      if (nextPriceRange.min !== null && nextFilters.minPrice !== undefined && nextFilters.minPrice < nextPriceRange.min) {
        nextFilters.minPrice = undefined;
      }
      if (nextPriceRange.max !== null && nextFilters.maxPrice !== undefined && nextFilters.maxPrice > nextPriceRange.max) {
        nextFilters.maxPrice = undefined;
      }
      if (nextFilters.specs) {
        const nextSpecs: Record<string, string[]> = {};

        for (const facet of nextSpecFacets) {
          const selectedValues = nextFilters.specs[facet.key] ?? [];
          const availableValues = new Set(facet.values.map((item) => item.value));
          const validValues = selectedValues.filter((value) => availableValues.has(value));

          if (validValues.length > 0) {
            nextSpecs[facet.key] = validValues;
          }
        }

        nextFilters.specs = Object.keys(nextSpecs).length > 0 ? nextSpecs : undefined;
      }

      if (
        nextFilters.brandId !== activeFilters.brandId ||
        nextFilters.minPrice !== activeFilters.minPrice ||
        nextFilters.maxPrice !== activeFilters.maxPrice ||
        JSON.stringify(nextFilters.specs ?? {}) !== JSON.stringify(activeFilters.specs ?? {})
      ) {
        if (!filtersRef.current) {
          setLocalFilters(nextFilters);
        }
        onFilterChangeRef.current(nextFilters);
      }
    }).catch((error) => {
      console.error('Не удалось загрузить фильтры:', error);
      setError('Не удалось загрузить фильтры. Обновите страницу.');
      setBrands([]);
      setPriceRange({ min: null, max: null });
      setSpecFacets([]);
    });
  }, [categoryId]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (!filters) {
      setLocalFilters(newFilters);
    }
    onFilterChange(newFilters);
  };

  const toggleSpecFilter = (key: string, value: string) => {
    const selectedValues = currentFilters.specs?.[key] ?? [];
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((selectedValue) => selectedValue !== value)
      : [...selectedValues, value];
    const nextSpecs = { ...(currentFilters.specs ?? {}) };

    if (nextValues.length > 0) {
      nextSpecs[key] = nextValues;
    } else {
      delete nextSpecs[key];
    }

    updateFilter('specs', Object.keys(nextSpecs).length > 0 ? nextSpecs : undefined);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="w-full bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Сортировка</span>
          <span className="text-gray-400">{expandedSections.sort ? '−' : '+'}</span>
        </button>
        {expandedSections.sort && (
          <div className="space-y-2">
            <select
              value={currentFilters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as FilterState['sortBy'])}
              className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
            >
              <option value="createdAt">Сначала новые</option>
              <option value="price">Цена</option>
              <option value="popular">Популярность</option>
              <option value="name">Название</option>
            </select>
            <select
              value={currentFilters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value as FilterState['sortOrder'])}
              className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
            >
              <option value="desc">По убыванию</option>
              <option value="asc">По возрастанию</option>
            </select>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Наличие</span>
          <span className="text-gray-400">{expandedSections.stock ? '−' : '+'}</span>
        </button>
        {expandedSections.stock && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentFilters.inStock || false}
              onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
              className="accent-red-600"
            />
            <span className="text-sm">Только в наличии</span>
          </label>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Бренд</span>
          <span className="text-gray-400">{expandedSections.brand ? '−' : '+'}</span>
        </button>
        {expandedSections.brand && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            <label className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors">
              <input
                type="radio"
                name="brand"
                checked={!currentFilters.brandId}
                onChange={() => updateFilter('brandId', undefined)}
                className="accent-red-600"
              />
              <span className="text-sm">Все бренды</span>
            </label>
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={currentFilters.brandId === brand.id}
                  onChange={() => updateFilter('brandId', brand.id)}
                  className="accent-red-600"
                />
                <span className="text-sm">
                  {brand.name} ({brand.productCount})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Цена</span>
          <span className="text-gray-400">{expandedSections.price ? '−' : '+'}</span>
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">От</label>
              <input
                type="number"
                min={priceRange.min ?? 0}
                max={priceRange.max ?? undefined}
                placeholder={priceRange.min !== null ? String(priceRange.min) : '0'}
                value={currentFilters.minPrice || ''}
                onChange={(e) =>
                  updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">До</label>
              <input
                type="number"
                min={priceRange.min ?? 0}
                max={priceRange.max ?? undefined}
                placeholder={priceRange.max !== null ? String(priceRange.max) : '∞'}
                value={currentFilters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {specFacets.map((facet) => {
        const sectionKey = `spec:${facet.key}`;
        const selectedValues = currentFilters.specs?.[facet.key] ?? [];

        return (
          <div key={facet.key} className="border-t border-gray-200 pt-6">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="flex items-center justify-between w-full font-bold text-lg mb-3"
            >
              <span>{facet.label}</span>
              <span className="text-gray-400">{expandedSections[sectionKey] ? '−' : '+'}</span>
            </button>
            {expandedSections[sectionKey] && (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {facet.values.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(item.value)}
                      onChange={() => toggleSpecFilter(facet.key, item.value)}
                      className="accent-red-600"
                    />
                    <span className="text-sm">
                      {item.value} ({item.count})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
