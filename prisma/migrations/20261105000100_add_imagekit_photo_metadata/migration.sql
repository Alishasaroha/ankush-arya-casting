-- Keep the provider's stable asset identifiers so private URLs can be signed
-- and cloud files can be deleted when a talent removes a photo.
ALTER TABLE "TalentProfilePhoto"
  ADD COLUMN "fileId" VARCHAR(64),
  ADD COLUMN "filePath" VARCHAR(2048);

CREATE UNIQUE INDEX "TalentProfilePhoto_fileId_key"
  ON "TalentProfilePhoto"("fileId");
