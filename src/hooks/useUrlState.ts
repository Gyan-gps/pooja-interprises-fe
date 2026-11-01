"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
      const merged = new URLSearchParams(params.toString());
      if (next === defaultValue || next === "") merged.delete(key);
      else merged.set(key, next);
      const qs = merged.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, defaultValue, params, pathname, router]
  );

  return [value, setValue];
}
