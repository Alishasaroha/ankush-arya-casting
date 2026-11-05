import { z } from "zod";

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isUnderEighteen(value: string): boolean {
  if (!isValidIsoDate(value)) return false;

  const birthDate = new Date(`${value}T00:00:00.000Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();

  const birthdayNotReached =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());

  if (birthdayNotReached) age -= 1;
  return age >= 0 && age < 18;
}

export const guardianChildProfileSchema = z.object({
  childName: z
    .string()
    .trim()
    .min(2, "Child name must contain at least 2 characters")
    .max(100, "Child name cannot exceed 100 characters"),
  dateOfBirth: z
    .string()
    .refine(isValidIsoDate, "Enter a valid date of birth")
    .refine(
      isUnderEighteen,
      "Child artists must be under 18. Adults should register as actors.",
    ),
  guardianRelationship: z
    .string()
    .trim()
    .min(2, "Enter your relationship to the child")
    .max(80, "Relationship cannot exceed 80 characters"),
  guardianConsent: z
    .boolean()
    .refine(
      (value) => value,
      "Confirm that you are authorized to create and manage this child profile.",
    ),
});

export type GuardianChildProfileInput = z.infer<
  typeof guardianChildProfileSchema
>;

export const registerGuardianSchema = guardianChildProfileSchema
  .extend({
    guardianName: z
      .string()
      .trim()
      .min(2, "Guardian name must contain at least 2 characters")
      .max(100, "Guardian name cannot exceed 100 characters"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),
    confirmPassword: z
      .string()
      .max(128, "Password cannot exceed 128 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterGuardianInput = z.infer<typeof registerGuardianSchema>;
