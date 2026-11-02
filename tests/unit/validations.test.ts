import { describe, expect, it } from "vitest";
import { objectIdSchema, paginationQuerySchema } from "@/lib/validations/common";
import { MINIMUM_PASSWORD_LENGTH } from "@/lib/auth/password-rules";

describe("objectIdSchema", () => {
  it("accepts valid ObjectIds", () => {
    expect(objectIdSchema.parse("6ae8d2b723d82d6cb6b5567b")).toBe(
      "6ae8d2b723d82d6cb6b5567b"
    );
  });

  it("rejects invalid ObjectIds", () => {
    expect(() => objectIdSchema.parse("not-an-id")).toThrow();
  });
});

describe("paginationQuerySchema", () => {
  it("coerces and caps pageSize", () => {
    expect(paginationQuerySchema.parse({ page: "2", pageSize: "50" })).toEqual({
      page: 2,
      pageSize: 50,
    });
    expect(() => paginationQuerySchema.parse({ pageSize: "101" })).toThrow();
  });
});

describe("password rules", () => {
  it("exposes the minimum password length", () => {
    expect(MINIMUM_PASSWORD_LENGTH).toBeGreaterThanOrEqual(8);
  });
});
