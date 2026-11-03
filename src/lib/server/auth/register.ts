import { generateEmailVerificationToken } from "./verification-token";
import { registerSchema } from "../../validation/auth";
import { prisma } from "../prisma";
import { hashPassword } from "./password";

// Custom error for invalid registration data
export class RegistrationValidationError extends Error {
  constructor(
    public readonly fieldErrors: Record<string, string[]>
  ) {
    super("Registration data is invalid");
    this.name = "RegistrationValidationError";
  }
}

// Custom error for an existing email
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("An account with this email already exists");
    this.name = "EmailAlreadyRegisteredError";
  }
}

// Check whether Prisma reported a unique constraint violation
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function registerAdultActor(input: unknown) {
  // 1. Validate incoming data
  const result = registerSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors)
        .filter(([, messages]) => messages)
    ) as Record<string, string[]>;

    throw new RegistrationValidationError(fieldErrors);
  }

  // 2. Extract validated data
  const { fullName, email, password } = result.data;

  // 3. Hash password before starting the database transaction
  const passwordHash = await hashPassword(password);
  const { token, tokenHash } = generateEmailVerificationToken();

const expiresAt = new Date(
    Date.now() + 30 * 60 * 1000
);

  try {
    // 4. Perform all database operations in one transaction
    const registeredActor = await prisma.$transaction(
      async (tx) => {
        // Find or create the TALENT role
        const talentRole = await tx.role.upsert({
          where: {
            name: "TALENT",
          },
          update: {},
          create: {
            name: "TALENT",
          },
        });

        // Create the user account
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        });

        // Assign the TALENT role
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: talentRole.id,
          },
        });

        // Create the adult actor's personal profile
        const profile = await tx.talentProfile.create({
          data: {
            fullName,
            ownerUserId: user.id,
          },
          select: {
            id: true,
            fullName: true,
          },
        });
        await tx.emailVerificationToken.create({
    data: {
        tokenHash,
        userId: user.id,
        expiresAt,
    },
});

        // Return only safe account information
        return {
          user,
          profile,
        };
      }
    );

   return {
    ...registeredActor,
    verificationToken: token,
};
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EmailAlreadyRegisteredError();
    }

    throw error;
  }
}