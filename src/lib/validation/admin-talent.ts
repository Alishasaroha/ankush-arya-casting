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
