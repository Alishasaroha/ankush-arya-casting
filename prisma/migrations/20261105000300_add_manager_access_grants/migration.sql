CREATE TABLE "ManagerAccessGrant" (
  "id" UUID NOT NULL,
  "talentProfileId" UUID NOT NULL,
  "managerUserId" UUID NOT NULL,
  "grantedByUserId" UUID NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "revokedByUserId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ManagerAccessGrant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ManagerAccessGrant_talentProfileId_managerUserId_revokedAt_idx"
  ON "ManagerAccessGrant"("talentProfileId", "managerUserId", "revokedAt");

-- Keep grant history while preventing concurrent duplicate active permissions.
CREATE UNIQUE INDEX "ManagerAccessGrant_one_active_per_manager_profile_key"
  ON "ManagerAccessGrant"("talentProfileId", "managerUserId")
  WHERE "revokedAt" IS NULL;

CREATE INDEX "ManagerAccessGrant_managerUserId_revokedAt_idx"
  ON "ManagerAccessGrant"("managerUserId", "revokedAt");

CREATE INDEX "ManagerAccessGrant_talentProfileId_revokedAt_idx"
  ON "ManagerAccessGrant"("talentProfileId", "revokedAt");

ALTER TABLE "ManagerAccessGrant"
  ADD CONSTRAINT "ManagerAccessGrant_talentProfileId_fkey"
  FOREIGN KEY ("talentProfileId") REFERENCES "TalentProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ManagerAccessGrant"
  ADD CONSTRAINT "ManagerAccessGrant_managerUserId_fkey"
  FOREIGN KEY ("managerUserId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ManagerAccessGrant"
  ADD CONSTRAINT "ManagerAccessGrant_grantedByUserId_fkey"
  FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ManagerAccessGrant"
  ADD CONSTRAINT "ManagerAccessGrant_revokedByUserId_fkey"
  FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
