import { prisma } from "../prisma";
import { verifyPassword } from "./password";

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

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  if (!user.emailVerifiedAt) {
    throw new EmailNotVerifiedError();
  }

  return {
    id: user.id,
    email: user.email,
  };
}