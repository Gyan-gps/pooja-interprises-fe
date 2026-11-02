import "server-only";

import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { getServerEnvironment } from "@/server/config/env";
import { SESSION_COOKIE_NAME } from "@/server/auth/session-token";

function getSessionCookieOptions(
  expiresAt: Date
): Partial<ResponseCookie> {
  const { NODE_ENV } = getServerEnvironment();

  return {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  };
}

export async function setSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt));
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function readSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export function buildSetSessionCookieHeader(
  token: string,
  expiresAt: Date
): string {
  const { NODE_ENV } = getServerEnvironment();
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ];

  if (NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function buildClearSessionCookieHeader(): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}
