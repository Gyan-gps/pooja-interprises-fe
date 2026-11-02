import "server-only";

/**
 * Redacts credentials that may appear in free-form error strings.
 */
export function redactSensitiveText(text: string): string {
  return text
    .replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, "mongodb$1://***@")
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer ***")
    .replace(/pe_session=[^;\s]+/gi, "pe_session=***")
    .replace(/(AUTH_SECRET|password|passwordHash)\s*[:=]\s*\S+/gi, "$1=***");
}

export function logServerError(context: string, error: unknown): void {
  const rawMessage =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  console.error(context, redactSensitiveText(rawMessage));
}
