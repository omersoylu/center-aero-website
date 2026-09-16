"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { dictionary, type Dictionary, type Lang } from "./content";

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: Dictionary };

const LangContext = createContext<LangContextValue | null>(null);
const STORAGE_KEY = "center-aero-lang";

/* Tiny external store: the persisted language lives outside React, so hydration
   starts from the server default ("en") and switches to the saved choice on the client. */
const listeners = new Set<() => void>();
let cached: Lang | null = null;

function readLang(): Lang {
  if (cached) return cached;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    cached = saved === "tr" ? "tr" : "en";
  } catch {
    cached = "en";
  }
  return cached;
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function writeLang(next: Lang) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((cb) => cb());
}
const serverSnapshot = (): Lang => "en";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, serverSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => writeLang(next), []);
  const value = useMemo(() => ({ lang, setLang, t: dictionary[lang] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider>");
  return ctx;
}
