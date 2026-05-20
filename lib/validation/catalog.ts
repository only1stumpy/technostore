import { z } from 'zod';

export const ProductFiltersSchema = z.object({
  // Pagination
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),

  // Filters
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  inStock: z.coerce.boolean().optional(),
  search: z.string().min(1).max(100).optional(),

  // Sorting
  sortBy: z.enum(['price', 'createdAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).refine(
  (data) => !data.maxPrice || !data.minPrice || data.maxPrice >= data.minPrice,
  { message: "maxPrice must be >= minPrice" }
);

export const ProductIdSchema = z.object({
  id: z.string().uuid()
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
