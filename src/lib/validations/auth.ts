import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  // Login only requires a non-empty password; strength is enforced at account creation.
  password: z.string().min(1, "Password is required."),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
