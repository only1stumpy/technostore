-- Add CHECK constraint to prevent negative prices
ALTER TABLE "Product" ADD CONSTRAINT "Product_price_check" CHECK (price >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_price_check" CHECK (price >= 0);
