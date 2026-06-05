import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { OrderStatus } from '@prisma/client'

// КАТЕГОРИИ
// Формат: { name: 'Название категории', slug: 'url-slug' }
// Пример: { name: 'Ноутбуки', slug: 'laptops' }
const categoriesData = [
  { name: 'SSD Накопители', slug: 'ssd-nakopiteli' },
  { name: 'Блоки питания', slug: 'bloki-pitaniya' },
  { name: 'Видеокарты', slug: 'videokarty' },
  { name: 'Корпуса', slug: 'korpusa' },
  { name: 'Материнские платы', slug: 'materinskie-platy' },
  { name: 'Оперативная память', slug: 'moduli-pamyati' },
  { name: 'Процессоры', slug: 'processory' },
  { name: 'Системы охлаждения', slug: 'sistemy-ohlazhdeniya' },
]

// БРЕНДЫ
// Формат: { name: 'Название', slug: 'url-slug', logo: 'URL или путь' }
// logo — можно использовать любую ссылку (https://... или /logos/...)
// Пример: { name: 'Apple', slug: 'apple', logo: 'https://logo.clearbit.com/apple.com' }
const brandsData = [
  { name: 'AMD', slug: 'amd', logo: 'https://logo.clearbit.com/amd.com' },
  { name: 'Intel', slug: 'intel', logo: 'https://logo.clearbit.com/intel.com' },
  { name: 'Kingston', slug: 'kingston', logo: 'https://logo.clearbit.com/kingston.com' },
  { name: 'Patriot', slug: 'patriot', logo: 'https://logo.clearbit.com/patriotmemory.com' },
  { name: 'Western Digital', slug: 'western-digital', logo: 'https://logo.clearbit.com/wdc.com' },
  { name: 'NVIDIA', slug: 'nvidia', logo: 'https://logo.clearbit.com/nvidia.com' },
  { name: 'ASUS', slug: 'asus', logo: 'https://logo.clearbit.com/asus.com' },
  { name: 'MSI', slug: 'msi', logo: 'https://logo.clearbit.com/msi.com' },
  { name: 'Gigabyte', slug: 'gigabyte', logo: 'https://logo.clearbit.com/gigabyte.com' },
  { name: 'Corsair', slug: 'corsair', logo: 'https://logo.clearbit.com/corsair.com' },
  { name: 'Cooler Master', slug: 'cooler-master', logo: 'https://logo.clearbit.com/coolermaster.com' },
  { name: 'Be Quiet!', slug: 'be-quiet', logo: 'https://logo.clearbit.com/bequiet.com' },
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
  'amd-ryzen-5-5600x': ['https://i.hi-tech.md/36000/35936-p.webp'],
  'intel-core-i5-12400f': ['https://i.hi-tech.md/37800/37774-p.webp'],
  'amd-ryzen-7-5800x3d': ['https://i.hi-tech.md/37600/37570-p.webp'],
  'kingston-nv2-500gb': ['https://i.hi-tech.md/37200/37136-p.webp'],
  'nvidia-geforce-rtx-4060-ti-8gb': ['https://i.hi-tech.md/39600/39520-p.webp'],
  'asus-rog-strix-rx-7800-xt': ['https://i.hi-tech.md/40200/40174-p.webp'],
  'msi-b550-a-pro': ['https://i.hi-tech.md/36000/35970-p.webp'],
  'kingston-fury-beast-16gb-ddr4-3200': ['https://i.hi-tech.md/37400/37330-p.webp'],
  'corsair-vengeance-rgb-32gb-ddr5-6000': ['https://i.hi-tech.md/39800/39746-p.webp'],
  'corsair-rm750e-750w-80-plus-gold': ['https://i.hi-tech.md/39400/39372-p.webp'],
  'cooler-master-masterbox-q300l': ['https://i.hi-tech.md/31200/31120-p.webp'],
  'be-quiet-pure-rock-2': ['https://i.hi-tech.md/36400/36356-p.webp'],
}

// ИЗОБРАЖЕНИЯ КАТЕГОРИЙ (fallback для товаров без своих изображений)
// Ключ — slug категории, значение — массив URL
// Пример:
// smartphones: ['https://example.com/category-phone.jpg'],
const categoryImagesBySlug: Record<string, string[]> = {}

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
const productsData: Array<[
  string,
  string,
  string,
  number,
  number,
  string,
  string,
  Record<string, string>,
]> = [
  // Процессоры
  ['AMD Ryzen 5 5600X', 'amd-ryzen-5-5600x', 'Процессор AMD Ryzen 5 5600X с 6 ядрами и 12 потоками, базовая частота 3.7 ГГц, turbo до 4.6 ГГц', 4299, 15, 'processory', 'amd', {
    'Количество ядер': '6',
    'Количество потоков': '12',
    'Базовая частота': '3.7 ГГц',
    'Turbo частота': '4.6 ГГц',
    'Сокет': 'AM4',
    'TDP': '65 Вт',
  }],
  ['Intel Core i5-12400F', 'intel-core-i5-12400f', 'Процессор Intel Core i5-12400F 12-го поколения, 6 ядер, 12 потоков, до 4.4 ГГц', 3850, 20, 'processory', 'intel', {
    'Количество ядер': '6',
    'Количество потоков': '12',
    'Базовая частота': '2.5 ГГц',
    'Turbo частота': '4.4 ГГц',
    'Сокет': 'LGA1700',
    'TDP': '65 Вт',
  }],
  ['AMD Ryzen 7 5800X3D', 'amd-ryzen-7-5800x3d', 'Процессор AMD Ryzen 7 5800X3D с технологией 3D V-Cache для максимальной производительности в играх', 8990, 8, 'processory', 'amd', {
    'Количество ядер': '8',
    'Количество потоков': '16',
    'Базовая частота': '3.4 ГГц',
    'Turbo частота': '4.5 ГГц',
    'Сокет': 'AM4',
    'TDP': '105 Вт',
  }],

  // SSD Накопители
  ['Kingston NV2 500GB', 'kingston-nv2-500gb', 'SSD накопитель Kingston NV2 объемом 500GB с интерфейсом M.2 NVMe PCIe 4.0', 1299, 35, 'ssd-nakopiteli', 'kingston', {
    'Объем': '500 ГБ',
    'Интерфейс': 'M.2 NVMe PCIe 4.0',
    'Скорость чтения': '3500 МБ/с',
    'Скорость записи': '2100 МБ/с',
    'Форм-фактор': 'M.2 2280',
  }],

  // Видеокарты
  ['NVIDIA GeForce RTX 4060 Ti', 'nvidia-geforce-rtx-4060-ti-8gb', 'Видеокарта NVIDIA GeForce RTX 4060 Ti 8GB GDDR6 для игр в высоком разрешении', 12990, 12, 'videokarty', 'nvidia', {
    'Объем памяти': '8 ГБ',
    'Тип памяти': 'GDDR6',
    'Частота GPU': '2535 МГц',
    'Интерфейс': 'PCI-E 4.0',
    'Разъемы': 'HDMI 2.1, DisplayPort 1.4a',
  }],
  ['ASUS ROG Strix RX 7800 XT', 'asus-rog-strix-rx-7800-xt', 'Видеокарта ASUS ROG Strix Radeon RX 7800 XT 16GB с улучшенной системой охлаждения', 15490, 7, 'videokarty', 'asus', {
    'Объем памяти': '16 ГБ',
    'Тип памяти': 'GDDR6',
    'Частота GPU': '2565 МГц',
    'Интерфейс': 'PCI-E 4.0',
    'Разъемы': 'HDMI 2.1, DisplayPort 2.1',
  }],

  // Материнские платы
  ['MSI B550-A PRO', 'msi-b550-a-pro', 'Материнская плата MSI B550-A PRO, сокет AM4, чипсет AMD B550', 3299, 18, 'materinskie-platy', 'msi', {
    'Сокет': 'AM4',
    'Чипсет': 'AMD B550',
    'Форм-фактор': 'ATX',
    'Слоты памяти': '4 x DDR4',
    'Максимум памяти': '128 ГБ',
  }],

  // Оперативная память
  ['Kingston Fury Beast 16GB DDR4', 'kingston-fury-beast-16gb-ddr4-3200', 'Модуль памяти Kingston Fury Beast 16GB DDR4 3200MHz CL16', 1590, 40, 'moduli-pamyati', 'kingston', {
    'Объем': '16 ГБ',
    'Тип памяти': 'DDR4',
    'Частота': '3200 МГц',
    'Тайминги': 'CL16',
    'Количество модулей': '1 x 16 ГБ',
  }],
  ['Corsair Vengeance RGB 32GB DDR5', 'corsair-vengeance-rgb-32gb-ddr5-6000', 'Комплект памяти Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz с RGB подсветкой', 4290, 22, 'moduli-pamyati', 'corsair', {
    'Объем': '32 ГБ',
    'Тип памяти': 'DDR5',
    'Частота': '6000 МГц',
    'Тайминги': 'CL36',
    'Количество модулей': '2 x 16 ГБ',
  }],

  // Блоки питания
  ['Corsair RM750e 750W', 'corsair-rm750e-750w-80-plus-gold', 'Блок питания Corsair RM750e 750W 80 PLUS Gold, полностью модульный', 2990, 25, 'bloki-pitaniya', 'corsair', {
    'Мощность': '750 Вт',
    'Сертификат': '80 PLUS Gold',
    'Модульный': 'Да',
    'Вентилятор': '135 мм',
    'PFC': 'Активный',
  }],

  // Корпуса
  ['Cooler Master MasterBox Q300L', 'cooler-master-masterbox-q300l', 'Компактный корпус Cooler Master MasterBox Q300L формата Micro-ATX с прозрачной боковой панелью', 1690, 14, 'korpusa', 'cooler-master', {
    'Форм-фактор': 'Micro-ATX',
    'Боковая панель': 'Прозрачная',
    'Вентиляторы': '1 x 120 мм',
    'Цвет': 'Черный',
  }],

  // Системы охлаждения
  ['Be Quiet! Pure Rock 2', 'be-quiet-pure-rock-2', 'Процессорный кулер Be Quiet! Pure Rock 2 с тихой работой и эффективным охлаждением', 1190, 30, 'sistemy-ohlazhdeniya', 'be-quiet', {
    'Тип': 'Башенный кулер',
    'Сокеты': 'AM4, LGA1700, LGA1200',
    'Вентилятор': '120 мм',
    'Уровень шума': '26.8 дБ',
    'TDP': '150 Вт',
  }],
]

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
    ['amd-ryzen-5-5600x', 0, 5, 'Отличный процессор за свои деньги. Справляется со всеми задачами, температуры в норме.'],
    ['intel-core-i5-12400f', 1, 5, 'Мощный процессор для игр и работы. Цена-качество на высоте.'],
    ['amd-ryzen-7-5800x3d', 2, 5, 'Лучший процессор для игр на AM4. 3D V-Cache реально работает, FPS выше чем у обычных моделей.'],
    ['kingston-nv2-500gb', 0, 4, 'Быстрый SSD для системы. Загрузка Windows за секунды, программы открываются моментально.'],
    ['nvidia-geforce-rtx-4060-ti-8gb', 1, 5, 'Отличная карта для 1080p и 1440p. Все игры на ультра настройках идут плавно.'],
    ['asus-rog-strix-rx-7800-xt', 2, 5, 'Мощная видеокарта, охлаждение справляется отлично. Тихая даже под нагрузкой.'],
    ['msi-b550-a-pro', 0, 4, 'Надежная материнка с хорошим функционалом. Подходит для сборки среднего уровня.'],
    ['kingston-fury-beast-16gb-ddr4-3200', 1, 5, 'Стабильная память, работает на заявленной частоте без проблем.'],
    ['corsair-vengeance-rgb-32gb-ddr5-6000', 2, 5, 'Быстрая память с красивой RGB подсветкой. Отлично разгоняется.'],
    ['corsair-rm750e-750w-80-plus-gold', 0, 5, 'Качественный блок питания, тихий и надежный. Модульные кабели - удобно для сборки.'],
    ['cooler-master-masterbox-q300l', 1, 4, 'Компактный корпус с хорошей вентиляцией. Качество материалов отличное.'],
    ['be-quiet-pure-rock-2', 2, 5, 'Очень тихий кулер, полностью оправдывает название бренда. Охлаждение эффективное.'],
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

  const ordersData: Array<{
    userIndex: number
    productSlugs: string[]
    status: OrderStatus
    recipientName: string
    address: string
    phone: string
    comment?: string
  }> = [
    {
      userIndex: 0,
      productSlugs: ['amd-ryzen-5-5600x', 'msi-b550-a-pro', 'kingston-fury-beast-16gb-ddr4-3200'],
      status: 'DELIVERED',
      recipientName: 'Иван Петров',
      address: 'г. Кишинев, ул. Штефан чел Маре 124, кв. 45',
      phone: '+37360000001',
      comment: 'Позвонить за час до доставки',
    },
    {
      userIndex: 1,
      productSlugs: ['intel-core-i5-12400f', 'corsair-rm750e-750w-80-plus-gold'],
      status: 'SHIPPED',
      recipientName: 'Анна Смирнова',
      address: 'г. Кишинев, бул. Дачия 25, офис 12',
      phone: '+37360000002',
    },
    {
      userIndex: 2,
      productSlugs: ['nvidia-geforce-rtx-4060-ti-8gb', 'be-quiet-pure-rock-2'],
      status: 'PROCESSING',
      recipientName: 'Дмитрий Коваленко',
      address: 'г. Кишинев, ул. Алба Юлия 78, кв. 12',
      phone: '+37360000003',
      comment: 'Оставить у консьержа',
    },
    {
      userIndex: 0,
      productSlugs: ['kingston-nv2-500gb', 'cooler-master-masterbox-q300l'],
      status: 'CONFIRMED',
      recipientName: 'Иван Петров',
      address: 'г. Кишинев, ул. Штефан чел Маре 124, кв. 45',
      phone: '+37360000001',
    },
    {
      userIndex: 1,
      productSlugs: ['corsair-vengeance-rgb-32gb-ddr5-6000', 'asus-rog-strix-rx-7800-xt'],
      status: 'NEW',
      recipientName: 'Анна Смирнова',
      address: 'г. Кишинев, бул. Дачия 25, офис 12',
      phone: '+37360000002',
      comment: 'Доставка в рабочее время 9-18',
    },
  ]

  for (const orderData of ordersData) {
    const user = reviewUsers[orderData.userIndex]
    if (!user) continue

    const orderItems: Array<{ productId: string; quantity: number; price: number }> = []
    let subtotal = 0

    for (const productSlug of orderData.productSlugs) {
      const product = productBySlug.get(productSlug)
      if (!product) continue

      const productFull = await prisma.product.findUnique({
        where: { id: product.id },
        select: { price: true },
      })
      if (!productFull) continue

      const price = Number(productFull.price)
      orderItems.push({
        productId: product.id,
        quantity: 1,
        price,
      })
      subtotal += price
    }

    if (orderItems.length === 0) continue

    const total = subtotal

    await prisma.order.create({
      data: {
        userId: user.id,
        status: orderData.status,
        subtotal,
        total,
        recipientName: orderData.recipientName,
        address: orderData.address,
        phone: orderData.phone,
        comment: orderData.comment,
        items: {
          create: orderItems,
        },
      },
    })
  }

  console.log(`Seed completed: ${categoriesData.length} categories, ${brandsData.length} brands, ${productsData.length} products, 4 promo codes, ${reviewsData.length} reviews, ${ordersData.length} orders, admin ${adminUser.phone}`)
}

seedDatabase()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
