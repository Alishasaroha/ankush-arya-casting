-- Add lifecycle state for agency-managed talent records.
CREATE TYPE "TalentProfileStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

ALTER TABLE "TalentProfile"
  ADD COLUMN "status" "TalentProfileStatus" NOT NULL DEFAULT 'ACTIVE';
