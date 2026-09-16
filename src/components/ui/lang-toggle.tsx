"use client";

import type { Lang } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LANGS: Lang[] = ["en", "tr"];

export function LangToggle({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-full border p-0.5 font-mono text-[11px] uppercase tracking-[0.14em]",
        tone === "dark" ? "border-white/15" : "border-graphite-300",
        className,
      )}
    >
      {LANGS.map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors duration-200",
              active
                ? "bg-emerald-500 text-graphite-950"
                : tone === "dark"
                  ? "text-graphite-300 hover:text-white"
                  : "text-graphite-500 hover:text-graphite-900",
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
