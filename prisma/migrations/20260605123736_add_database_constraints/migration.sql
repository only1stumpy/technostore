-- Add database constraints for data integrity

-- Product constraints: price and stock must be non-negative
ALTER TABLE "Product" ADD CONSTRAINT "chk_product_price" CHECK (price >= 0);
ALTER TABLE "Product" ADD CONSTRAINT "chk_product_stock" CHECK (stock >= 0);

-- Review constraint: rating must be between 1 and 5
ALTER TABLE "Review" ADD CONSTRAINT "chk_review_rating" CHECK (rating >= 1 AND rating <= 5);

-- PromoCode constraints: value and usedCount must be non-negative
ALTER TABLE "PromoCode" ADD CONSTRAINT "chk_promo_value" CHECK (value >= 0);
ALTER TABLE "PromoCode" ADD CONSTRAINT "chk_promo_used_count" CHECK ("usedCount" >= 0);
