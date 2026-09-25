const PREFIX = "pje:v1:";

/**
 * Thin, versioned localStorage wrapper. Bump PREFIX if a stored shape ever
 * changes incompatibly — old keys are simply ignored, not migrated.
 */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private browsing, quota) — the UI still
    // works for the session, it just won't persist. Not worth surfacing.
  }
}
