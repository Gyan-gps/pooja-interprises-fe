/**
 * Creates the first Admin user if it does not already exist.
 *
 * Usage:
 *   npx tsx --import ./scripts/alias-server-only.mjs ./scripts/seed-admin.ts
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from the environment (.env supported via manual load).
 */
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { ensureAdminUser } from "../src/server/services/auth-service";

function loadEnvFile(): void {
  try {
    const envFile = readFileSync(".env", "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1);
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env may be absent when vars are provided by the shell.
  }
}

async function main(): Promise<void> {
  loadEnvFile();

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  const result = await ensureAdminUser({ email, password });
  console.log(
    result.created
      ? `Created admin user: ${result.email}`
      : `Admin user already exists: ${result.email}`
  );
}

main()
  .catch((error) => {
    console.error("seed-admin failed");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
