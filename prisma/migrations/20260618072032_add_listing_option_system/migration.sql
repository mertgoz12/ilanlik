-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN "optionDurationsHours" TEXT;
ALTER TABLE "AppSettings" ADD COLUMN "optionMaxActivePerUser" INTEGER;
ALTER TABLE "AppSettings" ADD COLUMN "optionMaxWeeklyCancellations" INTEGER;

-- CreateTable
CREATE TABLE "ListingOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "endReason" TEXT,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingOption_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ListingOption_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "series" TEXT,
    "year" INTEGER,
    "km" INTEGER,
    "fuelType" TEXT,
    "transmission" TEXT,
    "bodyType" TEXT,
    "color" TEXT,
    "enginePower" TEXT,
    "engineVolume" TEXT,
    "drivetrain" TEXT,
    "vehicleCondition" TEXT,
    "doorCount" TEXT,
    "plateOrigin" TEXT,
    "fromWho" TEXT,
    "exchange" TEXT,
    "warranty" TEXT,
    "vehicleTrimRawSpecs" TEXT,
    "damageStatus" TEXT,
    "damageInfo" TEXT,
    "tramerAmount" REAL,
    "equipment" TEXT,
    "il" TEXT NOT NULL,
    "ilce" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "aiAnalysis" TEXT,
    "aiReportStatus" TEXT,
    "flagResolvedAt" DATETIME,
    "optionStatus" TEXT NOT NULL DEFAULT 'bosta',
    "optionHolderId" TEXT,
    "optionStartAt" DATETIME,
    "optionEndAt" DATETIME,
    "categoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_optionHolderId_fkey" FOREIGN KEY ("optionHolderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("aiAnalysis", "aiReportStatus", "bodyType", "brand", "categoryId", "color", "createdAt", "damageInfo", "damageStatus", "description", "doorCount", "drivetrain", "enginePower", "engineVolume", "equipment", "exchange", "flagResolvedAt", "fromWho", "fuelType", "id", "il", "ilce", "isFeatured", "km", "listingNo", "model", "plateOrigin", "price", "series", "status", "title", "tramerAmount", "transmission", "updatedAt", "userId", "vehicleCondition", "vehicleTrimRawSpecs", "views", "warranty", "year") SELECT "aiAnalysis", "aiReportStatus", "bodyType", "brand", "categoryId", "color", "createdAt", "damageInfo", "damageStatus", "description", "doorCount", "drivetrain", "enginePower", "engineVolume", "equipment", "exchange", "flagResolvedAt", "fromWho", "fuelType", "id", "il", "ilce", "isFeatured", "km", "listingNo", "model", "plateOrigin", "price", "series", "status", "title", "tramerAmount", "transmission", "updatedAt", "userId", "vehicleCondition", "vehicleTrimRawSpecs", "views", "warranty", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_listingNo_key" ON "Listing"("listingNo");
CREATE INDEX "Listing_brand_model_idx" ON "Listing"("brand", "model");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");
CREATE INDEX "Listing_il_ilce_idx" ON "Listing"("il", "ilce");
CREATE INDEX "Listing_optionStatus_idx" ON "Listing"("optionStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ListingOption_listingId_idx" ON "ListingOption"("listingId");

-- CreateIndex
CREATE INDEX "ListingOption_buyerId_createdAt_idx" ON "ListingOption"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "ListingOption_status_idx" ON "ListingOption"("status");
