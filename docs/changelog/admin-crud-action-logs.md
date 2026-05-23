# Логирование административного CRUD

## Функциональные изменения

- Создание, редактирование и удаление товаров фиксируются в журнале действий администратора.
- Создание, редактирование и удаление категорий фиксируются в журнале действий администратора.
- Создание, редактирование и удаление брендов фиксируются в журнале действий администратора.
- В журнале для изменений сохраняются основные данные сущности и, при обновлении, значения до и после изменения.

## Технические изменения

- `logAdminAction` подключен к admin routes товаров, категорий и брендов.
- `POST /api/admin/products` пишет действие `product.create`.
- `PATCH /api/admin/products/[id]` пишет действие `product.update` с metadata `from` и `to`.
- `DELETE /api/admin/products/[id]` пишет действие `product.delete` после soft delete.
- `POST /api/admin/categories` пишет действие `category.create`.
- `PATCH /api/admin/categories/[id]` пишет действие `category.update` с metadata `from` и `to`.
- `DELETE /api/admin/categories/[id]` пишет действие `category.delete` после soft delete.
- `POST /api/admin/brands` пишет действие `brand.create`.
- `PATCH /api/admin/brands/[id]` пишет действие `brand.update` с metadata `from` и `to`.
- `DELETE /api/admin/brands/[id]` пишет действие `brand.delete` после soft delete.
