import { createHash } from "node:crypto";

import { prisma } from "../prisma";

const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_STORED_ATTEMPTS = MAX_LOGIN_ATTEMPTS + 1;

let requestsSinceCleanup = 0;

export class LoginRateLimitError extends Error {
  constructor() {
    super("Too many sign-in attempts. Please wait 15 minutes before trying again.");
    this.name = "LoginRateLimitError";
  }
}

function hashEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

/**
 * Atomically consumes one login attempt for a normalized email address.
 * Only a SHA-256 identifier is stored; raw email addresses are not copied
 * into the rate-limit table.
 */
export async function consumeLoginAttempt(email: string): Promise<void> {
  const emailHash = hashEmail(email);
  const now = new Date();
  const windowFloor = new Date(now.getTime() - LOGIN_WINDOW_MS);

  const rows = await prisma.$queryRaw<Array<{ attempts: number }>>`
    INSERT INTO "LoginAttempt" (
      "emailHash",
      "attempts",
      "windowStartedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (${emailHash}, 1, ${now}, ${now}, ${now})
    ON CONFLICT ("emailHash") DO UPDATE
    SET
      "attempts" = CASE
        WHEN "LoginAttempt"."windowStartedAt" <= ${windowFloor} THEN 1
        ELSE LEAST("LoginAttempt"."attempts" + 1, ${MAX_STORED_ATTEMPTS})
      END,
      "windowStartedAt" = CASE
        WHEN "LoginAttempt"."windowStartedAt" <= ${windowFloor} THEN ${now}
        ELSE "LoginAttempt"."windowStartedAt"
      END,
      "updatedAt" = ${now}
    RETURNING "attempts";
  `;

  if ((rows[0]?.attempts ?? MAX_STORED_ATTEMPTS) > MAX_LOGIN_ATTEMPTS) {
    throw new LoginRateLimitError();
  }

  // Expired buckets are no longer needed. Run cleanup periodically instead
  // of scanning this table on every login request.
  requestsSinceCleanup += 1;
  if (requestsSinceCleanup >= 100) {
    requestsSinceCleanup = 0;
    try {
      await prisma.loginAttempt.deleteMany({
        where: {
          windowStartedAt: { lt: windowFloor },
        },
      });
    } catch (cleanupError) {
      // Expired-bucket cleanup must never block a valid login attempt.
      console.warn("Login rate-limit cleanup failed:", cleanupError);
    }
  }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({
    where: { emailHash: hashEmail(email) },
  });
}
