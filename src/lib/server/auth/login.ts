import { prisma } from "../prisma";
import { verifyPassword, getDummyPasswordHash } from "./password";
import { consumeLoginAttempt, clearLoginAttempts } from "./login-rate-limit";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Please verify your email before signing in.");
    this.name = "EmailNotVerifiedError";
  }
}

export { LoginRateLimitError } from "./login-rate-limit";

export async function authenticateUser(
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  // Count requests before looking up the account so unknown addresses are
  // throttled just like existing accounts.
  await consumeLoginAttempt(normalizedEmail);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  // Always perform the same Argon2id verification work, even when the
  // account does not exist, to reduce timing-based account enumeration.
  const hashToVerify = user?.passwordHash ?? await getDummyPasswordHash();
  const passwordMatches = await verifyPassword(password, hashToVerify);

  if (!user || !passwordMatches) {
    throw new InvalidCredentialsError();
  }

  // A correct password is not a failed login, even if email verification
  // is still pending.
  await clearLoginAttempts(normalizedEmail);

  if (!user.emailVerifiedAt) {
    throw new EmailNotVerifiedError();
  }

  return {
    id: user.id,
    email: user.email,
  };
}
