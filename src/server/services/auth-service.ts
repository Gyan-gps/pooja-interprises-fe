import "server-only";

import { getServerEnvironment } from "@/server/config/env";
import {
  hashPassword,
  isPasswordLongEnough,
  verifyPassword,
} from "@/server/auth/password";
import {
  signSessionJwt,
  verifySessionJwt,
} from "@/server/auth/session-token";
import {
  clearLoginRateLimit,
  consumeLoginRateLimit,
} from "@/server/auth/rate-limit";
import { ApiError } from "@/server/errors/api-error";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "@/server/repositories/user-repository";
import {
  createSession,
  deactivateSessionQuietly,
  findActiveSessionById,
} from "@/server/repositories/session-repository";
import type { UserRole } from "@/server/models/enums";

const GENERIC_LOGIN_ERROR_MESSAGE = "Invalid email or password.";

/** Precomputed bcrypt hash used only to keep failed-login timing steadier. */
const DUMMY_PASSWORD_HASH =
  "$2b$12$l7/2B6n7Lrg7bxkRQhSxY.rhusLby724KJCtVXS1AsWhmMddGvyey";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  user: AuthenticatedUser;
  sessionToken: string;
  expiresAt: Date;
}

export interface AuthContext {
  user: AuthenticatedUser;
  sessionId: string;
}

function buildExpiresAt(sessionTtlDays: number): Date {
  return new Date(Date.now() + sessionTtlDays * 24 * 60 * 60 * 1000);
}

export async function loginWithEmailPassword(input: {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<LoginResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const rateLimitKey = `${input.ipAddress ?? "unknown"}:${normalizedEmail}`;
  const rateLimit = consumeLoginRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    throw new ApiError("Too many login attempts. Please try again later.", {
      statusCode: 429,
      code: "RATE_LIMITED",
      details: { retryAfterSeconds: rateLimit.retryAfterSeconds },
    });
  }

  if (!normalizedEmail || !input.password) {
    throw new ApiError(GENERIC_LOGIN_ERROR_MESSAGE, {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const user = await findUserByEmail(normalizedEmail, {
    includePasswordHash: true,
  });

  if (!user?.passwordHash) {
    await verifyPassword(input.password, DUMMY_PASSWORD_HASH);
    throw new ApiError(GENERIC_LOGIN_ERROR_MESSAGE, {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const passwordMatches = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new ApiError(GENERIC_LOGIN_ERROR_MESSAGE, {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  const { SESSION_TTL_DAYS } = getServerEnvironment();
  const expiresAt = buildExpiresAt(SESSION_TTL_DAYS);

  const session = await createSession({
    userId: user._id,
    expiresAt,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const sessionToken = await signSessionJwt(
    {
      sessionId: session._id.toString(),
      userId: user._id.toString(),
      role: user.role,
    },
    expiresAt
  );

  clearLoginRateLimit(rateLimitKey);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    sessionToken,
    expiresAt,
  };
}

export async function logoutCurrentSession(
  sessionToken: string | undefined
): Promise<void> {
  if (!sessionToken) {
    return;
  }

  const payload = await verifySessionJwt(sessionToken);
  if (!payload) {
    return;
  }

  await deactivateSessionQuietly(payload.sessionId);
}

export async function resolveAuthContext(
  sessionToken: string | undefined
): Promise<AuthContext | null> {
  if (!sessionToken) {
    return null;
  }

  const payload = await verifySessionJwt(sessionToken);
  if (!payload) {
    return null;
  }

  const session = await findActiveSessionById(payload.sessionId);
  if (!session) {
    return null;
  }

  if (session.userId.toString() !== payload.userId) {
    return null;
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return null;
  }

  return {
    sessionId: payload.sessionId,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
}

export async function requireAdminAuth(
  sessionToken: string | undefined
): Promise<AuthContext> {
  const authContext = await resolveAuthContext(sessionToken);

  if (!authContext) {
    throw new ApiError("Authentication required.", {
      statusCode: 401,
      code: "UNAUTHENTICATED",
    });
  }

  if (authContext.user.role !== "Admin") {
    throw new ApiError("You do not have permission to perform this action.", {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }

  return authContext;
}

export async function ensureAdminUser(input: {
  email: string;
  password: string;
}): Promise<{ created: boolean; email: string }> {
  if (!isPasswordLongEnough(input.password)) {
    throw new ApiError("Password must be at least 8 characters.", {
      statusCode: 400,
      code: "WEAK_PASSWORD",
    });
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return { created: false, email: existingUser.email };
  }

  const passwordHash = await hashPassword(input.password);
  const createdUser = await createUser({
    email: normalizedEmail,
    passwordHash,
    role: "Admin",
  });

  return { created: true, email: createdUser.email };
}
