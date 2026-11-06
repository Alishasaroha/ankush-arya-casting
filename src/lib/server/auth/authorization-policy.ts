export interface ProfileAccessUser {
  userId: string;
  roles: readonly string[];
}

export interface ProfileAccessTarget {
  ownerUserId: string | null;
  primaryGuardianUserId: string | null;
}

export interface ProfileAccessPermissions {
  canRead: boolean;
  canEdit: boolean;
  canManageManagerAccess: boolean;
  isManagerView: boolean;
}

/**
 * Pure policy decision for a single talent profile.
 *
 * ADMIN can read/edit agency-wide but cannot grant consent on another user's
 * behalf. Owners and assigned guardians can read, edit, and manage manager
 * grants. A MANAGER requires an active profile-specific grant and receives
 * read-only access.
 */
export function resolveTalentProfileAccess(
  user: ProfileAccessUser,
  profile: ProfileAccessTarget,
  hasActiveManagerGrant = false,
): ProfileAccessPermissions | null {
  const roles = new Set(user.roles);

  const isAdmin = roles.has("ADMIN");
  const isOwner =
    roles.has("TALENT") && profile.ownerUserId === user.userId;
  const isPrimaryGuardian =
    roles.has("GUARDIAN") &&
    profile.primaryGuardianUserId === user.userId;

  if (isAdmin) {
    return {
      canRead: true,
      canEdit: true,
      canManageManagerAccess: false,
      isManagerView: false,
    };
  }

  if (isOwner || isPrimaryGuardian) {
    return {
      canRead: true,
      canEdit: true,
      canManageManagerAccess: true,
      isManagerView: false,
    };
  }

  if (roles.has("MANAGER") && hasActiveManagerGrant) {
    return {
      canRead: true,
      canEdit: false,
      canManageManagerAccess: false,
      isManagerView: true,
    };
  }

  return null;
}

/**
 * Consent authority is deliberately narrower than admin/edit authority:
 * only the profile's owner or assigned primary guardian can grant or revoke
 * a manager's access.
 */
export function canManageTalentProfileManagerGrants(
  user: ProfileAccessUser,
  profile: ProfileAccessTarget,
): boolean {
  const roles = new Set(user.roles);

  return (
    (roles.has("TALENT") && profile.ownerUserId === user.userId) ||
    (roles.has("GUARDIAN") &&
      profile.primaryGuardianUserId === user.userId)
  );
}
