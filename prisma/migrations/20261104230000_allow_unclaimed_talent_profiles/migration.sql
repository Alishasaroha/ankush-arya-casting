-- Permit unclaimed records created directly by authorized agency admins.
-- A profile may be owned by a talent account, assigned to a guardian, or
-- remain unclaimed. It must never be linked to both at the same time.

ALTER TABLE "TalentProfile"
  DROP CONSTRAINT "TalentProfile_ownership_check";

ALTER TABLE "TalentProfile"
  ADD CONSTRAINT "TalentProfile_ownership_check"
  CHECK (
    "ownerUserId" IS NULL
    OR "primaryGuardianUserId" IS NULL
  );
