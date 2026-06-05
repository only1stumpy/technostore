import 'dotenv/config'
import { prisma } from '../lib/prisma'

// КАТЕГОРИИ
// Формат: { name: 'Название категории', slug: 'url-slug' }
// Пример: { name: 'Ноутбуки', slug: 'laptops' }
const categoriesData = [
  { name: 'Смартфоны', slug: 'smartphones' },
]

// БРЕНДЫ
// Формат: { name: 'Название', slug: 'url-slug', logo: 'URL или путь' }
// logo — можно использовать любую ссылку (https://... или /logos/...)
// Пример: { name: 'Apple', slug: 'apple', logo: 'https://logo.clearbit.com/apple.com' }
const brandsData = [
  { name: 'Apple', slug: 'apple', logo: 'https://logo.clearbit.com/apple.com' },
]

// ИЗОБРАЖЕНИЯ ТОВАРОВ (опционально)
// Ключ — slug товара, значение — массив любых URL изображений
// Если не указано, используются изображения из categoryImagesBySlug
// Пример:
// 'iphone-15': [
//   'https://example.com/iphone-1.jpg',
//   'https://example.com/iphone-2.jpg',
// ],
const productImagesBySlug: Record<string, string[]> = {
 'iphone-15': [
   'https://example.com/iphone-1.jpg',
   'https://example.com/iphone-2.jpg',
 ],
}

// ИЗОБРАЖЕНИЯ КАТЕГОРИЙ (fallback для товаров без своих изображений)
// Ключ — slug категории, значение — массив URL
// Пример:
// smartphones: ['https://example.com/category-phone.jpg'],
const categoryImagesBySlug: Record<string, string[]> = {
  smartphones: ['https://example.com/category-phone.jpg'],
}

// ТОВАРЫ
// Формат массива (порядок важен!):
// [название, slug, описание, цена, остаток, categorySlug, brandSlug, {характеристики}]
//
// Характеристики — объект в формате ключ: значение для работы фильтров
// Пример:
// ['iPhone 15', 'iphone-15', 'Флагманский смартфон Apple', 8200, 50, 'smartphones', 'apple', {
//   'Экран': '6.1″ Super Retina XDR',
//   'Процессор': 'A16 Bionic',
//   'Память': '128 ГБ',
//   'Камера': '48 МП',
// }],
const productsData = [
  ['iPhone 15', 'iphone-15', 'Флагманский смартфон Apple', 8200, 50, 'smartphones', 'apple', {
   'Экран': '6.1″ Super Retina XDR',
   'Процессор': 'A16 Bionic',
   'Память': '128 ГБ',
   'Камера': '48 МП',
 }],
] as const

export async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const adminUser = await prisma.user.upsert({
    where: { phone: '+79990000000' },
    update: { name: 'Администратор', role: 'ADMIN' },
    create: {
      phone: '+79990000000',
      name: 'Администратор',
      role: 'ADMIN',
    },
  })

  const reviewUsers = await Promise.all([
    prisma.user.upsert({
      where: { phone: '+37360000001' },
      update: { name: 'Иван Петров', role: 'USER' },
      create: { phone: '+37360000001', name: 'Иван Петров', role: 'USER' },
    }),
    prisma.user.upsert({
      where: { phone: '+37360000002' },
      update: { name: 'Анна Смирнова', role: 'USER' },
      create: { phone: '+37360000002', name: 'Анна Смирнова', role: 'USER' },
    }),
    prisma.user.upsert({
      where: { phone: '+37360000003' },
      update: { name: 'Дмитрий Коваленко', role: 'USER' },
      create: { phone: '+37360000003', name: 'Дмитрий Коваленко', role: 'USER' },
    }),
  ])

  const categoryBySlug = new Map<string, { id: string }>()
  for (const data of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: data.slug },
      update: { name: data.name, deletedAt: null },
      create: data,
    })
    categoryBySlug.set(category.slug, category)
  }

  const brandBySlug = new Map<string, { id: string }>()
  for (const data of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: data.slug },
      update: { name: data.name, logo: data.logo, deletedAt: null },
      create: data,
    })
    brandBySlug.set(brand.slug, brand)
  }

  const productBySlug = new Map<string, { id: string }>()
  for (const [name, slug, description, price, stock, categorySlug, brandSlug, specs] of productsData) {
    const category = categoryBySlug.get(categorySlug)
    const brand = brandBySlug.get(brandSlug)

    if (!category || !brand) {
      throw new Error(`Missing relation for product ${slug}`)
    }

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        price,
        stock,
        images: productImagesBySlug[slug] ?? categoryImagesBySlug[categorySlug],
        specs,
        categoryId: category.id,
        brandId: brand.id,
        deletedAt: null,
      },
      create: {
        name,
        slug,
        description,
        price,
        stock,
        images: productImagesBySlug[slug] ?? categoryImagesBySlug[categorySlug],
        specs,
        categoryId: category.id,
        brandId: brand.id,
      },
    })
    productBySlug.set(product.slug, product)
  }

  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: {
      type: 'PERCENT',
      value: 10,
      minOrderTotal: 1000,
      usageLimit: 100,
      isActive: true,
    },
    create: {
      code: 'WELCOME10',
      type: 'PERCENT',
      value: 10,
      minOrderTotal: 1000,
      usageLimit: 100,
    },
  })

  await prisma.promoCode.upsert({
    where: { code: 'TECH500' },
    update: {
      type: 'FIXED',
      value: 500,
      minOrderTotal: 5000,
      usageLimit: 50,
      isActive: true,
    },
    create: {
      code: 'TECH500',
      type: 'FIXED',
      value: 500,
      minOrderTotal: 5000,
      usageLimit: 50,
    },
  })

  await prisma.promoCode.upsert({
    where: { code: 'LAPTOP15' },
    update: {
      type: 'PERCENT',
      value: 15,
      minOrderTotal: 50000,
      usageLimit: 25,
      isActive: true,
    },
    create: {
      code: 'LAPTOP15',
      type: 'PERCENT',
      value: 15,
      minOrderTotal: 50000,
      usageLimit: 25,
    },
  })

  await prisma.promoCode.upsert({
    where: { code: 'ACCESSORY200' },
    update: {
      type: 'FIXED',
      value: 200,
      minOrderTotal: 1500,
      usageLimit: null,
      isActive: true,
    },
    create: {
      code: 'ACCESSORY200',
      type: 'FIXED',
      value: 200,
      minOrderTotal: 1500,
      usageLimit: null,
    },
  })

  const reviewsData = [
//    ['macbook-air-m2', 0, 5, 'Очень легкий и тихий ноутбук. Для учебы, браузера и работы с документами хватает с большим запасом.'],
      ['iphone-15', 1, 5, 'Камера и экран отличные, батареи спокойно хватает на день активного использования.'],
    //['samsung-galaxy-s24', 2, 4, 'Компактный корпус и быстрый интерфейс. Хотелось бы зарядку в комплекте, но сам телефон понравился.'],
    //['airpods-pro-2', 0, 5, 'Шумоподавление заметно лучше старых наушников, удобно использовать в дороге и офисе.'],
    //['dell-ultrasharp-u2723qe', 1, 4, 'Хороший монитор для работы с текстом и цветом, USB-C хаб сильно упрощает подключение ноутбука.'],
  ] as const

  for (const [productSlug, userIndex, rating, text] of reviewsData) {
    const product = productBySlug.get(productSlug)
    const user = reviewUsers[userIndex]

    if (!product || !user) {
      throw new Error(`Missing review relation for product ${productSlug}`)
    }

    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: product.id,
        },
      },
      update: {
        rating,
        text,
        status: 'APPROVED',
      },
      create: {
        userId: user.id,
        productId: product.id,
        rating,
        text,
        status: 'APPROVED',
      },
    })
  }

  console.log(`Seed completed: ${categoriesData.length} categories, ${brandsData.length} brands, ${productsData.length} products, 4 promo codes, ${reviewsData.length} reviews, admin ${adminUser.phone}`)
}

seedDatabase()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
