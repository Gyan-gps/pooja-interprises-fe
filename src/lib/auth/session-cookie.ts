/**
 * Edge-safe session JWT helpers for middleware.
 * Do not import server-only modules here.
 */
import { jwtVerify } from "jose/jwt/verify";

export const SESSION_COOKIE_NAME = "pe_session";

export interface EdgeSessionPayload {
  sessionId: string;
  userId: string;
  role: "Admin";
}

export async function verifySessionJwtInEdge(
  token: string,
  authSecret: string
): Promise<EdgeSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(authSecret),
      { algorithms: ["HS256"] }
    );

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
