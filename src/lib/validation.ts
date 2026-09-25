/** Small, composable field validators shared by every create/edit form. */

export function required(value: string, message = "This field is required."): string | undefined {
  return value.trim() ? undefined : message;
}

export function mobileNumber(value: string, message = "Enter a 10-digit mobile number."): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Mobile number is required.";
  return digits.length === 10 ? undefined : message;
}

export function formatMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  return `${digits.slice(0, 5)} ${digits.slice(5)}`.trim();
}

export function uniqueBy<T>(
  value: string,
  items: T[],
  accessor: (item: T) => string,
  message: string
): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return items.some(item => accessor(item).toLowerCase() === normalized) ? message : undefined;
}

export function positiveInteger(value: string, message = "Enter a quantity greater than 0."): string | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? undefined : message;
}
