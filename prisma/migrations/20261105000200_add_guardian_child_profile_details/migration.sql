ALTER TABLE "User"
ADD COLUMN "fullName" VARCHAR(100);

ALTER TABLE "TalentProfile"
ADD COLUMN "guardianRelationship" VARCHAR(80),
ADD COLUMN "guardianConsentAt" TIMESTAMP(3);
