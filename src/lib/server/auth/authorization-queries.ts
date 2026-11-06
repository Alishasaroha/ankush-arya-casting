export interface AccessibleProfileQueryUser {
  userId: string;
  roles: readonly string[];
}

/**
 * Build the Prisma where-clause used by the account dashboard.
 * Keep the relation filter here so it can be exercised against PostgreSQL
 * by integration tests without requiring a browser session.
 */
export function buildAccessibleTalentProfileWhere(
  user: AccessibleProfileQueryUser,
) {
  if (user.roles.includes("ADMIN")) {
    return {};
  }

  const ownershipFilters = [
    ...(user.roles.includes("TALENT")
      ? [{ ownerUserId: user.userId }]
      : []),
    ...(user.roles.includes("GUARDIAN")
      ? [{ primaryGuardianUserId: user.userId }]
      : []),
    ...(user.roles.includes("MANAGER")
      ? [{
          managerAccessGrants: {
            some: { managerUserId: user.userId, revokedAt: null },
          },
        }]
      : []),
  ];

  return { OR: ownershipFilters };
}
