# TechnoStore
Next.js 15 App Router · TypeScript · Tailwind v4 · Zustand · Prisma · Vercel Postgres · Upstash Redis · Bun

Docs: docs/development-plan.md, docs/README.md

## Git
Запрещено: commit, push, pull requests. Разрешено: status, diff, log.

## Агенты
- Backend/API/БД → backend-architect
- Frontend/компоненты → frontend-developer
- UI/UX → ui-ux-designer
- После каждой фичи → code-reviewer
- Любая ошибка → debugger, стоп, фикс, продолжить

Порядок: architect → implement → code-reviewer

## Проект
Auth: телефон + SMS · JWT в httpOnly cookie · mock в dev
Корзина: только авторизованные · хранится в БД
Каталог: фильтры слева · 4/2/1 колонки
Оплата: наличные при получении
Админка: CRUD товаров/категорий/брендов · заказы · просмотр юзеров

## Структура
/app/(auth) /app/(shop) /app/admin /app/api
/components /lib /services /types /prisma

## Code Style
Без комментариев · без лишних абстракций · валидация только на API · редактировать существующие файлы · следовать паттернам кодовой базы

@AGENTS.md