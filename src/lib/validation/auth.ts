import {z} from "zod";
export const registerSchema = z.object({
    email:z.string().trim().toLowerCase().email("Please enter a valid email address"),
    password: z.string().min(8,"Password must be at least 8 characters")
    .max(128,"Password cannot exceed 128 characters"),

    confirmPassword : z.string(),
})
.refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
);
export type RegisterInput = z.infer<typeof registerSchema>;