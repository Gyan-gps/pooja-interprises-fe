import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * A single string of URL search-param state, e.g. a list's search box or
 * status filter. Keeping it in the URL (rather than component state) makes
 * filtered/sorted views shareable links and survives a refresh.
 */
export function useUrlState(key: string, defaultValue: string): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? defaultValue;

  const setValue = useCallback(
    (next: string) => {
      setParams(
        prev => {
          const merged = new URLSearchParams(prev);
          if (next === defaultValue || next === "") merged.delete(key);
          else merged.set(key, next);
          return merged;
        },
        { replace: true }
      );
    },
    [key, defaultValue, setParams]
  );

  return [value, setValue];
}
