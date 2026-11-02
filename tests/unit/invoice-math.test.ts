import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals } from "@/server/utils/invoice-math";

describe("calculateInvoiceTotals", () => {
  it("computes subtotal, GST, and total", () => {
    const result = calculateInvoiceTotals(
      [
        { description: " Notebooks ", quantity: 10, unitPrice: 12.5 },
        { description: "Covers", quantity: 2, unitPrice: 100 },
      ],
      18
    );

    expect(result.normalizedLineItems[0]?.description).toBe("Notebooks");
    expect(result.normalizedLineItems[0]?.amount).toBe(125);
    expect(result.normalizedLineItems[1]?.amount).toBe(200);
    expect(result.subtotal).toBe(325);
    expect(result.gstAmount).toBe(58.5);
    expect(result.total).toBe(383.5);
  });

  it("rounds money values to two decimals", () => {
    const result = calculateInvoiceTotals(
      [{ description: "Item", quantity: 3, unitPrice: 10.333 }],
      18
    );

    expect(result.normalizedLineItems[0]?.amount).toBe(31);
    expect(result.subtotal).toBe(31);
    expect(result.gstAmount).toBe(5.58);
    expect(result.total).toBe(36.58);
  });
});
