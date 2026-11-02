"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type PendingUpdate = { key: string; value: string; defaultValue: string };

/**
 * Multiple useUrlState setters often fire in the same event handler (e.g. "Clear
 * advanced"). Each used to call router.replace from a stale snapshot, so only
 * the last write survived. Queue updates and flush once per microtask.
 */
let pending: PendingUpdate[] = [];
let flushScheduled = false;
let flushRouter: ReturnType<typeof useRouter> | null = null;
let flushPathname = "";
let flushParams = "";

function scheduleFlush() {
  if (flushScheduled) return;
  flushScheduled = true;
  queueMicrotask(() => {
    flushScheduled = false;
    if (!flushRouter || pending.length === 0) return;

    const merged = new URLSearchParams(flushParams);
    for (const { key, value, defaultValue } of pending) {
      if (value === defaultValue || value === "") merged.delete(key);
      else merged.set(key, value);
    }
    pending = [];

    const qs = merged.toString();
    flushRouter.replace(qs ? `${flushPathname}?${qs}` : flushPathname, { scroll: false });
  });
}

/**
 * A single string of URL search-param state, e.g. a list's search box or
 * status filter. Keeping it in the URL (rather than component state) makes
 * filtered/sorted views shareable links and survives a refresh.
 */
export function useUrlState(key: string, defaultValue: string): [string, (value: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      flushRouter = router;
      flushPathname = pathname;
      flushParams = params.toString();
      pending.push({ key, value: next, defaultValue });
      scheduleFlush();
    },
    [key, defaultValue, params, pathname, router]
  );

  return [value, setValue];
}
