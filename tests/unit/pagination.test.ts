import { describe, expect, it } from "vitest";
import {
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  normalizePagination,
} from "@/server/utils/pagination";

describe("normalizePagination", () => {
  it("applies defaults", () => {
    expect(normalizePagination()).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
    });
  });

  it("clamps pageSize to the maximum", () => {
    expect(normalizePagination({ page: 2, pageSize: 500 })).toEqual({
      page: 2,
      pageSize: MAX_PAGE_SIZE,
      skip: MAX_PAGE_SIZE,
    });
  });

  it("rejects non-positive page values", () => {
    expect(normalizePagination({ page: 0, pageSize: 5 })).toEqual({
      page: 1,
      pageSize: 5,
      skip: 0,
    });
  });
});

describe("createPaginatedResult", () => {
  it("computes total pages", () => {
    expect(createPaginatedResult(["a", "b"], 25, 1, 10).totalPages).toBe(3);
  });

  it("returns zero pages for empty collections", () => {
    expect(createPaginatedResult([], 0, 1, 10).totalPages).toBe(0);
  });
});
