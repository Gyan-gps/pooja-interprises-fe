import "server-only";

import { z } from "zod";

const PLACEHOLDER_AUTH_SECRET_PATTERN =
  /replace-with|change-me|example|your-secret|password123/i;

const serverEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_MONGODB_URL: z
    .string()
    .trim()
    .min(1, "NEXT_MONGODB_URL is required"),
  AUTH_SECRET: z
    .string()
    .trim()
    .min(32, "AUTH_SECRET must be at least 32 characters")
    .superRefine((value, context) => {
      if (process.env.NODE_ENV !== "production") return;
      if (PLACEHOLDER_AUTH_SECRET_PATTERN.test(value)) {
        context.addIssue({
          code: "custom",
          message:
            "AUTH_SECRET looks like a placeholder; set a strong unique secret in production",
        });
      }
    }),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

let cachedServerEnvironment: ServerEnvironment | undefined;

/**
 * Lazily validates and returns server environment variables.
 * Does not connect to any external service.
 */
export function getServerEnvironment(): ServerEnvironment {
  if (cachedServerEnvironment) {
    return cachedServerEnvironment;
  }

  const parsedEnvironment = serverEnvironmentSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_MONGODB_URL: process.env.NEXT_MONGODB_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
  });

  if (!parsedEnvironment.success) {
    const issueSummary = parsedEnvironment.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid server environment: ${issueSummary}`);
  }

  cachedServerEnvironment = parsedEnvironment.data;
  return cachedServerEnvironment;
}
