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
});

export type UpdateTalentProfileInput = z.infer<
  typeof updateTalentProfileSchema
>;
