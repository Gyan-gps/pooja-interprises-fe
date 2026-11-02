import { describe, expect, it } from "vitest";
import {
  formatInvoiceNumber,
  formatOrderNumber,
} from "@/server/utils/document-numbers";

describe("document number formatters", () => {
  it("pads order sequences", () => {
    expect(formatOrderNumber(2026, 1)).toBe("PJE-2026-001");
    expect(formatOrderNumber(2026, 42)).toBe("PJE-2026-042");
    expect(formatOrderNumber(2026, 100)).toBe("PJE-2026-100");
  });

  it("pads invoice sequences", () => {
    expect(formatInvoiceNumber(2026, 7)).toBe("INV-2026-007");
  });
});
