/*
  Warnings:

  - You are about to drop the `accounting_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_models` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_predictions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `analytics_dashboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `automated_workflows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `budget_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bulk_uploads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `communications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `compliance_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `custom_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `energy_readings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_iot_readings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_maintenance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `financial_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurance_claims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `insurance_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `integration_sync_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `integrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lease_amendments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lease_renewals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketing_campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marketing_listings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parking_spaces` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `property_inspections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rental_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `report_executions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `smart_device_readings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `smart_devices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_portal_access` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_screenings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit_inspections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_contracts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_maintenance_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_executions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `insurancePolicy` on the `buildings` table. All the data in the column will be lost.
  - You are about to drop the column `managementFee` on the `buildings` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `buildings` table. All the data in the column will be lost.
  - You are about to drop the column `assignedTo` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `channel` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `endedAt` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `sentiment` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `chat_conversations` table. All the data in the column will be lost.
  - You are about to drop the column `attachments` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `isFromAI` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `chat_messages` table. All the data in the column will be lost.
  - You are about to drop the column `checkDate` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `checkedBy` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `entityType` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `findings` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `remediation` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `ruleId` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `aiExtractedData` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `isAIProcessed` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `maintenanceRequestId` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `actualCost` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `aiPredictedCost` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `assignedStaffId` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `completedDate` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `contractorContact` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `contractorName` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `createdByUserId` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `predictedDuration` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `requestDate` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDate` on the `maintenance_requests` table. All the data in the column will be lost.
  - You are about to drop the column `autoPayEnabled` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `lateFee` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reminderSent` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `creditScore` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyName` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyPhone` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyRelation` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `employmentStatus` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `leaseEndDate` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `leaseStartDate` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyIncome` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `previousAddress` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `renewalLikelihood` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `riskScore` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `satisfactionScore` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `amenities` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `energyRating` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `lastRenovated` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `marketRent` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `occupancyScore` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `virtualTourUrl` on the `units` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `emailVerified` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Boolean`.
  - Added the required column `country` to the `buildings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `buildings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `chat_conversations` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `chat_conversations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkType` to the `compliance_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueDate` to the `compliance_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `compliance_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenantId` on table `maintenance_requests` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leaseStart` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `tenants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `units` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `units` table without a default value. This is not possible if the table is not empty.
  - Made the column `bathrooms` on table `units` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bedrooms` on table `units` required. This step will fail if there are existing NULL values in that column.
  - Made the column `squareFeet` on table `units` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "audit_logs_timestamp_idx";

-- DropIndex
DROP INDEX "audit_logs_entityType_entityId_idx";

-- DropIndex
DROP INDEX "audit_logs_userId_idx";

-- DropIndex
DROP INDEX "insurance_claims_claimNumber_key";

-- DropIndex
DROP INDEX "insurance_policies_policyNumber_key";

-- DropIndex
DROP INDEX "parking_spaces_buildingId_spaceNumber_key";

-- DropIndex
DROP INDEX "tenant_portal_access_accessToken_key";

-- DropIndex
DROP INDEX "tenant_screenings_applicationId_key";

-- DropIndex
DROP INDEX "vendor_invoices_invoiceNumber_key";

-- DropIndex
DROP INDEX "verification_tokens_identifier_token_key";

-- DropIndex
DROP INDEX "verification_tokens_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "accounting_transactions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ai_models";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ai_predictions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "analytics_dashboards";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "audit_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "automated_workflows";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "budget_plans";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "bulk_uploads";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "communications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "compliance_rules";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "custom_reports";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "energy_readings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "equipment_assets";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "equipment_iot_readings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "equipment_maintenance";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "financial_reports";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "insurance_claims";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "insurance_policies";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "integration_sync_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "integrations";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "leads";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "lease_amendments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "lease_renewals";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "leases";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "marketing_campaigns";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "marketing_listings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "notification_logs";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "notification_templates";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "parking_spaces";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "property_inspections";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "rental_applications";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "report_executions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "smart_device_readings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "smart_devices";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tenant_portal_access";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tenant_screenings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "unit_inspections";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "vendor_contracts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "vendor_invoices";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "vendor_maintenance_requests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "vendors";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "verification_tokens";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "workflow_executions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "training_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "content" TEXT,
    "videoUrl" TEXT,
    "documentUrl" TEXT,
    "quizQuestions" TEXT,
    "passingScore" INTEGER DEFAULT 80,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredForRole" TEXT,
    "expiryMonths" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "training_enrollments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ENROLLED',
    "lastAccessedAt" DATETIME,
    "progress" REAL NOT NULL DEFAULT 0,
    "currentPosition" TEXT,
    "notes" TEXT,
    CONSTRAINT "training_enrollments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" REAL,
    "passed" BOOLEAN,
    "certificateUrl" TEXT,
    "expiresAt" DATETIME,
    "retakeRequired" BOOLEAN NOT NULL DEFAULT false,
    "feedback" TEXT,
    CONSTRAINT "training_completions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enhanced_marketing_campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "campaignType" TEXT NOT NULL,
    "targetAudience" TEXT,
    "budget" REAL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "metrics" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "enhanced_marketing_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT,
    "unitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "aiOptimizedDesc" TEXT,
    "photos" TEXT,
    "videoUrl" TEXT,
    "virtualTourUrl" TEXT,
    "price" REAL NOT NULL,
    "availableDate" DATETIME NOT NULL,
    "syndicatedTo" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "inquiries" INTEGER NOT NULL DEFAULT 0,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "seoScore" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "publishedAt" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "enhanced_marketing_listings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "enhanced_marketing_campaigns" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "compliance_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "checklist" TEXT,
    "dueDates" TEXT,
    "penaltyInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "affordable_housing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT,
    "programType" TEXT NOT NULL,
    "incomeRestrictions" TEXT,
    "rentRestrictions" TEXT,
    "complianceDate" DATETIME NOT NULL,
    "nextInspection" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "inspector" TEXT,
    "notes" TEXT,
    "documents" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "affordable_housing_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "reportDate" DATETIME NOT NULL,
    "metricCategory" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "benchmarks" TEXT,
    "trends" TEXT,
    "recommendations" TEXT,
    "generatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "board_meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meetingType" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "location" TEXT,
    "virtualUrl" TEXT,
    "agenda" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "quorumRequired" INTEGER,
    "votingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "board_meetings_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendeeType" TEXT NOT NULL,
    "responseStatus" TEXT NOT NULL DEFAULT 'INVITED',
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "votingRights" BOOLEAN NOT NULL DEFAULT false,
    "proxyFor" TEXT,
    "notes" TEXT,
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "actionItems" TEXT,
    "approvals" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "agendaId" TEXT,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "proxyFor" TEXT,
    "weight" REAL NOT NULL DEFAULT 1,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "meeting_votes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "board_meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proxy_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "proxyId" TEXT NOT NULL,
    "votingLimits" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME
);

-- CreateTable
CREATE TABLE "status_certificates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT,
    "requestId" TEXT NOT NULL,
    "requesterName" TEXT NOT NULL,
    "requesterEmail" TEXT NOT NULL,
    "requesterPhone" TEXT,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "certificateData" TEXT,
    "generatedAt" DATETIME,
    "sentAt" DATETIME,
    "fee" REAL,
    "paidAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "expirationDate" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "status_certificates_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "virtual_agm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "webinarUrl" TEXT,
    "dialInNumber" TEXT,
    "accessCode" TEXT,
    "moderatorCode" TEXT,
    "recordingUrl" TEXT,
    "chatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "qAndAMode" TEXT NOT NULL DEFAULT 'MODERATED',
    "pollEnabled" BOOLEAN NOT NULL DEFAULT true,
    "screenShare" BOOLEAN NOT NULL DEFAULT false,
    "maxAttendees" INTEGER,
    "technicalSupport" TEXT,
    "rehearsalTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SETUP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "community_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT,
    "maxAttendees" INTEGER,
    "rsvpRequired" BOOLEAN NOT NULL DEFAULT false,
    "rsvpDeadline" DATETIME,
    "paymentRequired" BOOLEAN NOT NULL DEFAULT false,
    "fee" REAL,
    "organizerId" TEXT NOT NULL,
    "organizerName" TEXT,
    "photos" TEXT,
    "documents" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "recurringRules" TEXT,
    "reminders" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "community_events_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "response" TEXT NOT NULL DEFAULT 'ATTENDING',
    "numberOfGuests" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "rsvpedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" DATETIME,
    CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "community_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "capacity" INTEGER,
    "bookingWindow" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,
    "costPerHour" REAL,
    "photos" TEXT,
    "rules" TEXT,
    "availability" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "amenities_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "amenity_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amenityId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "numberOfPeople" INTEGER DEFAULT 1,
    "totalCost" REAL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "amenity_bookings_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resident_directory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "unitId" TEXT,
    "residentId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "displayPhoto" TEXT,
    "displayEmail" BOOLEAN NOT NULL DEFAULT false,
    "displayPhone" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContact" TEXT,
    "pets" TEXT,
    "vehicles" TEXT,
    "privacySettings" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "emergency_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "targetAudience" TEXT,
    "sendToAll" BOOLEAN NOT NULL DEFAULT true,
    "channels" TEXT,
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "expiresAt" DATETIME,
    "requiresAck" BOOLEAN NOT NULL DEFAULT false,
    "ackRequiredBy" DATETIME,
    "attachments" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "emergency_alerts_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_acknowledgments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "acknowledgedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "alert_acknowledgments_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "emergency_alerts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "branding_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "primaryColor" TEXT DEFAULT '#3B82F6',
    "secondaryColor" TEXT DEFAULT '#10B981',
    "accentColor" TEXT DEFAULT '#F59E0B',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "customCSS" TEXT,
    "customDomain" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'DEFAULT',
    "fontFamily" TEXT DEFAULT 'Inter',
    "customFonts" TEXT,
    "layout" TEXT,
    "features" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "branding_settings_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "website_management" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "domain" TEXT,
    "subdomain" TEXT,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "homeContent" TEXT,
    "pages" TEXT,
    "navigation" TEXT,
    "footerContent" TEXT,
    "socialLinks" TEXT,
    "contactInfo" TEXT,
    "seoSettings" TEXT,
    "analytics" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "lastModified" DATETIME,
    "modifiedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "website_management_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT,
    "totalUnits" INTEGER NOT NULL,
    "yearBuilt" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "buildings_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_buildings" ("address", "city", "createdAt", "description", "id", "name", "state", "totalUnits", "updatedAt", "yearBuilt", "zipCode") SELECT "address", "city", "createdAt", "description", "id", "name", "state", "totalUnits", "updatedAt", "yearBuilt", "zipCode" FROM "buildings";
DROP TABLE "buildings";
ALTER TABLE "new_buildings" RENAME TO "buildings";
CREATE TABLE "new_chat_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chat_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_chat_conversations" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "chat_conversations";
DROP TABLE "chat_conversations";
ALTER TABLE "new_chat_conversations" RENAME TO "chat_conversations";
CREATE TABLE "new_chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT,
    "intent" TEXT,
    "sentiment" TEXT,
    "confidence" REAL,
    "suggestedActions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chat_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_chat_messages" ("confidence", "conversationId", "createdAt", "id", "intent", "message", "sentiment") SELECT "confidence", "conversationId", "createdAt", "id", "intent", "message", "sentiment" FROM "chat_messages";
DROP TABLE "chat_messages";
ALTER TABLE "new_chat_messages" RENAME TO "chat_messages";
CREATE TABLE "new_compliance_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "buildingId" TEXT,
    "checkType" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "compliance_checks_programId_fkey" FOREIGN KEY ("programId") REFERENCES "compliance_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "compliance_checks_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_compliance_checks" ("createdAt", "id", "status", "updatedAt") SELECT "createdAt", "id", "status", "updatedAt" FROM "compliance_checks";
DROP TABLE "compliance_checks";
ALTER TABLE "new_compliance_checks" RENAME TO "compliance_checks";
CREATE TABLE "new_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT,
    "unitId" TEXT,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "documents_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_documents" ("createdAt", "description", "id", "tenantId", "unitId", "updatedAt") SELECT "createdAt", "description", "id", "tenantId", "unitId", "updatedAt" FROM "documents";
DROP TABLE "documents";
ALTER TABLE "new_documents" RENAME TO "documents";
CREATE TABLE "new_maintenance_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    "buildingId" TEXT,
    CONSTRAINT "maintenance_requests_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "maintenance_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "maintenance_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "maintenance_requests_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_maintenance_requests" ("createdAt", "description", "id", "priority", "status", "tenantId", "title", "unitId", "updatedAt") SELECT "createdAt", "description", "id", "priority", "status", "tenantId", "title", "unitId", "updatedAt" FROM "maintenance_requests";
DROP TABLE "maintenance_requests";
ALTER TABLE "new_maintenance_requests" RENAME TO "maintenance_requests";
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" DATETIME NOT NULL,
    "paidDate" DATETIME,
    "method" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "createdAt", "description", "dueDate", "id", "paidDate", "status", "tenantId", "updatedAt") SELECT "amount", "createdAt", "description", "dueDate", "id", "paidDate", "status", "tenantId", "updatedAt" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE TABLE "new_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
INSERT INTO "new_tenants" ("createdAt", "email", "id", "phone", "rentAmount", "securityDeposit", "unitId", "updatedAt") SELECT "createdAt", "email", "id", "phone", "rentAmount", "securityDeposit", "unitId", "updatedAt" FROM "tenants";
DROP TABLE "tenants";
ALTER TABLE "new_tenants" RENAME TO "tenants";
CREATE TABLE "new_units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" REAL NOT NULL,
    "squareFeet" INTEGER NOT NULL,
    "rentAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "units_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "units_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_units" ("bathrooms", "bedrooms", "buildingId", "createdAt", "description", "id", "rentAmount", "squareFeet", "status", "unitNumber", "updatedAt") SELECT "bathrooms", "bedrooms", "buildingId", "createdAt", "description", "id", "rentAmount", "squareFeet", "status", "unitNumber", "updatedAt" FROM "units";
DROP TABLE "units";
ALTER TABLE "new_units" RENAME TO "units";
CREATE UNIQUE INDEX "units_buildingId_unitNumber_key" ON "units"("buildingId", "unitNumber");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "isActive", "password", "role", "updatedAt") SELECT "createdAt", "email", coalesce("emailVerified", false) AS "emailVerified", "id", "isActive", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_moduleId_userId_key" ON "training_enrollments"("moduleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "training_completions_moduleId_userId_key" ON "training_completions"("moduleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_userId_key" ON "meeting_attendees"("meetingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_votes_meetingId_agendaId_userId_key" ON "meeting_votes"("meetingId", "agendaId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "proxy_assignments_meetingId_principalId_key" ON "proxy_assignments"("meetingId", "principalId");

-- CreateIndex
CREATE UNIQUE INDEX "status_certificates_requestId_key" ON "status_certificates"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_agm_meetingId_key" ON "virtual_agm"("meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "event_attendees"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "alert_acknowledgments_alertId_userId_key" ON "alert_acknowledgments"("alertId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "branding_settings_buildingId_key" ON "branding_settings"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "website_management_buildingId_key" ON "website_management"("buildingId");
