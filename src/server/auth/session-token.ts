import "server-only";

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { getServerEnvironment } from "@/server/config/env";
import type { UserRole } from "@/server/models/enums";

export const SESSION_COOKIE_NAME = "pe_session";

export interface SessionTokenPayload {
  sessionId: string;
  userId: string;
  role: UserRole;
}

function getAuthSecretKey(): Uint8Array {
  const { AUTH_SECRET } = getServerEnvironment();
  return new TextEncoder().encode(AUTH_SECRET);
}

export async function signSessionJwt(
  payload: SessionTokenPayload,
  expiresAt: Date
): Promise<string> {
  return new SignJWT({
    sid: payload.sessionId,
    sub: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getAuthSecretKey());
}

export async function verifySessionJwt(
  token: string
): Promise<SessionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecretKey(), {
      algorithms: ["HS256"],
    });

    const sessionId = typeof payload.sid === "string" ? payload.sid : null;
    const userId = typeof payload.sub === "string" ? payload.sub : null;
    const role = payload.role === "Admin" ? "Admin" : null;

    if (!sessionId || !userId || !role) {
      return null;
    }

    return { sessionId, userId, role };
  } catch {
    return null;
  }
}
