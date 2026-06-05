-- Add idempotency columns to Order table
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;
ALTER TABLE "Order" ADD COLUMN "inputFingerprint" TEXT;

-- Create unique constraint for userId + idempotencyKey (only when key is not null)
CREATE UNIQUE INDEX "Order_userId_idempotencyKey_key"
ON "Order"("userId", "idempotencyKey")
WHERE "idempotencyKey" IS NOT NULL;

-- Create index for idempotency key lookups
CREATE INDEX "Order_idempotencyKey_idx" ON "Order"("idempotencyKey");
