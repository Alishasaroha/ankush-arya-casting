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
  languages: true,
  experienceYears: true,
  experienceSummary: true,
  instagramHandle: true,
  introVideoUrl: true,
  links: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      type: true,
      title: true,
      url: true,
      sortOrder: true,
    },
  },
  photos: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      id: true,
      url: true,
      altText: true,
      sortOrder: true,
    },
  },
  updatedAt: true,
} as const;

export async function getTalentProfile(profileId: string) {
  const profile = await requireTalentProfileAccess(profileId);

  const {
    ownerUserId: _ownerUserId,
    primaryGuardianUserId: _primaryGuardianUserId,
    ...safeProfile
  } = profile;

  return safeProfile;
}

/**
 * Replace editable fields and ordered related records after a record-level
 * permission check. Owner and guardian relationships are never client-editable.
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
    languages,
    experienceYears,
    experienceSummary,
    instagramHandle,
    introVideoUrl,
    previousWorkLinks,
    portfolioLinks,
    photos,
  } = input;

  const links = [
    ...previousWorkLinks.map((link, sortOrder) => ({
      ...link,
      type: "PREVIOUS_WORK" as const,
      sortOrder,
    })),
    ...portfolioLinks.map((link, sortOrder) => ({
      ...link,
      type: "PORTFOLIO" as const,
      sortOrder,
    })),
  ];

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
      languages,
      experienceYears,
      experienceSummary: experienceSummary || null,
      instagramHandle: instagramHandle
        ? instagramHandle.replace(/^@/, "")
        : null,
      introVideoUrl: introVideoUrl || null,
      links: {
        deleteMany: {},
        create: links.map((link) => ({
          type: link.type,
          title: link.title,
          url: link.url,
          sortOrder: link.sortOrder,
        })),
      },
      photos: {
        deleteMany: {},
        create: photos.map((photo, sortOrder) => ({
          url: photo.url,
          altText: photo.altText || null,
          sortOrder,
        })),
      },
    },
    select: profileDetailsSelect,
  });
}
