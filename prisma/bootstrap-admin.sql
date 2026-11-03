\set ON_ERROR_STOP on

\prompt 'Enter the email of an existing, email-verified agency administrator: ' admin_email

BEGIN;

-- Keep the supplied address scoped to this transaction.
SET LOCAL app.bootstrap_admin_email = :'admin_email';

-- Refuse to grant ADMIN to a missing or unverified account.
DO $bootstrap$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "User"
    WHERE lower("email") = lower(current_setting('app.bootstrap_admin_email'))
      AND "emailVerifiedAt" IS NOT NULL
  ) THEN
    RAISE EXCEPTION
      'No existing email-verified account matches the supplied address. No role was assigned.';
  END IF;
END
$bootstrap$;

-- Create the ADMIN role if it does not already exist.
INSERT INTO "Role" ("id", "name")
VALUES (gen_random_uuid(), 'ADMIN')
ON CONFLICT ("name") DO NOTHING;

-- Assign ADMIN only to the explicitly supplied verified account.
INSERT INTO "UserRole" ("userId", "roleId")
SELECT u."id", r."id"
FROM "User" AS u
JOIN "Role" AS r ON r."name" = 'ADMIN'
WHERE lower(u."email") = lower(current_setting('app.bootstrap_admin_email'))
  AND u."emailVerifiedAt" IS NOT NULL
ON CONFLICT ("userId", "roleId") DO NOTHING;

COMMIT;

-- Confirm the resulting role assignment.
SELECT u."email", r."name" AS assigned_role
FROM "User" AS u
JOIN "UserRole" AS ur ON ur."userId" = u."id"
JOIN "Role" AS r ON r."id" = ur."roleId"
WHERE lower(u."email") = lower(:'admin_email')
  AND r."name" = 'ADMIN';
