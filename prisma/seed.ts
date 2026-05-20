import 'dotenv/config'
import { prisma } from '../lib/prisma'

const categoriesData = [
  { name: 'Ноутбуки', slug: 'laptops' },
  { name: 'Смартфоны', slug: 'smartphones' },
  { name: 'Планшеты', slug: 'tablets' },
  { name: 'Аксессуары', slug: 'accessories' },
  { name: 'Мониторы', slug: 'monitors' },
]

const brandsData = [
  { name: 'Apple', slug: 'apple', logo: '/logos/apple.png' },
  { name: 'Samsung', slug: 'samsung', logo: '/logos/samsung.png' },
  { name: 'Lenovo', slug: 'lenovo', logo: '/logos/lenovo.png' },
  { name: 'HP', slug: 'hp', logo: '/logos/hp.png' },
  { name: 'Xiaomi', slug: 'xiaomi', logo: '/logos/xiaomi.png' },
  { name: 'ASUS', slug: 'asus', logo: '/logos/asus.png' },
  { name: 'Dell', slug: 'dell', logo: '/logos/dell.png' },
]

const productsData = [
  ['MacBook Air M2', 'macbook-air-m2', 'Тонкий ноутбук Apple на чипе M2 для работы, учебы и путешествий.', 119999, 12, 'laptops', 'apple', ['13.6″ Liquid Retina', 'Apple M2', '8 ГБ RAM', '256 ГБ SSD']],
  ['MacBook Pro 14 M3', 'macbook-pro-14-m3', 'Профессиональный ноутбук Apple с ярким экраном и высокой автономностью.', 229999, 8, 'laptops', 'apple', ['14.2″ Liquid Retina XDR', 'Apple M3', '16 ГБ RAM', '512 ГБ SSD']],
  ['Lenovo IdeaPad Slim 5', 'lenovo-ideapad-slim-5', 'Универсальный ноутбук для офиса, учебы и повседневных задач.', 72999, 20, 'laptops', 'lenovo', ['16″ IPS', 'AMD Ryzen 5', '16 ГБ RAM', '512 ГБ SSD']],
  ['HP Pavilion 15', 'hp-pavilion-15', 'Производительный ноутбук HP с полноразмерной клавиатурой.', 68999, 15, 'laptops', 'hp', ['15.6″ IPS', 'Intel Core i5', '16 ГБ RAM', '512 ГБ SSD']],
  ['ASUS Zenbook 14 OLED', 'asus-zenbook-14-oled', 'Компактный ноутбук с OLED-экраном и металлическим корпусом.', 99999, 9, 'laptops', 'asus', ['14″ OLED', 'Intel Core Ultra 5', '16 ГБ RAM', '1 ТБ SSD']],
  ['Dell XPS 13', 'dell-xps-13', 'Премиальный ультрабук Dell с тонкими рамками.', 134999, 7, 'laptops', 'dell', ['13.4″ FHD+', 'Intel Core i7', '16 ГБ RAM', '512 ГБ SSD']],
  ['iPhone 15', 'iphone-15', 'Смартфон Apple с Dynamic Island, USB-C и отличной камерой.', 89999, 24, 'smartphones', 'apple', ['6.1″ Super Retina XDR', 'A16 Bionic', '128 ГБ', '48 МП']],
  ['iPhone 15 Pro', 'iphone-15-pro', 'Флагманский iPhone с титановым корпусом и чипом A17 Pro.', 129999, 13, 'smartphones', 'apple', ['6.1″ Super Retina XDR', 'A17 Pro', '256 ГБ', 'Pro camera system']],
  ['Samsung Galaxy S24', 'samsung-galaxy-s24', 'Компактный флагман Samsung с ярким AMOLED-экраном.', 84999, 18, 'smartphones', 'samsung', ['6.2″ Dynamic AMOLED', 'Exynos 2400', '8 ГБ RAM', '256 ГБ']],
  ['Samsung Galaxy A55', 'samsung-galaxy-a55', 'Сбалансированный смартфон Samsung с влагозащитой.', 39999, 35, 'smartphones', 'samsung', ['6.6″ Super AMOLED', 'Exynos 1480', '8 ГБ RAM', '128 ГБ']],
  ['Xiaomi Redmi Note 13 Pro', 'xiaomi-redmi-note-13-pro', 'Смартфон Xiaomi с быстрой зарядкой и камерой высокого разрешения.', 32999, 42, 'smartphones', 'xiaomi', ['6.67″ AMOLED', 'Snapdragon 7s Gen 2', '8 ГБ RAM', '200 МП']],
  ['Xiaomi 14', 'xiaomi-14', 'Компактный флагман Xiaomi с камерой Leica.', 79999, 16, 'smartphones', 'xiaomi', ['6.36″ AMOLED', 'Snapdragon 8 Gen 3', '12 ГБ RAM', '512 ГБ']],
  ['iPad Air 11 M2', 'ipad-air-11-m2', 'Легкий планшет Apple для учебы, творчества и развлечений.', 69999, 14, 'tablets', 'apple', ['11″ Liquid Retina', 'Apple M2', '128 ГБ', 'Wi‑Fi']],
  ['iPad Pro 13 M4', 'ipad-pro-13-m4', 'Тонкий профессиональный планшет Apple с OLED-дисплеем.', 149999, 6, 'tablets', 'apple', ['13″ Ultra Retina XDR', 'Apple M4', '256 ГБ', 'Wi‑Fi']],
  ['Samsung Galaxy Tab S9', 'samsung-galaxy-tab-s9', 'Android-планшет Samsung с AMOLED-экраном и стилусом.', 79999, 11, 'tablets', 'samsung', ['11″ Dynamic AMOLED', 'Snapdragon 8 Gen 2', '8 ГБ RAM', 'S Pen']],
  ['Lenovo Tab P12', 'lenovo-tab-p12', 'Большой планшет Lenovo для фильмов, учебы и заметок.', 34999, 17, 'tablets', 'lenovo', ['12.7″ 3K', 'MediaTek Dimensity 7050', '8 ГБ RAM', '128 ГБ']],
  ['Apple Watch Series 9', 'apple-watch-series-9', 'Умные часы Apple с датчиками здоровья и ярким экраном.', 44999, 25, 'accessories', 'apple', ['Retina Always‑On', 'S9 SiP', 'GPS', '45 мм']],
  ['Samsung Galaxy Watch6', 'samsung-galaxy-watch6', 'Умные часы Samsung для спорта, сна и уведомлений.', 29999, 28, 'accessories', 'samsung', ['AMOLED', 'Wear OS', 'GPS', '44 мм']],
  ['AirPods Pro 2', 'airpods-pro-2', 'Беспроводные наушники Apple с активным шумоподавлением.', 24999, 40, 'accessories', 'apple', ['ANC', 'USB‑C MagSafe case', 'Spatial Audio', 'до 30 часов']],
  ['Xiaomi Power Bank 20000', 'xiaomi-power-bank-20000', 'Портативный аккумулятор Xiaomi с быстрой зарядкой.', 3999, 60, 'accessories', 'xiaomi', ['20000 мА·ч', 'USB‑C', '22.5 Вт', '2 USB‑A']],
  ['Samsung 27 Odyssey G5', 'samsung-27-odyssey-g5', 'Игровой монитор Samsung с высокой частотой обновления.', 29999, 10, 'monitors', 'samsung', ['27″ QHD', '165 Гц', '1 мс', 'VA']],
  ['Dell UltraSharp U2723QE', 'dell-ultrasharp-u2723qe', 'Профессиональный 4K-монитор Dell с USB‑C хабом.', 69999, 5, 'monitors', 'dell', ['27″ 4K', 'IPS Black', 'USB‑C 90 Вт', 'HDR']],
  ['ASUS ProArt PA278QV', 'asus-proart-pa278qv', 'Монитор ASUS для дизайнеров и работы с цветом.', 34999, 8, 'monitors', 'asus', ['27″ QHD', 'IPS', '100% sRGB', 'CalMAN Verified']],
  ['HP M24fwa', 'hp-m24fwa', 'Тонкий домашний монитор HP со встроенными динамиками.', 14999, 22, 'monitors', 'hp', ['23.8″ FHD', 'IPS', '75 Гц', '2 динамика']],
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

  for (const [name, slug, description, price, stock, categorySlug, brandSlug, specs] of productsData) {
    const category = categoryBySlug.get(categorySlug)
    const brand = brandBySlug.get(brandSlug)

    if (!category || !brand) {
      throw new Error(`Missing relation for product ${slug}`)
    }

    await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        price,
        stock,
        images: [`/products/${slug}-1.jpg`, `/products/${slug}-2.jpg`],
        specs: {
          features: specs,
        },
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
        images: [`/products/${slug}-1.jpg`, `/products/${slug}-2.jpg`],
        specs: {
          features: specs,
        },
        categoryId: category.id,
        brandId: brand.id,
      },
    })
  }

  console.log(`Seed completed: ${categoriesData.length} categories, ${brandsData.length} brands, ${productsData.length} products, admin ${adminUser.phone}`)
}

seedDatabase()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
