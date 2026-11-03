-- Create the supported types of profile-related links.
CREATE TYPE "TalentLinkType" AS ENUM ('PREVIOUS_WORK', 'PORTFOLIO');

-- Add structured personal and professional details to talent profiles.
ALTER TABLE "TalentProfile"
  ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "experienceYears" INTEGER,
  ADD COLUMN "experienceSummary" VARCHAR(2000),
  ADD COLUMN "instagramHandle" VARCHAR(31),
  ADD COLUMN "introVideoUrl" VARCHAR(2048);

-- Store previous-work and portfolio links as separate, ordered records.
CREATE TABLE "TalentProfileLink" (
  "id" UUID NOT NULL,
  "talentProfileId" UUID NOT NULL,
  "type" "TalentLinkType" NOT NULL,
  "title" VARCHAR(120) NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TalentProfileLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TalentProfileLink_talentProfileId_type_sortOrder_idx"
  ON "TalentProfileLink"("talentProfileId", "type", "sortOrder");

ALTER TABLE "TalentProfileLink"
  ADD CONSTRAINT "TalentProfileLink_talentProfileId_fkey"
  FOREIGN KEY ("talentProfileId") REFERENCES "TalentProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Store photo asset URLs and metadata; binary image files live in object storage.
CREATE TABLE "TalentProfilePhoto" (
  "id" UUID NOT NULL,
  "talentProfileId" UUID NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "altText" VARCHAR(200),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TalentProfilePhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TalentProfilePhoto_talentProfileId_sortOrder_idx"
  ON "TalentProfilePhoto"("talentProfileId", "sortOrder");

ALTER TABLE "TalentProfilePhoto"
  ADD CONSTRAINT "TalentProfilePhoto_talentProfileId_fkey"
  FOREIGN KEY ("talentProfileId") REFERENCES "TalentProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
