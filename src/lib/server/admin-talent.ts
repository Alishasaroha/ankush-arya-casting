import type { Prisma } from "../../generated/prisma/client";

import { prisma } from "./prisma";
import { requireRole, APP_ROLES } from "./auth/authorization";
import type { AdminTalentDirectoryInput } from "../validation/admin-talent";

const PAGE_SIZE = 20;

function subtractYearsFromToday(years: number): Date {
  const today = new Date();
  const year = today.getUTCFullYear() - years;
  const month = today.getUTCMonth();
  const day = today.getUTCDate();
  const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  return new Date(
    Date.UTC(year, month, Math.min(day, lastDayOfTargetMonth)),
  );
}

/**
 * Search the agency-wide talent directory.
 *
 * The ADMIN role is checked inside this server-only function. Filters,
 * counts, and pagination are all applied in PostgreSQL.
 */
export async function searchAdminTalentProfiles(
  filters: AdminTalentDirectoryInput,
) {
  await requireRole(APP_ROLES.ADMIN);

  const conditions: Prisma.TalentProfileWhereInput[] = [];

  if (filters.search) {
    conditions.push({
      OR: [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { location: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.gender) {
    conditions.push({
      gender: { contains: filters.gender, mode: "insensitive" },
    });
  }

  if (filters.language) {
    conditions.push({ languages: { has: filters.language } });
  }

  const dateOfBirth: Prisma.DateTimeFilter = {};
  if (filters.minAge !== null) {
    dateOfBirth.lte = subtractYearsFromToday(filters.minAge);
  }
  if (filters.maxAge !== null) {
    dateOfBirth.gt = subtractYearsFromToday(filters.maxAge + 1);
  }
  if (Object.keys(dateOfBirth).length > 0) {
    conditions.push({ dateOfBirth });
  }

  const heightCm: Prisma.IntNullableFilter<"TalentProfile"> = {};
  if (filters.minHeightCm !== null) {
    heightCm.gte = filters.minHeightCm;
  }
  if (filters.maxHeightCm !== null) {
    heightCm.lte = filters.maxHeightCm;
  }
  if (Object.keys(heightCm).length > 0) {
    conditions.push({ heightCm });
  }

  const experienceYears: Prisma.IntNullableFilter<"TalentProfile"> = {};
  if (filters.minExperienceYears !== null) {
    experienceYears.gte = filters.minExperienceYears;
  }
  if (filters.maxExperienceYears !== null) {
    experienceYears.lte = filters.maxExperienceYears;
  }
  if (Object.keys(experienceYears).length > 0) {
    conditions.push({ experienceYears });
  }

  const where: Prisma.TalentProfileWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [profiles, total] = await prisma.$transaction([
    prisma.talentProfile.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        heightCm: true,
        gender: true,
        location: true,
        languages: true,
        experienceYears: true,
        updatedAt: true,
      },
      orderBy: [{ updatedAt: "desc" }, { fullName: "asc" }],
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.talentProfile.count({ where }),
  ]);

  return {
    profiles,
    total,
    page: filters.page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
