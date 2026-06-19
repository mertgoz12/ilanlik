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
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Listing" ("aiAnalysis", "aiReportStatus", "bodyType", "brand", "categoryId", "color", "createdAt", "damageInfo", "damageStatus", "description", "doorCount", "drivetrain", "enginePower", "engineVolume", "equipment", "exchange", "flagResolvedAt", "fromWho", "fuelType", "id", "il", "ilce", "isFeatured", "km", "listingNo", "model", "optionEndAt", "optionHolderId", "optionStartAt", "optionStatus", "plateOrigin", "price", "series", "status", "title", "tramerAmount", "transmission", "updatedAt", "userId", "vehicleCondition", "vehicleTrimRawSpecs", "views", "warranty", "year") SELECT "aiAnalysis", "aiReportStatus", "bodyType", "brand", "categoryId", "color", "createdAt", "damageInfo", "damageStatus", "description", "doorCount", "drivetrain", "enginePower", "engineVolume", "equipment", "exchange", "flagResolvedAt", "fromWho", "fuelType", "id", "il", "ilce", "isFeatured", "km", "listingNo", "model", "optionEndAt", "optionHolderId", "optionStartAt", "optionStatus", "plateOrigin", "price", "series", "status", "title", "tramerAmount", "transmission", "updatedAt", "userId", "vehicleCondition", "vehicleTrimRawSpecs", "views", "warranty", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_listingNo_key" ON "Listing"("listingNo");
CREATE INDEX "Listing_brand_model_idx" ON "Listing"("brand", "model");
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");
CREATE INDEX "Listing_il_ilce_idx" ON "Listing"("il", "ilce");
CREATE INDEX "Listing_optionStatus_idx" ON "Listing"("optionStatus");
CREATE INDEX "Listing_isDemo_idx" ON "Listing"("isDemo");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "avatarUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewMessage" BOOLEAN NOT NULL DEFAULT true,
    "notifySavedSearch" BOOLEAN NOT NULL DEFAULT true,
    "notifyListingUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("avatarUrl", "badge", "createdAt", "email", "id", "il", "ilce", "isBanned", "isVerified", "name", "notifyListingUpdates", "notifyNewMessage", "notifySavedSearch", "password", "phone", "role", "warningCount") SELECT "avatarUrl", "badge", "createdAt", "email", "id", "il", "ilce", "isBanned", "isVerified", "name", "notifyListingUpdates", "notifyNewMessage", "notifySavedSearch", "password", "phone", "role", "warningCount" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
