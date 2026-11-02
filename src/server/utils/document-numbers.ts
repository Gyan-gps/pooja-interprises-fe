/**
 * Pure document-number formatters (no I/O).
 * Sequence allocation lives in the sequence repository.
 */

export function formatOrderNumber(year: number, sequence: number): string {
  return `PJE-${year}-${String(sequence).padStart(3, "0")}`;
}

export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(3, "0")}`;
}
