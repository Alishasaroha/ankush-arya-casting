import { prisma } from "../prisma";
import { generateEmailVerificationToken } from "./verification-token";

const TOKEN_EXPIRY_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function createResendVerificationRequest(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  return prisma.$transaction(async (tx) => {
    // 1. Find the existing account.
    const user = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerifiedAt: true,
        ownedProfile: {
          select: { fullName: true },
        },
      },
    });

    // 2. Don't reveal whether an account exists.
    if (!user || user.emailVerifiedAt) {
      return null;
    }

    const now = new Date();

    // 3. Check the resend cooldown.
    const existingToken = await tx.emailVerificationToken.findUnique({
      where: { userId: user.id },
      select: { createdAt: true },
    });

    if (
      existingToken &&
      now.getTime() - existingToken.createdAt.getTime() <
        RESEND_COOLDOWN_MS
    ) {
      return null;
    }

    // 4. Generate a fresh token.
    const { token, tokenHash } = generateEmailVerificationToken();

    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MS);

    // 5. Replace the old token or create a new one.
    await tx.emailVerificationToken.upsert({
      where: { userId: user.id },
      update: {
        tokenHash,
        expiresAt,
        createdAt: now,
      },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt,
        createdAt: now,
      },
    });

    // 6. Return details for the server-side email service.
    return {
      email: user.email,
      fullName: user.fullName ?? user.ownedProfile?.fullName ?? "there",
      token,
    };
  });
}