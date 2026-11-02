import { describe, expect, it } from "vitest";
import {
  clearLoginRateLimit,
  consumeLoginRateLimit,
} from "@/server/auth/rate-limit";

describe("consumeLoginRateLimit", () => {
  it("allows up to 10 attempts in a window", () => {
    const key = `test-allow-${Date.now()}-${Math.random()}`;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      expect(consumeLoginRateLimit(key).allowed).toBe(true);
    }

    const blocked = consumeLoginRateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    clearLoginRateLimit(key);
  });

  it("clears the bucket after a successful reset", () => {
    const key = `test-clear-${Date.now()}-${Math.random()}`;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      consumeLoginRateLimit(key);
    }

    expect(consumeLoginRateLimit(key).allowed).toBe(false);
    clearLoginRateLimit(key);
    expect(consumeLoginRateLimit(key).allowed).toBe(true);
    clearLoginRateLimit(key);
  });
});
