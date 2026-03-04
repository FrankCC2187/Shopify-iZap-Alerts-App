-- CreateTable
CREATE TABLE "Threshold" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "threshold" INTEGER NOT NULL DEFAULT 10
);
