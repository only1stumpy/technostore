UPDATE "Product" SET stock = 0 WHERE stock < 0;

ALTER TABLE "Product" ADD CONSTRAINT "Product_stock_check" CHECK (stock >= 0);
