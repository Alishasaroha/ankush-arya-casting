import { z } from "zod";

export const grantManagerAccessSchema = z.object({
  profileId: z.string().uuid(),
  managerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter the email address of a registered manager account"),
});

export const revokeManagerAccessSchema = z.object({
  profileId: z.string().uuid(),
  managerUserId: z.string().uuid(),
});

export type GrantManagerAccessInput = z.infer<typeof grantManagerAccessSchema>;
export type RevokeManagerAccessInput = z.infer<typeof revokeManagerAccessSchema>;

export const managerRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string().max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ManagerRegistrationInput = z.infer<typeof managerRegistrationSchema>;
