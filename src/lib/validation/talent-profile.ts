import { z } from "zod";

const dateOfBirthSchema = z.string().refine(
  (value) => {
    if (value === "") {
      return true;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  },
  "Enter a valid date of birth",
);

const secureUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use an HTTPS link");

const profileLinkSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(120),
  url: secureUrlSchema,
});

const photoSchema = z.object({
  url: secureUrlSchema,
  altText: z.string().trim().max(200).optional().default(""),
});

export const talentProfileIdSchema = z.object({
  profileId: z.string().uuid("Invalid talent profile"),
});

export const updateTalentProfileSchema = z.object({
  profileId: z.string().uuid("Invalid talent profile"),
  fullName: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  dateOfBirth: dateOfBirthSchema,
  heightCm: z
    .number()
    .int("Height must be a whole number")
    .min(30, "Height must be at least 30 cm")
    .max(250, "Height cannot exceed 250 cm")
    .nullable(),
  gender: z.string().trim().max(50, "Gender cannot exceed 50 characters"),
  location: z.string().trim().max(150, "Location cannot exceed 150 characters"),
  bio: z.string().trim().max(2000, "Bio cannot exceed 2,000 characters"),

  languages: z
    .array(z.string().trim().min(1).max(60))
    .max(20, "You can add up to 20 languages")
    .transform((items) => [...new Set(items)]),
  experienceYears: z
    .number()
    .int()
    .min(0, "Experience cannot be negative")
    .max(80, "Please enter a realistic number of years")
    .nullable(),
  experienceSummary: z.string().trim().max(2000),
  instagramHandle: z
    .string()
    .trim()
    .max(31)
    .refine(
      (value) => value === "" || /^@?[A-Za-z0-9._]{1,30}$/.test(value),
      "Enter an Instagram handle without a URL",
    ),
  introVideoUrl: z.union([z.literal(""), secureUrlSchema]),
  previousWorkLinks: z.array(profileLinkSchema).max(30),
  portfolioLinks: z.array(profileLinkSchema).max(30),
  photos: z.array(photoSchema).max(30),
});

export type UpdateTalentProfileInput = z.infer<
  typeof updateTalentProfileSchema
>;
