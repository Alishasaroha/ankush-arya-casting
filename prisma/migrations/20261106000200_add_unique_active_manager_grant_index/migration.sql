-- Preserve grant/revocation history but allow only one active grant
-- for the same manager and talent profile at a time.
CREATE UNIQUE INDEX "ManagerAccessGrant_one_active_per_manager_profile_key"
  ON "ManagerAccessGrant"("talentProfileId", "managerUserId")
  WHERE "revokedAt" IS NULL;
