import { useSyncExternalStore } from "react";

/*
 * Hydration-safe replacement for motion's `useReducedMotion`.
 *
 * motion reads `matchMedia` straight into component state on the first client render, so a
 * visitor with "reduce motion" enabled hydrates different markup from what the server rendered
 * (one marquee copy instead of four, no contrails on the hero routes) and React discards the
 * server HTML. Reading the preference through useSyncExternalStore keeps the hydration render on
 * the server value (`null`, exactly what motion returns on the server) and delivers the real
 * preference in the re-render that follows — live, so a settings change is picked up too.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

let mql: MediaQueryList | null | undefined;

function media(): MediaQueryList | null {
  if (mql === undefined) {
    mql = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;
  }
  return mql;
}

function subscribe(onChange: () => void) {
  const m = media();
  if (!m) return () => {};
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}

const snapshot = (): boolean | null => media()?.matches ?? false;
const serverSnapshot = (): boolean | null => null;

/** `null` while rendering on the server and during hydration, then the visitor's reduced-motion preference. */
export function useReducedMotion(): boolean | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
