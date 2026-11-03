import { prisma } from "../prisma";
import { hashVerificationToken } from "./verification-token";

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // Find the matching token.
    const record = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: {
          select: {
            emailVerifiedAt: true,
          },
        },
      },
    });

    // Reject missing or expired tokens.
    if (!record || record.expiresAt <= now) {
      return {
        success: false as const,
        code: "INVALID_OR_EXPIRED_TOKEN" as const,
        message: "This verification link is invalid or has expired.",
      };
    }

    // Handle an already verified account.
    if (record.user.emailVerifiedAt) {
      await tx.emailVerificationToken.deleteMany({
        where: { id: record.id },
      });

      return {
        success: true as const,
        message: "Your email address is already verified.",
      };
    }

    // Consume the token exactly once.
    const consumed = await tx.emailVerificationToken.deleteMany({
      where: {
        id: record.id,
        expiresAt: { gt: now },
      },
    });

    if (consumed.count !== 1) {
      return {
        success: false as const,
        code: "INVALID_OR_EXPIRED_TOKEN" as const,
        message: "This verification link is invalid or has expired.",
      };
    }

    // Activate email verification.
    await tx.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: now,
      },
    });

    return {
      success: true as const,
      message: "Your email address has been verified successfully.",
    };
  });
}