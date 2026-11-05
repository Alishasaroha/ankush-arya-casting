import { prisma } from "./prisma";
import { requireRole, APP_ROLES } from "./auth/authorization";
import { guardianChildProfileSchema } from "../validation/guardian";

export async function createGuardianChildProfile(input: unknown) {
  const parsed = guardianChildProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid child profile details.");
  }

  const guardian = await requireRole(APP_ROLES.GUARDIAN);
  const { childName, dateOfBirth, guardianRelationship } = parsed.data;

  return prisma.talentProfile.create({
    data: {
      fullName: childName,
      dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
      primaryGuardianUserId: guardian.userId,
      guardianRelationship,
      guardianConsentAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
    },
  });
}
