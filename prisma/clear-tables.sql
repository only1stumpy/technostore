-- Очистка содержимого таблиц
-- Порядок важен из-за внешних ключей

-- Сначала удаляем зависимые записи
DELETE FROM "Review";
DELETE FROM "ProductComparison";
DELETE FROM "Favorite";
DELETE FROM "OrderItem";
DELETE FROM "Order";

-- Затем основные таблицы
DELETE FROM "Product";
DELETE FROM "Category";
DELETE FROM "Brand";
