import 'dotenv/config'
import { prisma } from '../lib/prisma'

const categoriesData = [
  { name: 'Ноутбуки', slug: 'laptops' },
  { name: 'Смартфоны', slug: 'smartphones' },
  { name: 'Планшеты', slug: 'tablets' },
  { name: 'Аксессуары', slug: 'accessories' },
  { name: 'Мониторы', slug: 'monitors' },
  { name: 'Комплектующие', slug: 'components' },
]

const brandsData = [
  { name: 'Apple', slug: 'apple', logo: '/logos/apple.png' },
  { name: 'Samsung', slug: 'samsung', logo: '/logos/samsung.png' },
  { name: 'Lenovo', slug: 'lenovo', logo: '/logos/lenovo.png' },
  { name: 'HP', slug: 'hp', logo: '/logos/hp.png' },
  { name: 'Xiaomi', slug: 'xiaomi', logo: '/logos/xiaomi.png' },
  { name: 'ASUS', slug: 'asus', logo: '/logos/asus.png' },
  { name: 'Dell', slug: 'dell', logo: '/logos/dell.png' },
  { name: 'BlackView', slug: 'blackview', logo: '/logos/blackview.png' },
  { name: 'PocketBook', slug: 'pocketbook', logo: '/logos/pocketbook.png' },
  { name: 'Gembird', slug: 'gembird', logo: '/logos/gembird.png' },
  { name: 'Xilence', slug: 'xilence', logo: '/logos/xilence.png' },
  { name: 'be quiet!', slug: 'be-quiet', logo: '/logos/be-quiet.png' },
  { name: 'Arctic', slug: 'arctic', logo: '/logos/arctic.png' },
  { name: 'Spire', slug: 'spire', logo: '/logos/spire.png' },
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
  ['BlackView TAB50 Wi-Fi 4/128GB Space Grey', 'blackview-tab50-wi-fi-4-128gb-grey', 'Компактный планшет BlackView с HD-экраном и 128 ГБ памяти.', 1899, 18, 'tablets', 'blackview', ['8″ HD', 'Rockchip', '4 ГБ RAM', '128 ГБ']],
  ['BlackView Link2 Wi-Fi + 4G 4/128GB Black', 'blackview-link2-4g-4-128gb-black', 'Планшет BlackView с поддержкой 4G для учебы, видео и поездок.', 1899, 16, 'tablets', 'blackview', ['8.68″ WXGA', 'UniSOC', '4 ГБ RAM', '128 ГБ']],
  ['Lenovo TAB One TB305FU 4/64GB Luna Grey', 'lenovo-tab-one-tb305fu-4-64gb-grey', 'Легкий планшет Lenovo TAB One с чехлом в комплекте.', 1999, 20, 'tablets', 'lenovo', ['8.7″ WXGA', 'MediaTek', '4 ГБ RAM', '64 ГБ']],
  ['BlackView TAB60 Pro LTE 4/128GB Blue', 'blackview-tab60-pro-lte-4-128gb-blue', 'Планшет BlackView TAB60 Pro с большим экраном и мобильным интернетом.', 2239, 14, 'tablets', 'blackview', ['10.1″ HD', 'UniSOC', '4 ГБ RAM', '128 ГБ']],
  ['PocketBook 619 Verse Lite Midnight Grey', 'pocketbook-619-verse-lite-grey', 'Электронная книга PocketBook с компактным экраном для чтения каждый день.', 2699, 12, 'tablets', 'pocketbook', ['6″ E Ink', '1024×758', '512 МБ RAM', '8 ГБ']],
  ['Lenovo TAB TB311FU Wi-Fi 4/64GB Gray', 'lenovo-tab-tb311fu-4-64gb-gray', 'Планшет Lenovo TAB с WUXGA-дисплеем и защитным чехлом.', 2849, 15, 'tablets', 'lenovo', ['10.1″ WUXGA', 'MediaTek', '4 ГБ RAM', '64 ГБ']],
  ['PocketBook 629 Verse Bright Blue', 'pocketbook-629-verse-bright-blue', 'Электронная книга PocketBook Verse с подсветкой и 8 ГБ памяти.', 2899, 10, 'tablets', 'pocketbook', ['6″ E Ink', '1024×758', '512 МБ RAM', '8 ГБ']],
  ['Samsung Galaxy Tab A11 8.7 Wi-Fi 4/64GB Gray', 'samsung-galaxy-tab-a11-87-wi-fi-4-64gb-gray', 'Компактный планшет Samsung Galaxy Tab A11 для учебы и развлечений.', 3299, 17, 'tablets', 'samsung', ['8.7″ WXGA', '90 Гц', '4 ГБ RAM', '64 ГБ']],
  ['Samsung Galaxy Tab A9+ 11 Wi-Fi 8/256GB Graphite', 'samsung-galaxy-tab-a9-plus-11-wi-fi-8-256gb', 'Планшет Samsung Galaxy Tab A9+ с большим экраном и 256 ГБ памяти.', 4899, 9, 'tablets', 'samsung', ['11″ FHD', 'Qualcomm', '8 ГБ RAM', '256 ГБ']],
  ['Gembird TG-P-01 Thermal Pad 100x100x1mm', 'gembird-tg-p-01-thermal-pad', 'Термопрокладка Gembird для охлаждения компонентов ПК.', 35, 80, 'components', 'gembird', ['100×100×1 мм', 'для CPU/GPU', 'теплопроводящая прокладка', 'универсальная']],
  ['Gembird TG-G3.0-01 Thermal Paste 3g', 'gembird-tg-g30-thermal-paste-3g', 'Термопаста Gembird для процессоров и видеокарт.', 45, 90, 'components', 'gembird', ['3 г', 'для CPU/GPU', 'шприц', 'серый состав']],
  ['Xilence LGA1700 Air Cooler Mount Kit XZ175', 'xilence-lga1700-air-cooler-mount-kit-xz175', 'Комплект креплений Xilence для установки воздушного кулера на LGA1700.', 49, 35, 'components', 'xilence', ['LGA1700', 'для воздушных кулеров', 'монтажный комплект', 'XZ175']],
  ['Gembird Fancase3 120mm Case Fan', 'gembird-fancase3-120mm-case-fan', 'Корпусной вентилятор Gembird для базового охлаждения системного блока.', 69, 60, 'components', 'gembird', ['120×120×25 мм', 'корпусной', 'тихая работа', '3-pin']],
  ['Xilence XPF80.R.PWM Case Fan', 'xilence-xpf80-r-pwm-case-fan', 'Компактный PWM-вентилятор Xilence для корпуса ПК.', 79, 50, 'components', 'xilence', ['80 мм', 'PWM', 'корпусной', 'XF040']],
  ['Xilence XPF120.R.PWM Case Fan', 'xilence-xpf120-r-pwm-case-fan', '120-мм корпусной вентилятор Xilence с PWM-управлением.', 99, 48, 'components', 'xilence', ['120 мм', 'PWM', 'корпусной', 'XF042']],
  ['Gembird Virtus Plus USB Sound Card', 'gembird-virtus-plus-usb-sound-card', 'Внешняя USB-звуковая карта Gembird для наушников и микрофона.', 129, 30, 'components', 'gembird', ['USB', 'аудиовыход', 'микрофонный вход', 'SC-USB2.0-01']],
  ['be quiet! DC2 Thermal Paste 3g', 'be-quiet-dc2-thermal-paste-3g', 'Термопаста be quiet! DC2 для эффективного охлаждения процессора.', 129, 42, 'components', 'be-quiet', ['3 г', 'для CPU/GPU', 'шприц', 'BZ004']],
  ['Spire 420W OEM ATX Power Supply', 'spire-420w-oem-atx-power-supply', 'Блок питания Spire 420W для офисных и домашних сборок.', 199, 18, 'components', 'spire', ['420 Вт', 'ATX', 'OEM', 'без кабеля']],
  ['Arctic Alpine 17 CPU Cooler', 'arctic-alpine-17-cpu-cooler', 'Процессорный кулер Arctic Alpine 17 для платформ Intel.', 219, 24, 'components', 'arctic', ['Intel', 'низкий профиль', 'активное охлаждение', 'Alpine 17']],
  ['be quiet! Pure Wings 3 120mm Case Fan', 'be-quiet-pure-wings-3-120mm-case-fan', 'Тихий корпусной вентилятор be quiet! Pure Wings 3 для стабильного воздушного потока.', 229, 28, 'components', 'be-quiet', ['120 мм', 'корпусной', 'тихая работа', 'BL106']],
  ['ASUS TUF Gaming TF120 ARGB Case Fan', 'asus-tuf-gaming-tf120-argb-case-fan', 'ARGB-вентилятор ASUS TUF Gaming TF120 для игровых сборок.', 279, 22, 'components', 'asus', ['120 мм', 'ARGB', 'корпусной', 'TUF Gaming']],
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
