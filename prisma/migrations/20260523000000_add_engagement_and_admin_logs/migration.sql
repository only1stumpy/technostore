CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PromoCodeType" AS ENUM ('PERCENT', 'FIXED');

ALTER TABLE "Order" ADD COLUMN "subtotal" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
UPDATE "Order" SET "subtotal" = "total" WHERE "subtotal" IS NULL;
ALTER TABLE "Order" ALTER COLUMN "subtotal" SET NOT NULL;

CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductComparison" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductComparison_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "orderItemId" TEXT,
  "rating" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "type" "PromoCodeType" NOT NULL,
  "value" DECIMAL(10,2) NOT NULL,
  "minOrderTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "startsAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderPromoCode" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "promoCodeId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountAmount" DECIMAL(10,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderPromoCode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminActionLog" (
  "id" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminActionLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX "Favorite_productId_idx" ON "Favorite"("productId");

CREATE UNIQUE INDEX "ProductComparison_userId_productId_key" ON "ProductComparison"("userId", "productId");
CREATE INDEX "ProductComparison_userId_idx" ON "ProductComparison"("userId");
CREATE INDEX "ProductComparison_productId_idx" ON "ProductComparison"("productId");

CREATE UNIQUE INDEX "Review_orderItemId_key" ON "Review"("orderItemId");
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Review_status_idx" ON "Review"("status");
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");
CREATE INDEX "PromoCode_code_idx" ON "PromoCode"("code");
CREATE INDEX "PromoCode_isActive_idx" ON "PromoCode"("isActive");
CREATE INDEX "PromoCode_expiresAt_idx" ON "PromoCode"("expiresAt");

CREATE UNIQUE INDEX "OrderPromoCode_orderId_key" ON "OrderPromoCode"("orderId");
CREATE INDEX "OrderPromoCode_promoCodeId_idx" ON "OrderPromoCode"("promoCodeId");

CREATE INDEX "AdminActionLog_adminId_idx" ON "AdminActionLog"("adminId");
CREATE INDEX "AdminActionLog_action_idx" ON "AdminActionLog"("action");
CREATE INDEX "AdminActionLog_entityType_idx" ON "AdminActionLog"("entityType");
CREATE INDEX "AdminActionLog_createdAt_idx" ON "AdminActionLog"("createdAt");

ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductComparison" ADD CONSTRAINT "ProductComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductComparison" ADD CONSTRAINT "ProductComparison_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderPromoCode" ADD CONSTRAINT "OrderPromoCode_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderPromoCode" ADD CONSTRAINT "OrderPromoCode_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminActionLog" ADD CONSTRAINT "AdminActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
