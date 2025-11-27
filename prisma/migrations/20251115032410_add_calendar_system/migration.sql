-- AlterTable
ALTER TABLE "buildings" ADD COLUMN "budgetScore" REAL;
ALTER TABLE "buildings" ADD COLUMN "complianceScore" REAL;
ALTER TABLE "buildings" ADD COLUMN "lastScoreUpdate" DATETIME;
ALTER TABLE "buildings" ADD COLUMN "legalScore" REAL;
ALTER TABLE "buildings" ADD COLUMN "maintenanceScore" REAL;
ALTER TABLE "buildings" ADD COLUMN "propertyScore" REAL;
ALTER TABLE "buildings" ADD COLUMN "scoreBreakdown" TEXT;
ALTER TABLE "buildings" ADD COLUMN "taxFilingScore" REAL;

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "recurringRules" TEXT,
    "reminderSettings" TEXT,
    "attachments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "completedAt" DATETIME,
    "notes" TEXT,
    "tags" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "calendar_events_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annual_deadlines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadlineType" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "recurringMonth" INTEGER NOT NULL,
    "recurringDay" INTEGER NOT NULL,
    "advanceNotice" INTEGER NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'HIGH',
    "jurisdiction" TEXT,
    "requirements" TEXT,
    "penaltyInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoCreateEvent" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "annual_deadlines_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT,
    "deadlineId" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "reminderType" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "repeatPattern" TEXT,
    "maxOccurrences" INTEGER,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminders_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "calendar_events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminders_deadlineId_fkey" FOREIGN KEY ("deadlineId") REFERENCES "annual_deadlines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "calendar_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "workingHours" TEXT,
    "holidayRules" TEXT,
    "defaultReminders" TEXT,
    "colorScheme" TEXT,
    "viewPreferences" TEXT,
    "syncSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "calendar_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "property_score_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buildingId" TEXT NOT NULL,
    "previousScore" REAL,
    "newScore" REAL,
    "budgetScore" REAL,
    "complianceScore" REAL,
    "taxFilingScore" REAL,
    "maintenanceScore" REAL,
    "legalScore" REAL,
    "changeReason" TEXT,
    "changeType" TEXT NOT NULL,
    "breakdown" TEXT,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_score_history_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "calendar_settings_userId_key" ON "calendar_settings"("userId");
