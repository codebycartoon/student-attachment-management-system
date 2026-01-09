-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'COMPUTED', 'SHORTLISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecomputationStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIRunType" AS ENUM ('STUDENT_UPDATE', 'OPPORTUNITY_UPDATE', 'MANUAL_TRIGGER', 'SCHEDULED_BATCH');

-- CreateTable
CREATE TABLE "match_scores" (
    "matchScoreId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "skillScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "academicScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experienceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "computeVersion" TEXT NOT NULL DEFAULT '1.0',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_scores_pkey" PRIMARY KEY ("matchScoreId")
);

-- CreateTable
CREATE TABLE "recomputation_queue" (
    "queueId" TEXT NOT NULL,
    "studentId" TEXT,
    "opportunityId" TEXT,
    "status" "RecomputationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "triggerReason" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "recomputation_queue_pkey" PRIMARY KEY ("queueId")
);

-- CreateTable
CREATE TABLE "ai_logs" (
    "logId" TEXT NOT NULL,
    "runType" "AIRunType" NOT NULL,
    "inputCount" INTEGER NOT NULL DEFAULT 0,
    "outputCount" INTEGER NOT NULL DEFAULT 0,
    "runtimeMs" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "metadata" JSONB,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("logId")
);

-- CreateTable
CREATE TABLE "matching_config" (
    "configId" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matching_config_pkey" PRIMARY KEY ("configId")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_scores_studentId_opportunityId_key" ON "match_scores"("studentId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "matching_config_configKey_key" ON "matching_config"("configKey");

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_scores" ADD CONSTRAINT "match_scores_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("opportunityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomputation_queue" ADD CONSTRAINT "recomputation_queue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recomputation_queue" ADD CONSTRAINT "recomputation_queue_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("opportunityId") ON DELETE CASCADE ON UPDATE CASCADE;
