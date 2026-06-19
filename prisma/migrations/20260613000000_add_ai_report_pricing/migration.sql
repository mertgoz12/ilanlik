-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "aiReportStatus" TEXT;

-- CreateTable
CREATE TABLE "AiReportLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiReportLog_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AiReportLog_userId_createdAt_idx" ON "AiReportLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiReportLog_ip_createdAt_idx" ON "AiReportLog"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "AiReportLog_createdAt_idx" ON "AiReportLog"("createdAt");
