import { prisma } from "./prisma";
import { requireTalentProfileGrantControl } from "./auth/authorization";
import type {
  GrantManagerAccessInput,
  RevokeManagerAccessInput,
} from "../validation/manager";

export class ManagerAccessRequestError extends Error {
  constructor(message: string, readonly code: "NOT_ELIGIBLE" | "ALREADY_GRANTED" | "NOT_FOUND") {
    super(message);
    this.name = "ManagerAccessRequestError";
  }
}

export async function grantManagerAccess(input: GrantManagerAccessInput) {
  const { user, profile } = await requireTalentProfileGrantControl(input.profileId);
  const manager = await prisma.user.findUnique({
    where: { email: input.managerEmail },
    select: {
      id: true,
      email: true,
      fullName: true,
      emailVerifiedAt: true,
      roles: {
        select: { role: { select: { name: true } } },
      },
    },
  });

  const isManager = manager?.roles.some(({ role }) => role.name === "MANAGER") ?? false;

  if (!manager || !manager.emailVerifiedAt || !isManager) {
    throw new ManagerAccessRequestError(
      "No verified manager account was found for that email. Ask the manager to create and verify a manager account first.",
      "NOT_ELIGIBLE",
    );
  }

  if (manager.id === user.userId) {
    throw new ManagerAccessRequestError(
      "You cannot grant manager access to your own account.",
      "NOT_ELIGIBLE",
    );
  }

  const existingGrant = await prisma.managerAccessGrant.findFirst({
    where: {
      talentProfileId: profile.id,
      managerUserId: manager.id,
      revokedAt: null,
    },
    select: { id: true },
  });

  if (existingGrant) {
    throw new ManagerAccessRequestError(
      "This manager already has access to the profile.",
      "ALREADY_GRANTED",
    );
  }

  const grant = await prisma.managerAccessGrant.create({
    data: {
      talentProfileId: profile.id,
      managerUserId: manager.id,
      grantedByUserId: user.userId,
    },
    select: {
      id: true,
      managerUserId: true,
      grantedAt: true,
      managerUser: {
        select: { email: true, fullName: true },
      },
    },
  });

  return grant;
}

export async function revokeManagerAccess(input: RevokeManagerAccessInput) {
  const { user } = await requireTalentProfileGrantControl(input.profileId);

  const result = await prisma.managerAccessGrant.updateMany({
    where: {
      talentProfileId: input.profileId,
      managerUserId: input.managerUserId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
      revokedByUserId: user.userId,
    },
  });

  if (result.count === 0) {
    throw new ManagerAccessRequestError(
      "An active manager access grant was not found.",
      "NOT_FOUND",
    );
  }

  return { success: true as const };
}
