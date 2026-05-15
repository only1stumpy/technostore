import { Prisma } from '@prisma/client';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
  };
}>;

export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface ProductSort {
  field: 'price' | 'createdAt' | 'name';
  order: 'asc' | 'desc';
}

export interface ProductQueryParams extends ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
}
