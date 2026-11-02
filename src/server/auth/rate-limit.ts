import "server-only";

interface RateLimitBucket {
  attemptCount: number;
  windowStartedAt: number;
}

const loginAttemptBuckets = new Map<string, RateLimitBucket>();

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;

/**
 * Simple in-memory rate limiter for login attempts.
 * Suitable for a single Node process; replace with Redis for multi-instance deploys.
 */
export function consumeLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const existingBucket = loginAttemptBuckets.get(key);

  if (
    !existingBucket ||
    now - existingBucket.windowStartedAt >= LOGIN_RATE_LIMIT_WINDOW_MS
  ) {
    loginAttemptBuckets.set(key, {
      attemptCount: 1,
      windowStartedAt: now,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existingBucket.attemptCount >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil(
      (LOGIN_RATE_LIMIT_WINDOW_MS - (now - existingBucket.windowStartedAt)) /
        1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  existingBucket.attemptCount += 1;
  loginAttemptBuckets.set(key, existingBucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearLoginRateLimit(key: string): void {
  loginAttemptBuckets.delete(key);
}
