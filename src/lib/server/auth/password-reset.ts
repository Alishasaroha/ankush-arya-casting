import { randomBytes } from "node:crypto";

import { prisma } from "../prisma";
import { hashPassword } from "./password";
import { hashVerificationToken } from "./verification-token";

const TOKEN_EXPIRY_MS = 30 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 60 * 1000;

export async function createPasswordResetRequest(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
      },
    });

    // Only verified accounts can receive a reset link. The public endpoint
    // returns the same message whether this function returns null or a request.
    if (!user || !user.emailVerifiedAt) {
      return null;
    }

    const now = new Date();
    const existingToken = await tx.passwordResetToken.findUnique({
      where: { userId: user.id },
      select: { createdAt: true },
    });

    if (
      existingToken &&
      now.getTime() - existingToken.createdAt.getTime() < REQUEST_COOLDOWN_MS
    ) {
      return null;
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashVerificationToken(token);
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MS);

    // One active reset token per account. A new request rotates the old token.
    await tx.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { tokenHash, expiresAt, createdAt: now },
      create: { userId: user.id, tokenHash, expiresAt, createdAt: now },
    });

    return {
      email: user.email,
      fullName: user.fullName ?? "there",
      token,
    };
  });
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<boolean> {
  const tokenHash = hashVerificationToken(token);
  const now = new Date();

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  });

  if (!record || record.expiresAt <= now) {
    if (record) {
      await prisma.passwordResetToken.deleteMany({
        where: { id: record.id, expiresAt: { lte: now } },
      });
    }
    return false;
  }

  // Do the expensive Argon2 work only after confirming the token exists and
  // has not expired. Token consumption and password/session updates are atomic.
  const passwordHash = await hashPassword(newPassword);
  const consumedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.deleteMany({
      where: {
        id: record.id,
        tokenHash,
        expiresAt: { gt: consumedAt },
      },
    });

    // Another request may have consumed the token while the password was hashed.
    if (consumed.count !== 1) {
      return false;
    }

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });

    // A password reset signs the account out on every browser/device.
    await tx.session.deleteMany({
      where: { userId: record.userId },
    });

    return true;
  });
}
