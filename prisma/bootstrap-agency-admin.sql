\set ON_ERROR_STOP on

\prompt 'Enter the email of the new, email-verified agency administrator: ' admin_email
\prompt 'This removes the account own talent profile and TALENT role. Type CONVERT_TO_AGENCY_ADMIN to continue: ' confirmation

BEGIN;

SET LOCAL app.bootstrap_admin_email = :'admin_email';
SET LOCAL app.bootstrap_admin_confirmation = :'confirmation';

-- Require explicit confirmation and an existing, verified account.
DO $bootstrap$
BEGIN
  IF current_setting('app.bootstrap_admin_confirmation') <> 'CONVERT_TO_AGENCY_ADMIN' THEN
    RAISE EXCEPTION 'Confirmation did not match. No changes were made.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM "User"
    WHERE lower("email") = lower(current_setting('app.bootstrap_admin_email'))
      AND "emailVerifiedAt" IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'No existing email-verified account matches the supplied address. No changes were made.';
  END IF;
END
$bootstrap$;

-- Create the ADMIN role if it does not already exist.
INSERT INTO "Role" ("id", "name")
VALUES (gen_random_uuid(), 'ADMIN')
ON CONFLICT ("name") DO NOTHING;

-- Grant ADMIN to only the explicitly supplied verified account.
INSERT INTO "UserRole" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" AS u
JOIN "Role" AS r ON r."name" = 'ADMIN'
WHERE lower(u."email") = lower(current_setting('app.bootstrap_admin_email'))
  AND u."emailVerifiedAt" IS NOT NULL
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- This dedicated script is only for the agency's own admin account.
-- Remove the placeholder talent profile created by adult actor registration.
-- Related link/photo rows are deleted by their ON DELETE CASCADE constraints.
DELETE FROM "TalentProfile"
WHERE "ownerUserId" = (
  SELECT "id"
  FROM "User"
  WHERE lower("email") = lower(current_setting('app.bootstrap_admin_email'))
    AND "emailVerifiedAt" IS NOT NULL
);

-- Remove only the TALENT role assignment; other role definitions remain intact.
DELETE FROM "UserRole"
WHERE "userId" = (
  SELECT "id"
  FROM "User"
  WHERE lower("email") = lower(current_setting('app.bootstrap_admin_email'))
    AND "emailVerifiedAt" IS NOT NULL
)
AND "roleId" = (
  SELECT "id"
  FROM "Role"
  WHERE "name" = 'TALENT'
);

COMMIT;

-- Confirm the agency account now has ADMIN and no TALENT profile association.
SELECT
  u."email",
  r."name" AS assigned_role,
  EXISTS (
    SELECT 1
    FROM "TalentProfile" AS p
    WHERE p."ownerUserId" = u."id"
  ) AS has_owned_talent_profile
FROM "User" AS u
JOIN "UserRole" AS ur ON ur."userId" = u."id"
JOIN "Role" AS r ON r."id" = ur."roleId"
WHERE lower(u."email") = lower(:'admin_email')
ORDER BY r."name";
