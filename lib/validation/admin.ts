import { z } from 'zod';
import { ORDER_STATUS } from '@/lib/constants';

const slugSchema = z.string().trim().min(1, 'Укажите slug').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug должен содержать латинские буквы, цифры и дефисы');

export const adminProductSchema = z.object({
  name: z.string().trim().min(2, 'Укажите название товара'),
  slug: slugSchema,
  description: z.string().trim().max(5000, 'Описание слишком длинное').optional().nullable(),
  price: z.coerce.number().positive('Цена должна быть больше 0'),
  stock: z.coerce.number().int().min(0, 'Количество не может быть отрицательным'),
  images: z.array(z.string().trim().startsWith('/products/', 'Изображения должны быть локальными файлами из /products')).default([]),
  specs: z.record(z.string(), z.unknown()).optional().nullable(),
  categoryId: z.string().trim().min(1, 'Выберите категорию'),
  brandId: z.string().trim().min(1, 'Выберите бренд'),
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(2, 'Укажите название категории'),
  slug: slugSchema,
  parentId: z.string().trim().min(1).optional().nullable(),
});

export const adminBrandSchema = z.object({
  name: z.string().trim().min(2, 'Укажите название бренда'),
  slug: slugSchema,
  logo: z.string().trim().startsWith('/brands/', 'Логотип должен быть локальным файлом из /brands').optional().nullable().or(z.literal('')),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
});

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminOrdersQuerySchema = adminPaginationSchema.extend({
  status: z.enum(ORDER_STATUS).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
}).refine((input) => !input.dateFrom || !input.dateTo || input.dateFrom <= input.dateTo, {
  message: 'Дата начала не может быть позже даты окончания',
  path: ['dateFrom'],
});

export const reviewStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const createReviewSchema = z.object({
  productId: z.string().trim().min(1, 'Укажите товар'),
  rating: z.coerce.number().int().min(1, 'Минимальная оценка — 1').max(5, 'Максимальная оценка — 5'),
  text: z.string().trim().min(10, 'Отзыв должен быть не короче 10 символов').max(2000, 'Отзыв слишком длинный'),
});

export const adminReviewQuerySchema = adminPaginationSchema.extend({
  status: reviewStatusSchema.optional(),
  productId: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const adminReviewStatusSchema = z.object({
  status: reviewStatusSchema,
});

export const promoCodeTypeSchema = z.enum(['PERCENT', 'FIXED']);

export const adminPromoCodeSchema = z.object({
  code: z.string().trim().min(3, 'Код должен быть не короче 3 символов').max(32, 'Код слишком длинный').transform((code) => code.toUpperCase()),
  type: promoCodeTypeSchema,
  value: z.coerce.number().positive('Скидка должна быть больше 0'),
  minOrderTotal: z.coerce.number().min(0, 'Минимальная сумма не может быть отрицательной').default(0),
  usageLimit: z.coerce.number().int().positive('Лимит должен быть больше 0').optional().nullable(),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().default(true),
}).refine((input) => input.type !== 'PERCENT' || input.value <= 100, {
  message: 'Процентная скидка не может быть больше 100%',
  path: ['value'],
}).refine((input) => !input.startsAt || !input.expiresAt || input.startsAt <= input.expiresAt, {
  message: 'Дата начала не может быть позже даты окончания',
  path: ['startsAt'],
});

export const applyPromoCodeSchema = z.object({
  code: z.string().trim().min(1, 'Укажите промокод').max(32).transform((code) => code.toUpperCase()),
});

export const adminStockQuerySchema = adminPaginationSchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().trim().min(1).optional(),
  brandId: z.string().trim().min(1).optional(),
  stock: z.enum(['all', 'low', 'out']).default('all'),
});

export const adminStockUpdateSchema = z.object({
  stock: z.coerce.number().int().min(0, 'Количество не может быть отрицательным'),
});

export const adminActionLogsQuerySchema = adminPaginationSchema.extend({
  adminId: z.string().trim().min(1).optional(),
  action: z.string().trim().min(1).max(100).optional(),
  entityType: z.string().trim().min(1).max(100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
}).refine((input) => !input.dateFrom || !input.dateTo || input.dateFrom <= input.dateTo, {
  message: 'Дата начала не может быть позже даты окончания',
  path: ['dateFrom'],
});
