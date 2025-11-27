/*
  Warnings:

  - You are about to drop the column `name` on the `tenants` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" DATETIME,
    "ssn" TEXT,
    "emergencyContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "leaseStart" DATETIME NOT NULL,
    "leaseEnd" DATETIME,
    "rentAmount" REAL NOT NULL,
    "securityDeposit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "tenants_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tenants_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tenants" ("createdAt", "createdBy", "dateOfBirth", "email", "emergencyContact", "id", "leaseEnd", "leaseStart", "phone", "rentAmount", "securityDeposit", "ssn", "status", "unitId", "updatedAt") SELECT "createdAt", "createdBy", "dateOfBirth", "email", "emergencyContact", "id", "leaseEnd", "leaseStart", "phone", "rentAmount", "securityDeposit", "ssn", "status", "unitId", "updatedAt" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
