import "server-only";

import { headers } from "next/headers";
import { readSessionCookie } from "@/server/auth/cookies";
import {
  requireAdminAuth,
  resolveAuthContext,
  type AuthContext,
} from "@/server/services/auth-service";

export async function getRequestAuthContext(): Promise<AuthContext | null> {
  const sessionToken = await readSessionCookie();
  return resolveAuthContext(sessionToken);
}

export async function requireRequestAdmin(): Promise<AuthContext> {
  const sessionToken = await readSessionCookie();
  return requireAdminAuth(sessionToken);
}

export async function getRequestClientMetadata(): Promise<{
  ipAddress: string;
  userAgent: string;
}> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  const userAgent = headerStore.get("user-agent") || "";

  return { ipAddress, userAgent };
}
