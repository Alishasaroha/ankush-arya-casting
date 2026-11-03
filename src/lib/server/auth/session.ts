import { randomBytes } from "node:crypto";

import { prisma } from "../prisma";
import { hashVerificationToken } from "./verification-token";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string) {
  // Generate a cryptographically secure session token.
  const token = randomBytes(32).toString("hex");

  // Store only its SHA-256 hash.
  const tokenHash = hashVerificationToken(token);

  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  // The original token will be sent to the browser as a cookie.
  return { token, expiresAt };
}

export async function getSessionUser(token: string) {
  const tokenHash = hashVerificationToken(token);
  const now = new Date();

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          roles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt <= now) {
    if (session) {
      await prisma.session.deleteMany({
        where: { id: session.id },
      });
    }

    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    emailVerifiedAt: session.user.emailVerifiedAt,
    roles: session.user.roles.map(({ role }) => role.name),
  };
}

export async function revokeSession(token: string) {
  const tokenHash = hashVerificationToken(token);

  await prisma.session.deleteMany({
    where: { tokenHash },
  });
}