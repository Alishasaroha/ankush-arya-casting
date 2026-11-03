import { prisma } from "../prisma";
import { getSessionCookie, clearSessionCookie } from "./session-cookie";
import { getSessionUser, revokeSession } from "./session";

export const APP_ROLES = {
  TALENT: "TALENT",
  GUARDIAN: "GUARDIAN",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthenticationRequiredError";
  }
}

export class AuthorizationError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
    this.name = "AuthorizationError";
  }
}

export class TalentProfileNotFoundError extends Error {
  constructor() {
    super("Talent profile not found.");
    this.name = "TalentProfileNotFoundError";
  }
}

/**
 * Returns the verified user associated with the current request cookie.
 * Expired, missing, or unverified sessions are rejected and cleared.
 */
export async function getAuthenticatedUser() {
  const token = getSessionCookie();

  if (!token) {
    return null;
  }

  const user = await getSessionUser(token);

  if (!user || !user.emailVerifiedAt) {
    await revokeSession(token);
    clearSessionCookie();
    return null;
  }

  return user;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AuthenticationRequiredError();
  }

  return user;
}

/** Require one specific application role. */
export async function requireRole(role: AppRole) {
  const user = await requireAuthenticatedUser();

  if (!user.roles.includes(role)) {
    throw new AuthorizationError();
  }

  return user;
}

/** Require at least one role from the supplied allow-list. */
export async function requireAnyRole(roles: readonly AppRole[]) {
  const user = await requireAuthenticatedUser();

  if (!user.roles.some((role) => roles.includes(role as AppRole))) {
    throw new AuthorizationError();
  }

  return user;
}

/**
 * Enforce record-level access for a single talent profile.
 * ADMIN has agency-wide access. TALENT can access their own profile.
 * GUARDIAN can access profiles explicitly assigned to them.
 *
 * MANAGER access is intentionally denied here until the separate,
 * actor-approved and revocable manager-grant model is implemented.
 */
export async function requireTalentProfileAccess(profileId: string) {
  const user = await requireAuthenticatedUser();

  const profile = await prisma.talentProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      fullName: true,
      ownerUserId: true,
      primaryGuardianUserId: true,
      dateOfBirth: true,
      heightCm: true,
      gender: true,
      location: true,
      bio: true,
      languages: true,
      experienceYears: true,
      experienceSummary: true,
      instagramHandle: true,
      introVideoUrl: true,
      links: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          type: true,
          title: true,
          url: true,
          sortOrder: true,
        },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
        },
      },
      updatedAt: true,
    },
  });

  if (!profile) {
    throw new TalentProfileNotFoundError();
  }

  if (user.roles.includes(APP_ROLES.ADMIN)) {
    return profile;
  }

  const isOwner =
    user.roles.includes(APP_ROLES.TALENT) &&
    profile.ownerUserId === user.userId;

  const isPrimaryGuardian =
    user.roles.includes(APP_ROLES.GUARDIAN) &&
    profile.primaryGuardianUserId === user.userId;

  if (!isOwner && !isPrimaryGuardian) {
    throw new AuthorizationError();
  }

  return profile;
}

/**
 * List only profiles the current user is allowed to see.
 * ADMIN can list all profiles. TALENT and GUARDIAN are scoped to
 * their own ownership/primary-guardian relationships.
 */
export async function listAccessibleTalentProfiles() {
  const user = await requireAnyRole([
    APP_ROLES.TALENT,
    APP_ROLES.GUARDIAN,
    APP_ROLES.ADMIN,
  ]);

  const isAdmin = user.roles.includes(APP_ROLES.ADMIN);

  const ownershipFilters = [
    ...(user.roles.includes(APP_ROLES.TALENT)
      ? [{ ownerUserId: user.userId }]
      : []),
    ...(user.roles.includes(APP_ROLES.GUARDIAN)
      ? [{ primaryGuardianUserId: user.userId }]
      : []),
  ];

  return prisma.talentProfile.findMany({
    where: isAdmin ? {} : { OR: ownershipFilters },
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
      heightCm: true,
      gender: true,
      location: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}
