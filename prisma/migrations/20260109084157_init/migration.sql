-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CompanyUserRole" AS ENUM ('ADMIN', 'MANAGER', 'RECRUITER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('ONLINE', 'ONSITE', 'PHONE', 'VIDEO');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('ACTIVE', 'CLOSED', 'PENDING_APPROVAL', 'REJECTED', 'DRAFT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('INTERNSHIP', 'PART_TIME', 'FULL_TIME', 'CONTRACT', 'FREELANCE');

-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('INDUSTRY', 'LOCATION', 'JOB_TYPE', 'COMPANY_SIZE', 'WORK_ENVIRONMENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPLICATION_UPDATE', 'INTERVIEW_SCHEDULED', 'OPPORTUNITY_MATCH', 'SYSTEM_ALERT', 'PLACEMENT_UPDATE');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'DEBUG');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'TRANSCRIPT', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "ParseStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "students" (
    "studentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "websiteUrl" TEXT,
    "elevatorPitch" TEXT,
    "profilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "companies" (
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "location" TEXT,
    "website" TEXT,
    "logoPath" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "admins" (
    "adminId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "superAdmin" BOOLEAN NOT NULL DEFAULT false,
    "inviteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jwtToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "universities" (
    "universityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("universityId")
);

-- CreateTable
CREATE TABLE "degrees" (
    "degreeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "degrees_pkey" PRIMARY KEY ("degreeId")
);

-- CreateTable
CREATE TABLE "majors" (
    "majorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("majorId")
);

-- CreateTable
CREATE TABLE "courses" (
    "courseId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "credits" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "skills" (
    "skillId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "preferences" (
    "preferenceId" TEXT NOT NULL,
    "type" "PreferenceType" NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("preferenceId")
);

-- CreateTable
CREATE TABLE "student_profiles" (
    "studentProfileId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT,
    "degreeId" TEXT,
    "majorId" TEXT,
    "gpa" DOUBLE PRECISION,
    "graduationDate" TIMESTAMP(3),
    "availabilityStartDate" TIMESTAMP(3),
    "attachmentDuration" INTEGER,
    "willingToRelocate" BOOLEAN NOT NULL DEFAULT false,
    "remoteAllowed" BOOLEAN NOT NULL DEFAULT true,
    "cvFilePath" TEXT,
    "transcriptFilePath" TEXT,
    "cvParsedText" TEXT,
    "transcriptParsedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("studentProfileId")
);

-- CreateTable
CREATE TABLE "student_skills" (
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "yearsOfExperience" DOUBLE PRECISION,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("studentId","skillId")
);

-- CreateTable
CREATE TABLE "student_courses" (
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "grade" TEXT,
    "semester" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_courses_pkey" PRIMARY KEY ("studentId","courseId")
);

-- CreateTable
CREATE TABLE "student_preferences" (
    "studentId" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_preferences_pkey" PRIMARY KEY ("studentId","preferenceId")
);

-- CreateTable
CREATE TABLE "experiences" (
    "experienceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "role" TEXT,
    "employmentType" "EmploymentType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("experienceId")
);

-- CreateTable
CREATE TABLE "experience_technologies" (
    "experienceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_technologies_pkey" PRIMARY KEY ("experienceId","skillId")
);

-- CreateTable
CREATE TABLE "projects" (
    "projectId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "projectType" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "project_technologies" (
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_technologies_pkey" PRIMARY KEY ("projectId","skillId")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "companyProfileId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "phone" TEXT,
    "employeeCount" TEXT,
    "foundedYear" INTEGER,
    "headquarters" TEXT,
    "companyType" TEXT,
    "benefits" TEXT[],
    "culture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("companyProfileId")
);

-- CreateTable
CREATE TABLE "company_users" (
    "companyUserId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CompanyUserRole" NOT NULL DEFAULT 'RECRUITER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_users_pkey" PRIMARY KEY ("companyUserId")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "opportunityId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "industry" TEXT,
    "jobTypes" "EmploymentType"[],
    "gpaThreshold" DOUBLE PRECISION,
    "isTechnical" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "applicationDeadline" TIMESTAMP(3),
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "benefits" TEXT[],
    "requirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("opportunityId")
);

-- CreateTable
CREATE TABLE "opportunity_skills" (
    "opportunityId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "skillWeight" INTEGER NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_skills_pkey" PRIMARY KEY ("opportunityId","skillId")
);

-- CreateTable
CREATE TABLE "applications" (
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coverLetter" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "matchScore" DOUBLE PRECISION,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "interviews" (
    "interviewId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewType" "InterviewType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT,
    "duration" INTEGER,
    "interviewer" TEXT,
    "interviewerEmail" TEXT,
    "meetingLink" TEXT,
    "location" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "feedback" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("interviewId")
);

-- CreateTable
CREATE TABLE "placements" (
    "placementId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "PlacementStatus" NOT NULL DEFAULT 'ACTIVE',
    "salary" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "feedback" TEXT,
    "rating" INTEGER,
    "companyRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "placements_pkey" PRIMARY KEY ("placementId")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "logId" TEXT NOT NULL,
    "userId" TEXT,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "details" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("logId")
);

-- CreateTable
CREATE TABLE "queues" (
    "queueId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "queues_pkey" PRIMARY KEY ("queueId")
);

-- CreateTable
CREATE TABLE "student_metrics" (
    "studentMetricsId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "academicScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "experienceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "preferenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hireabilityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastComputed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computeVersion" TEXT NOT NULL DEFAULT '1.0',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_metrics_pkey" PRIMARY KEY ("studentMetricsId")
);

-- CreateTable
CREATE TABLE "student_documents" (
    "documentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "parsedText" TEXT,
    "parseStatus" "ParseStatus" NOT NULL DEFAULT 'PENDING',
    "parseError" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsedAt" TIMESTAMP(3),

    CONSTRAINT "student_documents_pkey" PRIMARY KEY ("documentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_key" ON "companies"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_jwtToken_key" ON "user_sessions"("jwtToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "degrees_name_key" ON "degrees"("name");

-- CreateIndex
CREATE UNIQUE INDEX "majors_name_key" ON "majors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "courses_courseCode_key" ON "courses"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_studentId_key" ON "student_profiles"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_companyId_key" ON "company_profiles"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "company_users_companyId_userId_key" ON "company_users"("companyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_studentId_opportunityId_key" ON "applications"("studentId", "opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "placements_applicationId_key" ON "placements"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "student_metrics_studentId_key" ON "student_metrics"("studentId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("universityId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "degrees"("degreeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("majorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("courseId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_preferences" ADD CONSTRAINT "student_preferences_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_preferences" ADD CONSTRAINT "student_preferences_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "preferences"("preferenceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("experienceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_technologies" ADD CONSTRAINT "experience_technologies_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_skills" ADD CONSTRAINT "opportunity_skills_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("opportunityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_skills" ADD CONSTRAINT "opportunity_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("opportunityId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placements" ADD CONSTRAINT "placements_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_metrics" ADD CONSTRAINT "student_metrics_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;
