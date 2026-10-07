import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { readStorage, writeStorage } from "../lib/storage";

const STORAGE_KEY = "zoomEnabled";
const DEFAULT_ZOOM_FACTOR = 4;
const DEFAULT_LENS_SIZE = 300; // px diameter
const CLONE_REFRESH_MS = 400; // keeps the lens reasonably in sync with live content

/** True while the user is typing into a field — the shortcut must never hijack real input. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Form controls don't reflect their live value/checked state through cloneNode (those are DOM
 *  properties set by user interaction, not HTML attributes) — copy them across so the lens shows
 *  what's actually on screen, not just the initial markup. */
function syncLiveFormState(source: Element, clone: Element) {
  const sourceControls = source.querySelectorAll("input, textarea, select");
  const cloneControls = clone.querySelectorAll("input, textarea, select");
  sourceControls.forEach((el, i) => {
    const target = cloneControls[i];
    if (!target) return;
    if (el instanceof HTMLInputElement && target instanceof HTMLInputElement) {
      target.checked = el.checked;
      target.value = el.value;
    } else if (
      (el instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) ||
      (el instanceof HTMLSelectElement && target instanceof HTMLSelectElement)
    ) {
      target.value = el.value;
    }
  });
}

interface UseZoomOptions {
  /** How much the lens magnifies its contents. Defaults to 2.2x. */
  zoomFactor?: number;
  /** Lens diameter in pixels. Defaults to 200. */
  lensSize?: number;
}

interface UseZoomResult {
  /** Current on/off preference. Frontend-only for now — see hook doc below. */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  /** Attach to the one content area the magnifier should work over. */
  containerRef: RefObject<HTMLDivElement>;
}

/**
 * A circular magnifier that follows the cursor over one content area (never
 * the chrome around it — callers decide what to wrap, e.g. the routed page
 * content but not the sidebar or header).
 *
 * While `enabled`, hovering the wrapped container shows a small circular lens
 * at the cursor, displaying a magnified, live-ish copy of the content under
 * it. The lens is a `pointer-events: none` visual duplicate appended to
 * `document.body` — the real content underneath is never touched, moved, or
 * resized, so scrolling, clicks, focus, keyboard navigation and form
 * interaction all keep working exactly as before.
 *
 * State note: `enabled` is local + localStorage today. The moment a backend
 * user-preferences endpoint exists, replace the body of this hook's state
 * (the `useState`/`useEffect` pair below) with that fetched/saved value —
 * `containerRef` and every call site stay identical.
 */
export function useZoom(options?: UseZoomOptions): UseZoomResult {
  const zoomFactor = options?.zoomFactor ?? DEFAULT_ZOOM_FACTOR;
  const lensSize = options?.lensSize ?? DEFAULT_LENS_SIZE;

  const [enabled, setEnabledState] = useState(() => readStorage(STORAGE_KEY, false));
  const containerRef = useRef<HTMLDivElement>(null);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    writeStorage(STORAGE_KEY, value);
  }, []);

  // Ctrl+Shift+Z toggles zoom; Escape always turns it off.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setEnabled(false);
        return;
      }
      console.log(e.code, e.key, e.ctrlKey, e.shiftKey, e.altKey, e.metaKey);
      // e.code (not e.key) so it works on any keyboard layout.
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || e.code !== "Space") return;
      // Leave Ctrl+Shift+Z alone inside fields, where it means "redo".
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
      setEnabledState(prev => {
        writeStorage(STORAGE_KEY, !prev);
        return !prev;
      });
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setEnabled]);

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const lens = document.createElement("div");
    lens.setAttribute("aria-hidden", "true");
    Object.assign(lens.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      borderRadius: "50%",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: "9999",
      border: "3px solid #E84C1E",
      boxShadow: "0 10px 30px rgba(20,20,20,0.25)",
      background: "#fff",
      display: "none",
    } satisfies Partial<CSSStyleDeclaration>);

    const inner = document.createElement("div");
    Object.assign(inner.style, {
      position: "absolute",
      top: "0",
      left: "0",
      transformOrigin: "0 0",
    } satisfies Partial<CSSStyleDeclaration>);
    lens.appendChild(inner);
    document.body.appendChild(lens);

    let clone: HTMLElement | null = null;

    /** cloneNode doesn't carry scroll offsets, so a cloned scroll area (e.g. <main>) would
     *  always show its top. Copy each scrolled element's offsets onto its clone counterpart.
     *  Must run while the clone is attached and visible, or scrollTop assignments are ignored. */
    function syncScroll() {
      if (!clone) return;
      const sourceEls = container!.querySelectorAll("*");
      const cloneEls = clone.querySelectorAll("*");
      sourceEls.forEach((el, i) => {
        const target = cloneEls[i];
        if (!target) return;
        if (target.scrollTop !== el.scrollTop) target.scrollTop = el.scrollTop;
        if (target.scrollLeft !== el.scrollLeft) target.scrollLeft = el.scrollLeft;
      });
    }

    function refreshClone() {
      const rect = container!.getBoundingClientRect();
      inner.style.width = `${rect.width}px`;
      inner.style.height = `${rect.height}px`;
      clone = container!.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
      syncLiveFormState(container!, clone);
      inner.replaceChildren(clone);
      syncScroll();
    }

    function positionLens(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      const relX = clamp(clientX - rect.left, 0, rect.width);
      const relY = clamp(clientY - rect.top, 0, rect.height);
      const offsetX = lensSize / 2 - relX * zoomFactor;
      const offsetY = lensSize / 2 - relY * zoomFactor;
      inner.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${zoomFactor})`;
      lens.style.transform = `translate(${clientX - lensSize / 2}px, ${clientY - lensSize / 2}px)`;
    }

    let rafId: number | null = null;
    function handleMove(e: MouseEvent) {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        positionLens(e.clientX, e.clientY);
      });
    }

    function handleEnter(e: MouseEvent) {
      lens.style.display = "block"; // before cloning, so syncScroll can apply offsets
      refreshClone();
      positionLens(e.clientX, e.clientY);
      container!.style.cursor = "none";
    }

    function handleLeave() {
      lens.style.display = "none";
      container!.style.cursor = "";
    }

    // Keeps the lens showing roughly-current content (e.g. a value being typed)
    // without re-cloning on every mousemove, which would be wasteful.
    const refreshTimer = window.setInterval(() => {
      if (lens.style.display !== "none") refreshClone();
    }, CLONE_REFRESH_MS);

    // Scroll events don't bubble, so listen in the capture phase to catch any inner scroll area.
    function handleScroll() {
      if (lens.style.display !== "none") syncScroll();
    }

    container.addEventListener("mouseenter", handleEnter);
    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", handleLeave);
    container.addEventListener("scroll", handleScroll, true);

    return () => {
      container.removeEventListener("mouseenter", handleEnter);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", handleLeave);
      container.removeEventListener("scroll", handleScroll, true);
      window.clearInterval(refreshTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.style.cursor = "";
      lens.remove();
    };
  }, [enabled, zoomFactor, lensSize]);

  return { enabled, setEnabled, containerRef };
}
