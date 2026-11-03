import { z } from "zod";

const optionalRangeValue = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable();

export const adminTalentDirectorySchema = z
  .object({
    search: z.string().trim().max(100).default(""),
    gender: z.string().trim().max(50).default(""),
    language: z.string().trim().max(60).default(""),
    minAge: optionalRangeValue(0, 120).optional().default(null),
    maxAge: optionalRangeValue(0, 120).optional().default(null),
    minHeightCm: optionalRangeValue(30, 250).optional().default(null),
    maxHeightCm: optionalRangeValue(30, 250).optional().default(null),
    minExperienceYears: optionalRangeValue(0, 80).optional().default(null),
    maxExperienceYears: optionalRangeValue(0, 80).optional().default(null),
    page: z.number().int().min(1).max(100_000).default(1),
  })
  .superRefine((filters, context) => {
    const ranges = [
      ["minAge", "maxAge"],
      ["minHeightCm", "maxHeightCm"],
      ["minExperienceYears", "maxExperienceYears"],
    ] as const;

    for (const [minimumKey, maximumKey] of ranges) {
      const minimum = filters[minimumKey];
      const maximum = filters[maximumKey];

      if (minimum !== null && maximum !== null && minimum > maximum) {
        context.addIssue({
          code: "custom",
          path: [maximumKey],
          message: "Maximum must be greater than or equal to minimum",
        });
      }
    }
  });

export type AdminTalentDirectoryInput = z.infer<
  typeof adminTalentDirectorySchema
>;


const adminCreateDateSchema = z.string().refine(
  (value) => {
    if (value === "") return true;

    const date = new Date(value + "T00:00:00.000Z");
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  },
  "Enter a valid date of birth",
);

export const createAdminTalentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  dateOfBirth: adminCreateDateSchema.default(""),
  heightCm: z.number().int().min(30).max(250).nullable(),
  gender: z.string().trim().max(50).default(""),
  location: z.string().trim().max(150).default(""),
  bio: z.string().trim().max(2000).default(""),
  languages: z
    .array(z.string().trim().min(1).max(60))
    .max(20)
    .transform((items) => [...new Set(items)]),
  experienceYears: z.number().int().min(0).max(80).nullable(),
  experienceSummary: z.string().trim().max(2000).default(""),
});

export type CreateAdminTalentProfileInput = z.infer<
  typeof createAdminTalentProfileSchema
>;
