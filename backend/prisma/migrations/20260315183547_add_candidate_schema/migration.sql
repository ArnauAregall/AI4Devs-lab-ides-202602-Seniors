-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" VARCHAR(255),
    "source" VARCHAR(100),
    "notes" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(255) NOT NULL,
    "currentCvId" INTEGER,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_educations" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "degree" VARCHAR(255),
    "institution" VARCHAR(255),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "candidate_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_work_experiences" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "company" VARCHAR(255),
    "title" VARCHAR(255),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" VARCHAR(2000),

    CONSTRAINT "candidate_work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_cvs" (
    "id" SERIAL NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "contentType" VARCHAR(100) NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "candidate_cvs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_email_key" ON "candidates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_currentCvId_key" ON "candidates"("currentCvId");

-- CreateIndex
CREATE INDEX "candidates_lastName_idx" ON "candidates"("lastName");

-- CreateIndex
CREATE INDEX "candidate_educations_candidateId_idx" ON "candidate_educations"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_work_experiences_candidateId_idx" ON "candidate_work_experiences"("candidateId");

-- CreateIndex
CREATE INDEX "candidate_cvs_candidateId_idx" ON "candidate_cvs"("candidateId");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_currentCvId_fkey" FOREIGN KEY ("currentCvId") REFERENCES "candidate_cvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_educations" ADD CONSTRAINT "candidate_educations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_work_experiences" ADD CONSTRAINT "candidate_work_experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_cvs" ADD CONSTRAINT "candidate_cvs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "candidate_cvs" ADD CONSTRAINT "chk_size_bytes_non_negative" CHECK (size_bytes >= 0);
