'use client';

import { useState, useEffect } from 'react';
import type { CategoryTree, Brand } from '@/types/api';

interface ProductFiltersProps {
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

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    stock: true,
    sort: true,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => {
        if (!r.ok) throw new Error('Failed to load categories');
        return r.json();
      }),
      fetch('/api/brands').then((r) => {
        if (!r.ok) throw new Error('Failed to load brands');
        return r.json();
      }),
    ]).then(([cats, brds]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setBrands(Array.isArray(brds) ? brds : []);
      setError(null);
    }).catch((error) => {
      console.error('Failed to fetch filters:', error);
      setError('Failed to load filters. Please refresh the page.');
      setCategories([]);
      setBrands([]);
    });
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderCategory = (cat: CategoryTree, level = 0) => (
    <div key={cat.id}>
      <label
        className={`flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors ${
          level > 0 ? 'pl-4' : ''
        }`}
      >
        <input
          type="radio"
          name="category"
          checked={filters.categoryId === cat.id}
          onChange={() => updateFilter('categoryId', cat.id)}
          className="accent-red-600"
        />
        <span className="text-sm">
          {cat.name} ({cat.productCount})
        </span>
      </label>
      {cat.children?.map((child) => renderCategory(child, level + 1))}
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 space-y-6 overflow-y-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Category</span>
          <span className="text-gray-400">{expandedSections.category ? '−' : '+'}</span>
        </button>
        {expandedSections.category && (
          <div className="space-y-1">
            <label className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors">
              <input
                type="radio"
                name="category"
                checked={!filters.categoryId}
                onChange={() => updateFilter('categoryId', undefined)}
                className="accent-red-600"
              />
              <span className="text-sm">All Categories</span>
            </label>
            {categories.map((cat) => renderCategory(cat))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Brand</span>
          <span className="text-gray-400">{expandedSections.brand ? '−' : '+'}</span>
        </button>
        {expandedSections.brand && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            <label className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors">
              <input
                type="radio"
                name="brand"
                checked={!filters.brandId}
                onChange={() => updateFilter('brandId', undefined)}
                className="accent-red-600"
              />
              <span className="text-sm">All Brands</span>
            </label>
            {brands.map((brand) => (
              <label
                key={brand.id}
                className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-red-600 transition-colors"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brandId === brand.id}
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
          <span>Price</span>
          <span className="text-gray-400">{expandedSections.price ? '−' : '+'}</span>
        </button>
        {expandedSections.price && (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
              <input
                type="number"
                min="0"
                placeholder="∞"
                value={filters.maxPrice || ''}
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
          <span>Availability</span>
          <span className="text-gray-400">{expandedSections.stock ? '−' : '+'}</span>
        </button>
        {expandedSections.stock && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => updateFilter('inStock', e.target.checked || undefined)}
              className="accent-red-600"
            />
            <span className="text-sm">In Stock Only</span>
          </label>
        )}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => toggleSection('sort')}
          className="flex items-center justify-between w-full font-bold text-lg mb-3"
        >
          <span>Sort By</span>
          <span className="text-gray-400">{expandedSections.sort ? '−' : '+'}</span>
        </button>
        {expandedSections.sort && (
          <div className="space-y-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:border-red-600 focus:outline-none"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
