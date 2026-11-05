import { generateEmailVerificationToken } from "./verification-token";
import { registerSchema } from "../../validation/auth";
import { registerGuardianSchema } from "../../validation/guardian";
import { managerRegistrationSchema } from "../../validation/manager";
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
            fullName,
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

/**
 * Create a guardian account and its first child talent profile atomically.
 * The guardian's email must still be verified before the account can sign in.
 */
export async function registerGuardianWithChild(input: unknown) {
  const result = registerGuardianSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).filter(([, messages]) => messages),
    ) as Record<string, string[]>;

    throw new RegistrationValidationError(fieldErrors);
  }

  const {
    guardianName,
    email,
    password,
    childName,
    dateOfBirth,
    guardianRelationship,
  } = result.data;

  const passwordHash = await hashPassword(password);
  const { token, tokenHash } = generateEmailVerificationToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  try {
    const registeredGuardian = await prisma.$transaction(async (tx) => {
      const guardianRole = await tx.role.upsert({
        where: { name: "GUARDIAN" },
        update: {},
        create: { name: "GUARDIAN" },
      });

      const user = await tx.user.create({
        data: { email, passwordHash, fullName: guardianName },
        select: { id: true, email: true, fullName: true, createdAt: true },
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: guardianRole.id },
      });

      const profile = await tx.talentProfile.create({
        data: {
          fullName: childName,
          dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
          primaryGuardianUserId: user.id,
          guardianRelationship,
          guardianConsentAt: new Date(),
        },
        select: { id: true, fullName: true },
      });

      await tx.emailVerificationToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      return { user, profile };
    });

    return { ...registeredGuardian, verificationToken: token };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }
}


/**
 * A manager account has no profile privileges by default. It receives only
 * read access to profiles for which a talent or guardian creates an active grant.
 */
export async function registerManager(input: unknown) {
  const result = managerRegistrationSchema.safeParse(input);

  if (!result.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(result.error.flatten().fieldErrors).filter(([, messages]) => messages),
    ) as Record<string, string[]>;

    throw new RegistrationValidationError(fieldErrors);
  }

  const { fullName, email, password } = result.data;
  const passwordHash = await hashPassword(password);
  const { token, tokenHash } = generateEmailVerificationToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  try {
    const registeredManager = await prisma.$transaction(async (tx) => {
      const managerRole = await tx.role.upsert({
        where: { name: "MANAGER" },
        update: {},
        create: { name: "MANAGER" },
      });

      const user = await tx.user.create({
        data: { email, passwordHash, fullName },
        select: { id: true, email: true, fullName: true, createdAt: true },
      });

      await tx.userRole.create({
        data: { userId: user.id, roleId: managerRole.id },
      });

      await tx.emailVerificationToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
      });

      return { user };
    });

    return { ...registeredManager, verificationToken: token };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new EmailAlreadyRegisteredError();
    }
    throw error;
  }
}
