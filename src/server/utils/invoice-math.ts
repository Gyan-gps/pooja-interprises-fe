export interface InvoiceLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface NormalizedInvoiceLineItem extends InvoiceLineItemInput {
  amount: number;
}

export interface InvoiceTotals {
  normalizedLineItems: NormalizedInvoiceLineItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
}

/**
 * Calculates invoice line amounts, GST, and total.
 * Money values are rounded to 2 decimal places.
 */
export function calculateInvoiceTotals(
  lineItems: InvoiceLineItemInput[],
  gstRate: number
): InvoiceTotals {
  const normalizedLineItems = lineItems.map((item) => {
    const amount = Number((item.quantity * item.unitPrice).toFixed(2));
    return {
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount,
    };
  });

  const subtotal = Number(
    normalizedLineItems
      .reduce((sum, item) => sum + item.amount, 0)
      .toFixed(2)
  );
  const gstAmount = Number(((subtotal * gstRate) / 100).toFixed(2));
  const total = Number((subtotal + gstAmount).toFixed(2));

  return { normalizedLineItems, subtotal, gstAmount, total };
}
