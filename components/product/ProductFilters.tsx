'use client';

import { useState, useEffect } from 'react';
import type { Brand } from '@/types/api';

interface ProductFiltersProps {
  filters?: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy: 'price' | 'createdAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    stock: true,
    sort: true,
  });

  useEffect(() => {
    fetch('/api/brands').then((r) => {
      if (!r.ok) throw new Error('Не удалось загрузить бренды');
      return r.json();
    }).then((brds) => {
      setBrands(Array.isArray(brds) ? brds : []);
      setError(null);
    }).catch((error) => {
      console.error('Не удалось загрузить фильтры:', error);
      setError('Не удалось загрузить фильтры. Обновите страницу.');
      setBrands([]);
    });
  }, []);

  const currentFilters = filters ?? localFilters;

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (!filters) {
      setLocalFilters(newFilters);
    }
    onFilterChange(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
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
                min="0"
                placeholder="0"
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
                min="0"
                placeholder="∞"
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
    </div>
  );
}
