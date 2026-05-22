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
