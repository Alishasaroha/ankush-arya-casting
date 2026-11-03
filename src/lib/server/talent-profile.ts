import { prisma } from "./prisma";
import { requireTalentProfileAccess } from "./auth/authorization";
import type { UpdateTalentProfileInput } from "../validation/talent-profile";

const profileDetailsSelect = {
  id: true,
  fullName: true,
  dateOfBirth: true,
  heightCm: true,
  gender: true,
  location: true,
  bio: true,
  updatedAt: true,
} as const;

/**
 * Return profile details only after the current user passes record-level
 * authorization. Ownership and guardian relationship fields stay server-side.
 */
export async function getTalentProfile(profileId: string) {
  const profile = await requireTalentProfileAccess(profileId);

  return {
    id: profile.id,
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    heightCm: profile.heightCm,
    gender: profile.gender,
    location: profile.location,
    bio: profile.bio,
    updatedAt: profile.updatedAt,
  };
}

/**
 * Update editable profile fields after checking the caller's relationship
 * with this specific profile. Ownership/guardian fields are never client-editable.
 */
export async function updateTalentProfile(input: UpdateTalentProfileInput) {
  await requireTalentProfileAccess(input.profileId);

  const {
    profileId,
    fullName,
    dateOfBirth,
    heightCm,
    gender,
    location,
    bio,
  } = input;

  return prisma.talentProfile.update({
    where: { id: profileId },
    data: {
      fullName,
      dateOfBirth: dateOfBirth
        ? new Date(`${dateOfBirth}T00:00:00.000Z`)
        : null,
      heightCm,
      gender: gender || null,
      location: location || null,
      bio: bio || null,
    },
    select: profileDetailsSelect,
  });
}
