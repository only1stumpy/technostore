# План разработки TechnoStore

## Контекст

Разрабатываем полнофункциональный интернет-магазин электроники с нуля. Уже выполнено:
- ✅ Создана Prisma схема БД (User, Product, Category, Brand, Cart, Order)
- ✅ Настроен SMS сервис (mock/messaggio/budgetsms)
- ✅ Создана уникальная цветовая схема (фиолетовый + коралловый)
- ✅ Настроен Tailwind CSS v4
- ✅ Созданы папки для роутов (auth, shop, admin, api)

**Что нужно построить:** Полное приложение от авторизации до оформления заказов и админ-панели.

---

## Архитектура разработки

### Фазы разработки (последовательно)

#### **Фаза 1: Фундамент (Foundation)** ✅
Базовые компоненты, утилиты, middleware, которые нужны всем остальным частям.

**1.1 Базовые UI компоненты** (`components/ui/`)
- Button (primary, secondary, accent, destructive варианты)
- Input (text, tel, number)
- Card
- Badge (для статусов, наличия)
- Spinner/Loader
- Modal/Dialog
- Toast (уведомления)

**1.2 Layout компоненты** (`components/layout/`)
- Header (навигация, поиск, корзина, профиль)
- Footer
- Container (обертка с max-width)
- Sidebar (для фильтров в каталоге)

**1.3 Утилиты и хелперы** (`lib/`)
- `auth.ts` - JWT создание/проверка, middleware для защищенных роутов
- `redis.ts` - Upstash Redis клиент для кэширования
- `utils.ts` - форматирование цен, дат, валидация телефонов
- `constants.ts` - константы (статусы заказов, роли)

**1.4 Типы** (`types/`)
- `auth.ts` - типы для JWT payload, session
- `api.ts` - типы для API responses
- `product.ts` - расширенные типы для продуктов с фильтрами

**Результат фазы 1:** Готовая база для быстрой разработки фич.

---

#### **Фаза 2: Аутентификация (Auth)** ✅
Регистрация и вход через телефон + SMS код.

**2.1 API Routes** (`app/api/auth/`)
- `POST /api/auth/send-code` - отправка SMS кода
  - Генерация 6-значного кода
  - Сохранение в Redis (TTL 10 минут)
  - Отправка через smsService
- `POST /api/auth/verify-code` - проверка кода и создание сессии
  - Проверка кода из Redis
  - Создание/обновление User в БД
  - Генерация JWT токена
  - Установка HTTP-only cookie
- `POST /api/auth/logout` - выход (очистка cookie)
- `GET /api/auth/me` - получение текущего пользователя

**2.2 Страницы** (`app/(auth)/`)
- `/login` - форма входа (телефон → код → вход)
- `/register` - форма регистрации (телефон → код → имя → регистрация)

**2.3 Middleware**
- `middleware.ts` в корне - защита роутов `/admin/*`, `/api/cart/*`, `/api/orders/*`

**Результат фазы 2:** Работающая авторизация, можно создавать пользователей.

---

#### **Фаза 3: Каталог товаров (Catalog)** ✅
Публичные страницы для просмотра товаров.

**3.1 API Routes** (`app/api/products/`)
- `GET /api/products` - список товаров с фильтрами, пагинацией, сортировкой
  - Query params: category, brand, minPrice, maxPrice, inStock, search, sort, page, limit
  - Кэширование в Redis (5 минут)
- `GET /api/products/[id]` - детали товара
- `GET /api/categories` - список категорий
- `GET /api/brands` - список брендов

**3.2 Страницы** (`app/(shop)/`)
- `/` - главная страница (featured товары, категории)
- `/catalog` - каталог с фильтрами и сортировкой
- `/product/[id]` - карточка товара (галерея, характеристики, "В корзину")
- `/category/[slug]` - товары категории

**3.3 Компоненты** (`components/product/`)
- ProductCard - карточка товара в сетке
- ProductGrid - сетка товаров (4 колонки desktop, 2-3 tablet, 1-2 mobile)
- ProductFilters - боковая панель фильтров
- ProductGallery - галерея изображений товара
- ProductSpecs - таблица характеристик

**Результат фазы 3:** Пользователи могут просматривать товары, фильтровать, искать. ✅

---

#### **Фаза 4: Корзина (Cart)**
Добавление товаров в корзину, управление количеством.

**4.1 API Routes** (`app/api/cart/`)
- `GET /api/cart` - получить корзину текущего пользователя
- `POST /api/cart/items` - добавить товар в корзину
- `PATCH /api/cart/items/[id]` - изменить количество
- `DELETE /api/cart/items/[id]` - удалить товар из корзины
- `DELETE /api/cart` - очистить корзину

**4.2 Страницы** (`app/(shop)/`)
- `/cart` - страница корзины (список товаров, итого, кнопка "Оформить заказ")

**4.3 Компоненты** (`components/cart/`)
- CartItem - строка товара в корзине (фото, название, цена, количество, удалить)
- CartSummary - итоговая сумма, кнопка оформления
- CartIcon - иконка корзины в хедере с количеством товаров

**4.4 State Management** (`store/`)
- `cartStore.ts` (Zustand) - клиентский стейт для количества товаров в корзине

**Результат фазы 4:** Пользователи могут добавлять товары в корзину.

---

#### **Фаза 5: Оформление заказа (Checkout)**
Создание заказа, указание адреса доставки.

**5.1 API Routes** (`app/api/orders/`)
- `POST /api/orders` - создать заказ из корзины
  - Валидация корзины (наличие товаров, stock)
  - Создание Order + OrderItems
  - Уменьшение stock товаров
  - Очистка корзины
- `GET /api/orders` - список заказов пользователя
- `GET /api/orders/[id]` - детали заказа

**5.2 Страницы** (`app/(shop)/`)
- `/checkout` - форма оформления заказа (адрес, телефон, комментарий)
- `/orders` - история заказов пользователя
- `/orders/[id]` - детали заказа (статус, товары, адрес)

**5.3 Компоненты** (`components/order/`)
- CheckoutForm - форма с адресом, телефоном, комментарием
- OrderCard - карточка заказа в списке
- OrderStatus - бейдж со статусом заказа
- OrderItems - список товаров в заказе

**Результат фазы 5:** Пользователи могут оформлять заказы.

---

#### **Фаза 6: Админ-панель (Admin)**
CRUD для товаров, категорий, брендов, управление заказами.

**6.1 API Routes** (`app/api/admin/`)
- `POST /api/admin/products` - создать товар
- `PATCH /api/admin/products/[id]` - обновить товар
- `DELETE /api/admin/products/[id]` - удалить товар (soft delete)
- `POST /api/admin/categories` - создать категорию
- `PATCH /api/admin/categories/[id]` - обновить категорию
- `DELETE /api/admin/categories/[id]` - удалить категорию
- `POST /api/admin/brands` - создать бренд
- `PATCH /api/admin/brands/[id]` - обновить бренд
- `DELETE /api/admin/brands/[id]` - удалить бренд
- `GET /api/admin/orders` - все заказы с фильтрами
- `PATCH /api/admin/orders/[id]` - изменить статус заказа
- `GET /api/admin/users` - список пользователей

**6.2 Страницы** (`app/admin/`)
- `/admin` - дашборд (статистика: кол-во товаров, заказов, пользователей)
- `/admin/products` - список товаров, кнопка "Добавить"
- `/admin/products/new` - форма создания товара
- `/admin/products/[id]/edit` - форма редактирования товара
- `/admin/categories` - CRUD категорий
- `/admin/brands` - CRUD брендов
- `/admin/orders` - список заказов, фильтры по статусу
- `/admin/orders/[id]` - детали заказа, смена статуса
- `/admin/users` - список пользователей (только просмотр)

**6.3 Компоненты** (`components/admin/`)
- AdminLayout - layout с боковым меню навигации
- ProductForm - форма создания/редактирования товара
- CategoryForm - форма категории
- BrandForm - форма бренда
- OrderStatusSelect - селект для смены статуса заказа
- DataTable - переиспользуемая таблица с сортировкой

**6.4 Middleware**
- Проверка роли ADMIN для всех `/admin/*` роутов

**Результат фазы 6:** Админ может управлять товарами, категориями, брендами, заказами.

---

#### **Фаза 7: Поиск и оптимизация (Search & Optimization)**
Улучшение UX, производительность, SEO.

**7.1 Поиск**
- Полнотекстовый поиск по товарам (Prisma fulltext или простой LIKE)
- Автокомплит в хедере
- Страница результатов поиска `/search?q=...`

**7.2 Кэширование**
- Redis кэш для списка товаров (5 мин)
- Redis кэш для категорий/брендов (30 мин)
- Инвалидация кэша при изменении товаров в админке

**7.3 Оптимизация изображений**
- Next.js Image компонент для всех картинок
- Lazy loading для галереи товаров

**7.4 SEO**
- Metadata для всех страниц
- Open Graph теги
- Sitemap

**Результат фазы 7:** Быстрое, оптимизированное приложение с хорошим SEO.

---

## Порядок реализации

### Рекомендуемая последовательность:

1. **Фаза 1** (Foundation) - 1-2 дня
2. **Фаза 2** (Auth) - 1 день
3. **Фаза 3** (Catalog) - 2-3 дня
4. **Фаза 4** (Cart) - 1 день
5. **Фаза 5** (Checkout) - 1-2 дня
6. **Фаза 6** (Admin) - 2-3 дня
7. **Фаза 7** (Search & Optimization) - 1-2 дня

**Итого:** 9-14 дней активной разработки.

---

## Технические детали

### Структура папок (финальная)

```
/app
  /(auth)
    /login
    /register
  /(shop)
    /page.tsx (главная)
    /catalog
    /product/[id]
    /category/[slug]
    /cart
    /checkout
    /orders
    /orders/[id]
  /admin
    /page.tsx (дашборд)
    /products
    /categories
    /brands
    /orders
    /users
  /api
    /auth
    /products
    /categories
    /brands
    /cart
    /orders
    /admin

/components
  /ui (Button, Input, Card, Badge, Modal, Toast, Spinner)
  /layout (Header, Footer, Container, Sidebar)
  /product (ProductCard, ProductGrid, ProductFilters, ProductGallery, ProductSpecs)
  /cart (CartItem, CartSummary, CartIcon)
  /order (CheckoutForm, OrderCard, OrderStatus, OrderItems)
  /admin (AdminLayout, ProductForm, CategoryForm, BrandForm, DataTable)

/lib
  /prisma.ts (уже есть)
  /auth.ts (JWT, middleware)
  /redis.ts (Upstash клиент)
  /utils.ts (форматирование, валидация)
  /constants.ts

/types
  /sms.ts (уже есть)
  /auth.ts
  /api.ts
  /product.ts

/services
  /sms (уже есть)

/store
  /cartStore.ts (Zustand)

/middleware.ts (защита роутов)
```

### Зависимости для установки

```bash
bun add zustand jose @upstash/redis zod
bun add -d @types/jsonwebtoken
```

- `zustand` - state management для корзины
- `jose` - JWT для Next.js (edge-compatible)
- `@upstash/redis` - Redis клиент
- `zod` - валидация данных

### База данных

**Перед началом:**
1. Создать Vercel Postgres БД
2. Обновить `DATABASE_URL` в `.env`
3. Запустить миграции: `bunx prisma migrate dev --name init`
4. Сгенерировать Prisma Client: `bunx prisma generate`

**Seed данных (опционально):**
Создать `prisma/seed.ts` с тестовыми данными:
- 3-5 категорий (Ноутбуки, Смартфоны, Планшеты, Аксессуары)
- 5-10 брендов (Apple, Samsung, Lenovo, HP, Xiaomi)
- 20-30 товаров
- 1 админ пользователь

---

## Проверка (Verification)

После каждой фазы:

### Фаза 1 (Foundation)
- [ ] Все UI компоненты рендерятся корректно
- [ ] Layout компоненты работают на всех разрешениях
- [ ] Утилиты экспортируются и используются

### Фаза 2 (Auth)
- [ ] Можно зарегистрироваться через телефон
- [ ] SMS код приходит (в консоль в dev режиме)
- [ ] После ввода кода создается пользователь и устанавливается cookie
- [ ] Можно войти с существующим номером
- [ ] Защищенные роуты редиректят на /login

### Фаза 3 (Catalog)
- [ ] Главная страница показывает товары
- [ ] Каталог работает с фильтрами (категория, бренд, цена)
- [ ] Карточка товара показывает галерею, характеристики
- [ ] Поиск находит товары по названию

### Фаза 4 (Cart)
- [ ] Можно добавить товар в корзину
- [ ] Количество товаров в корзине отображается в хедере
- [ ] Можно изменить количество и удалить товар
- [ ] Итоговая сумма считается правильно

### Фаза 5 (Checkout)
- [ ] Форма оформления заказа валидирует данные
- [ ] Заказ создается с правильными товарами и суммой
- [ ] Stock товаров уменьшается
- [ ] Корзина очищается после заказа
- [ ] Заказ отображается в истории

### Фаза 6 (Admin)
- [ ] Админ может создать/редактировать/удалить товар
- [ ] Админ может управлять категориями и брендами
- [ ] Админ видит все заказы и может менять статусы
- [ ] Обычный пользователь не может попасть в /admin

### Фаза 7 (Search & Optimization)
- [ ] Поиск работает быстро
- [ ] Кэш инвалидируется при изменениях
- [ ] Изображения загружаются оптимизированно
- [ ] Lighthouse score > 90

---